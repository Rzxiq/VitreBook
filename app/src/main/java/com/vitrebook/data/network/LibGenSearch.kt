package com.vitrebook.data.network

import com.vitrebook.data.model.Book
import okhttp3.HttpUrl
import okhttp3.OkHttpClient
import okhttp3.Request
import org.jsoup.Jsoup
import java.io.IOException
import java.security.MessageDigest
import java.util.concurrent.TimeUnit

/**
 * Searches LibGen for edition metadata only. Results intentionally do not contain a download URL.
 */
object LibGenSearch {
    private const val BASE_URL = "https://libgen.la"
    private const val USER_AGENT = SearchEngine.USER_AGENT
    private val validYear = Regex("(1[5-9]\\d{2}|20\\d{2}|2100)")

    private val client = OkHttpClient.Builder()
        .connectTimeout(12, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .callTimeout(20, TimeUnit.SECONDS)
        .followRedirects(true)
        .build()

    /** Builds the site search URL. Exposed internally so query encoding can be unit-tested. */
    internal fun buildSearchUrl(query: String, limit: Int = 20): HttpUrl =
        HttpUrl.Builder()
            .scheme("https")
            .host("libgen.la")
            .addPathSegment("index.php")
            .addQueryParameter("req", query)
            .apply {
                listOf("t", "a", "p", "y", "l", "s", "f").forEach {
                    addQueryParameter("columns[]", it)
                }
                addQueryParameter("objects[]", "f")
                addQueryParameter("topics[]", "libgen")
                addQueryParameter("res", limit.coerceIn(1, 100).toString())
                addQueryParameter("filesuns", "all")
                addQueryParameter("curtab", "def")
            }
            .build()

    /** Searches for edition metadata; it never resolves or downloads a book file. */
    fun search(query: String, limit: Int = 20): List<Book> {
        val cleanQuery = query.trim()
        if (cleanQuery.isEmpty() || limit <= 0) return emptyList()

        val request = Request.Builder()
            .url(buildSearchUrl(cleanQuery, limit))
            .header("User-Agent", USER_AGENT)
            .header("Accept", "text/html,application/xhtml+xml")
            .build()

        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                throw IOException("LibGen search returned HTTP ${response.code}")
            }
            val html = response.body?.string() ?: return emptyList()
            return parseSearchResults(html, limit)
        }
    }

    /** Parses a LibGen search page into metadata-only VitreBook records. */
    fun parseSearchResults(html: String, limit: Int = 20): List<Book> {
        if (limit <= 0) return emptyList()

        val document = Jsoup.parse(html, "$BASE_URL/")
        val results = mutableListOf<Book>()

        for (table in document.select("table")) {
            val headers = table.select("th")
                .map { cleanText(it.text()).orEmpty() }
            if (headers.isEmpty()) continue

            for (rowElement in table.select("tr")) {
                val cells = rowElement.select("td")
                if (cells.size < 3) continue

                val values = cells.map { cleanText(it.text()) }
                val row = linkedMapOf<String, String>()
                values.forEachIndexed { index, value ->
                    if (index < headers.size && !value.isNullOrBlank()) {
                        row[headers[index].ifBlank { "column_$index" }] = value
                    }
                }

                val title = getValue(row, "title", "book", "name")
                    ?: values.firstOrNull { !it.isNullOrBlank() }
                    ?: continue
                if (title.equals("title", ignoreCase = true) ||
                    title.equals("name", ignoreCase = true) ||
                    title.equals("book title", ignoreCase = true)
                ) continue

                val editionUrl = rowElement.select("a[href]")
                    .firstOrNull { it.attr("href").contains("edition.php", ignoreCase = true) }
                    ?.absUrl("href")
                    ?.takeIf { it.startsWith("https://", ignoreCase = true) || it.startsWith("http://", ignoreCase = true) }

                val coverUrl = rowElement.selectFirst("img[src], img[data-src]")?.let { image ->
                    val absolute = image.absUrl(if (image.hasAttr("src")) "src" else "data-src")
                    absolute.takeIf { it.startsWith("https://", ignoreCase = true) || it.startsWith("http://", ignoreCase = true) }
                }

                val yearValue = getValue(row, "year")?.takeIf { validYear.matches(it) }.orEmpty()
                val pagesValue = getValue(row, "pages")?.takeIf { it.matches(Regex("\\d+")) } ?: "Unknown"
                val author = getValue(row, "author") ?: "Unknown Author"
                val identity = editionUrl ?: "$title|$author|$yearValue"
                val stableId = sha256(identity).take(24)

                results += Book(
                    id = "libgen_$stableId",
                    title = title,
                    author = author,
                    publisher = getValue(row, "publisher") ?: "Unknown publisher",
                    year = yearValue,
                    pages = pagesValue,
                    language = getValue(row, "language", "lang") ?: "Unknown",
                    size = getValue(row, "size") ?: "Unknown",
                    extension = (getValue(row, "extension", "format") ?: "unknown").lowercase(),
                    coverUrl = coverUrl,
                    md5 = "libgen_metadata_$stableId",
                    source = "LibGen metadata",
                    description = "Metadata-only record from LibGen. VitreBook does not download this item; confirm that any copy you access is lawful in your jurisdiction.",
                    downloadUrl = null,
                    editionPageUrl = editionUrl
                )

                if (results.size >= limit) return results
            }
        }

        return results
    }

    private fun getValue(row: Map<String, String>, vararg names: String): String? {
        for (name in names) {
            val match = row.entries.firstOrNull { (key, value) ->
                key.contains(name, ignoreCase = true) && value.isNotBlank()
            }?.value
            if (match != null) return match
        }
        return null
    }

    private fun cleanText(value: String?): String? =
        value?.replace(Regex("\\s+"), " ")?.trim()?.takeIf { it.isNotEmpty() }

    private fun sha256(value: String): String = MessageDigest.getInstance("SHA-256")
        .digest(value.toByteArray(Charsets.UTF_8))
        .joinToString("") { byte -> (byte.toInt() and 0xff).toString(16).padStart(2, '0') }
}
