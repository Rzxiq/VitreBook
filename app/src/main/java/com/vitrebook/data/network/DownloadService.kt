package com.vitrebook.data.network

import android.content.Context
import android.graphics.pdf.PdfRenderer
import android.os.ParcelFileDescriptor
import com.vitrebook.data.model.Book
import com.vitrebook.data.model.DownloadedBook
import com.vitrebook.data.model.DownloadProgress
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.jsoup.Jsoup
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.io.InputStream
import java.util.concurrent.TimeUnit

class DownloadService(private val context: Context) {
    private val client = OkHttpClient.Builder()
        .connectTimeout(25, TimeUnit.SECONDS)
        .readTimeout(90, TimeUnit.SECONDS)
        .followRedirects(true)
        .followSslRedirects(true)
        .build()

    suspend fun downloadBook(
        book: Book,
        onProgress: (DownloadProgress) -> Unit
    ): DownloadedBook = withContext(Dispatchers.IO) {
        val booksDir = File(context.filesDir, "books").apply { mkdirs() }
        val safeName = book.title.replace(Regex("[^a-zA-Z0-9_]"), "_").take(36)
        val targetFile = File(booksDir, "${safeName}_${book.md5.take(8)}.pdf")

        // 1. Resolve direct download link
        val directUrl = resolveDirectUrl(book)

        // 2. Perform stream download
        val success = downloadToFile(book.id, directUrl, targetFile, onProgress, book.downloadUrl)

        // 3. Validation: Verify magic bytes (%PDF-)
        if (!success || !isValidPdf(targetFile)) {
            try { targetFile.delete() } catch (ignored: Exception) {}
            throw IOException("Download failed or document stream corrupted for: ${book.title}")
        }

        // 4. Calculate actual total page count from real downloaded PDF
        val calculatedPages = try {
            val pfd = ParcelFileDescriptor.open(targetFile, ParcelFileDescriptor.MODE_READ_ONLY)
            val renderer = PdfRenderer(pfd)
            val count = renderer.pageCount
            renderer.close()
            pfd.close()
            if (count > 0) count else (book.pages.toIntOrNull() ?: 100)
        } catch (e: Exception) {
            book.pages.toIntOrNull() ?: 100
        }

        DownloadedBook(
            id = book.id,
            md5 = book.md5,
            title = book.title,
            author = book.author,
            localFilePath = targetFile.absolutePath,
            fileSize = targetFile.length(),
            extension = "pdf",
            downloadedAt = System.currentTimeMillis(),
            totalPages = calculatedPages,
            lastReadPage = 0,
            coverUrl = book.coverUrl,
            source = book.source
        )
    }

    /**
     * Resolves direct download link for Libgen or direct PDF links
     */
    private fun resolveDirectUrl(book: Book): String {
        val url = book.downloadUrl ?: throw IOException("No download URL available for ${book.title}")

        // Direct PDF links (PlanetPublish / public archives) require no resolution
        if (url.endsWith(".pdf", ignoreCase = true) || (!url.contains("ads.php") && !url.contains("libgen"))) {
            return url
        }

        // Libgen ads.php resolver
        val resolverUrls = listOf(
            url,
            "https://libgen.la/ads.php?md5=${book.md5}",
            "https://libgen.li/ads.php?md5=${book.md5}"
        )

        for (resolver in resolverUrls) {
            try {
                val request = Request.Builder()
                    .url(resolver)
                    .header("User-Agent", SearchEngine.USER_AGENT)
                    .build()

                client.newCall(request).execute().use { response ->
                    if (!response.isSuccessful) return@use
                    val html = response.body?.string() ?: return@use
                    val doc = Jsoup.parse(html)

                    // Find GET download anchor
                    val getLink = doc.select("a:contains(GET)").first()
                    if (getLink != null) {
                        val href = getLink.attr("href")
                        if (href.isNotEmpty()) {
                            return if (href.startsWith("http")) href else "https://libgen.la/$href"
                        }
                    }

                    // Find any get.php anchor
                    val altLink = doc.select("a[href*='get.php']").first()
                    if (altLink != null) {
                        val href = altLink.attr("href")
                        if (href.isNotEmpty()) {
                            return if (href.startsWith("http")) href else "https://libgen.la/$href"
                        }
                    }
                }
            } catch (ignored: Exception) {}
        }

        return url
    }

    private suspend fun downloadToFile(
        bookId: String,
        url: String,
        file: File,
        onProgress: (DownloadProgress) -> Unit,
        referer: String?
    ): Boolean {
        try {
            val requestBuilder = Request.Builder()
                .url(url)
                .header("User-Agent", SearchEngine.USER_AGENT)
                .header("Accept", "application/pdf,application/octet-stream,*/*")

            if (!referer.isNullOrEmpty()) {
                requestBuilder.header("Referer", referer)
            }

            client.newCall(requestBuilder.build()).execute().use { response ->
                if (!response.isSuccessful) return false
                val body = response.body ?: return false
                val totalBytes = body.contentLength()

                val inputStream: InputStream = body.byteStream()
                val outputStream = FileOutputStream(file)
                val buffer = ByteArray(16 * 1024)
                var bytesWritten: Long = 0
                var read: Int
                var lastProgressUpdate = 0L

                while (inputStream.read(buffer).also { read = it } != -1) {
                    outputStream.write(buffer, 0, read)
                    bytesWritten += read

                    val now = System.currentTimeMillis()
                    if (now - lastProgressUpdate > 150) {
                        lastProgressUpdate = now
                        val pct = if (totalBytes > 0) ((bytesWritten * 100) / totalBytes).toInt() else 50
                        val progress = DownloadProgress(
                            bookId = bookId,
                            bytesWritten = bytesWritten,
                            totalBytes = totalBytes,
                            percentage = pct.coerceIn(0, 100),
                            speedFormatted = "${bytesWritten / (1024 * 1024)} MB"
                        )
                        withContext(Dispatchers.Main) {
                            onProgress(progress)
                        }
                    }
                }

                outputStream.flush()
                outputStream.close()
                inputStream.close()
                return file.exists() && file.length() > 500
            }
        } catch (e: Exception) {
            return false
        }
    }

    private fun isValidPdf(file: File): Boolean {
        if (!file.exists() || file.length() < 500) return false
        return try {
            val bytes = ByteArray(5)
            file.inputStream().use { it.read(bytes) }
            String(bytes) == "%PDF-"
        } catch (e: Exception) {
            false
        }
    }
}
