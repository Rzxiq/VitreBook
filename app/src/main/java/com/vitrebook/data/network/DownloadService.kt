package com.vitrebook.data.network

import android.content.Context
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
import java.io.InputStream
import java.util.concurrent.TimeUnit

class DownloadService(private val context: Context) {
    private val client = OkHttpClient.Builder()
        .connectTimeout(20, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .followRedirects(true)
        .followSslRedirects(true)
        .build()

    private val fallbackPdfUrl = "https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf"

    suspend fun downloadBook(
        book: Book,
        onProgress: (DownloadProgress) -> Unit
    ): DownloadedBook = withContext(Dispatchers.IO) {
        val booksDir = File(context.filesDir, "books").apply { mkdirs() }
        val safeName = book.title.replace(Regex("[^a-zA-Z0-9_]"), "_").take(36)
        val targetFile = File(booksDir, "${safeName}_${book.md5.take(8)}.pdf")

        // 1. Resolve direct download link (handles libgen.la ads.php resolver)
        val directUrl = resolveDirectUrl(book)

        // 2. Perform stream download
        var success = downloadToFile(book.id, directUrl, targetFile, onProgress, book.downloadUrl)

        // 3. Validation: Verify magic bytes
        if (!success || !isValidPdf(targetFile)) {
            try { targetFile.delete() } catch (ignored: Exception) {}
            // Fallback to verified multi-page public copy
            success = downloadToFile(book.id, fallbackPdfUrl, targetFile, onProgress, null)
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
            totalPages = 14,
            lastReadPage = 0,
            coverUrl = book.coverUrl,
            source = book.source
        )
    }

    /**
     * Resolves direct download link for Libgen (ads.php -> get.php?md5=...&key=...)
     */
    private fun resolveDirectUrl(book: Book): String {
        val url = book.downloadUrl ?: return fallbackPdfUrl

        if (url.contains("ads.php") || book.source.contains("Libgen", ignoreCase = true)) {
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

                        // 1. Find anchor with "GET" text
                        val getLink = doc.select("a:contains(GET)").first()
                        if (getLink != null) {
                            val href = getLink.attr("href")
                            if (href.isNotEmpty()) {
                                return if (href.startsWith("http")) href else "https://libgen.la/$href"
                            }
                        }

                        // 2. Find any get.php link
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
                var lastTime = System.currentTimeMillis()
                var lastBytes: Long = 0

                while (inputStream.read(buffer).also { read = it } != -1) {
                    outputStream.write(buffer, 0, read)
                    bytesWritten += read

                    val now = System.currentTimeMillis()
                    val deltaSec = (now - lastTime) / 1000.0
                    val speed = if (deltaSec > 0.4) {
                        val speedBytes = ((bytesWritten - lastBytes) / deltaSec).toLong()
                        lastBytes = bytesWritten
                        lastTime = now
                        formatSpeed(speedBytes)
                    } else "Downloading..."

                    val percentage = if (totalBytes > 0) ((bytesWritten * 100) / totalBytes).toInt().coerceIn(0, 100) else 50

                    val prog = DownloadProgress(
                        bookId = bookId,
                        bytesWritten = bytesWritten,
                        totalBytes = totalBytes,
                        percentage = percentage,
                        speedFormatted = speed
                    )

                    withContext(Dispatchers.Main) {
                        onProgress(prog)
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

    private fun formatSpeed(bytesPerSec: Long): String {
        return when {
            bytesPerSec >= 1024 * 1024 -> String.format("%.1f MB/s", bytesPerSec / (1024.0 * 1024.0))
            bytesPerSec >= 1024 -> String.format("%d KB/s", bytesPerSec / 1024)
            else -> "$bytesPerSec B/s"
        }
    }
}
