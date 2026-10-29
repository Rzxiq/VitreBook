package com.vitrebook.data.network

import android.content.Context
import android.graphics.pdf.PdfRenderer
import android.os.ParcelFileDescriptor
import android.util.Log
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
import java.net.URI
import java.util.concurrent.TimeUnit

class DownloadService(private val context: Context) {
    companion object {
        private const val TAG = "DownloadService"
    }

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
        val ext = if (book.extension.isNotBlank()) book.extension.lowercase() else "pdf"
        val targetFile = File(booksDir, "${safeName}_${book.md5.take(8)}.$ext")

        Log.d(TAG, "Initiating download for '${book.title}' format=$ext")

        // 1. Resolve direct download link
        val directUrl = resolveDirectUrl(book)

        // 2. Perform stream download
        val success = downloadToFile(book.id, directUrl, targetFile, onProgress, book.downloadUrl)

        // 3. Validation: Verify file signature
        if (!success || !isValidDocument(targetFile, ext)) {
            try { targetFile.delete() } catch (ignored: Exception) {}
            Log.e(TAG, "Validation failed or file corrupted for: ${book.title}")
            throw IOException("Download failed or document stream corrupted for: ${book.title}")
        }

        // 4. Calculate actual total page count if PDF
        val calculatedPages = if (ext.equals("pdf", ignoreCase = true)) {
            try {
                val pfd = ParcelFileDescriptor.open(targetFile, ParcelFileDescriptor.MODE_READ_ONLY)
                val renderer = PdfRenderer(pfd)
                val count = renderer.pageCount
                renderer.close()
                pfd.close()
                if (count > 0) count else (book.pages.toIntOrNull() ?: 100)
            } catch (e: Exception) {
                Log.w(TAG, "PdfRenderer could not read pages for ${book.title}: ${e.message}")
                book.pages.toIntOrNull() ?: 100
            }
        } else {
            book.pages.toIntOrNull() ?: 100
        }

        Log.d(TAG, "Download and verification complete: ${targetFile.name} size=${targetFile.length()} bytes, pages=$calculatedPages")

        DownloadedBook(
            id = book.id,
            md5 = book.md5,
            title = book.title,
            author = book.author,
            localFilePath = targetFile.absolutePath,
            fileSize = targetFile.length(),
            extension = ext,
            downloadedAt = System.currentTimeMillis(),
            totalPages = calculatedPages,
            lastReadPage = 0,
            coverUrl = book.coverUrl,
            source = book.source
        )
    }

    /**
     * Resolves direct download link for verified open repositories or direct links
     */
    fun resolveDirectUrl(book: Book): String {
        val url = book.downloadUrl ?: throw IOException("No download URL available for ${book.title}")

        // Direct download links (PlanetPublish, Gutenberg direct files, public archives)
        if (url.endsWith(".pdf", ignoreCase = true) ||
            url.endsWith(".epub", ignoreCase = true) ||
            url.endsWith(".zip", ignoreCase = true) ||
            url.contains("planetpublish.com") ||
            url.contains("gutenberg.org")) {
            return url
        }

        // HTML mirror resolver with safe base URL resolution
        try {
            val request = Request.Builder()
                .url(url)
                .header("User-Agent", SearchEngine.USER_AGENT)
                .build()

            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) return url
                val html = response.body?.string() ?: return url
                val doc = Jsoup.parse(html)
                val baseUri = URI(response.request.url.toString())

                // Look for direct download anchors
                val downloadAnchor = doc.select("a:contains(GET), a[href*='download'], a[href*='get.php']").first()
                if (downloadAnchor != null) {
                    val href = downloadAnchor.attr("href")
                    if (href.isNotEmpty()) {
                        return baseUri.resolve(href).toString()
                    }
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Mirror page resolution failed for ${book.title}: ${e.message}")
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
                .header("Accept", "application/pdf,application/epub+zip,application/octet-stream,*/*")

            if (!referer.isNullOrEmpty()) {
                requestBuilder.header("Referer", referer)
            }

            client.newCall(requestBuilder.build()).execute().use { response ->
                if (!response.isSuccessful) {
                    Log.w(TAG, "HTTP error ${response.code} downloading from $url")
                    return false
                }

                val body = response.body ?: return false
                val contentType = response.header("Content-Type")?.lowercase() ?: ""
                if (contentType.contains("text/html") && !url.endsWith(".html", ignoreCase = true)) {
                    Log.w(TAG, "Server returned HTML content-type ($contentType) instead of document binary")
                    return false
                }

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
            Log.e(TAG, "Exception during download stream", e)
            return false
        }
    }

    fun isValidDocument(file: File, extension: String): Boolean {
        if (!file.exists() || file.length() < 500) return false
        return try {
            val bytes = ByteArray(5)
            file.inputStream().use { it.read(bytes) }
            val header = String(bytes)
            if (extension.equals("pdf", ignoreCase = true)) {
                header.startsWith("%PDF-")
            } else if (extension.equals("epub", ignoreCase = true) || extension.equals("zip", ignoreCase = true)) {
                bytes[0] == 0x50.toByte() && bytes[1] == 0x4B.toByte() // PK zip header
            } else {
                file.length() > 500
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error validating document file signature", e)
            false
        }
    }
}
