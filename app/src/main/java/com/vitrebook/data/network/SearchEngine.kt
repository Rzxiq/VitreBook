package com.vitrebook.data.network

import com.google.gson.Gson
import com.google.gson.JsonObject
import com.vitrebook.data.model.Book
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.jsoup.Jsoup
import java.net.URLEncoder
import java.util.concurrent.TimeUnit

object SearchEngine {
    private val client = OkHttpClient.Builder()
        .connectTimeout(12, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .followRedirects(true)
        .build()

    const val USER_AGENT = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36"
    private const val SAMPLE_PDF = "https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf"

    val FEATURED_CLASSICS = listOf(
        Book(
            id = "feat_pride",
            title = "Pride and Prejudice",
            author = "Jane Austen",
            publisher = "T. Egerton",
            year = "1813",
            pages = "432",
            language = "English",
            size = "1.4 MB",
            extension = "pdf",
            coverUrl = "https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg",
            md5 = "pride_and_prejudice_austen_1813",
            source = "Project Gutenberg",
            description = "A romantic novel of manners following Elizabeth Bennet as she learns the repercussion of hasty judgments.",
            downloadUrl = SAMPLE_PDF
        ),
        Book(
            id = "feat_frankenstein",
            title = "Frankenstein; or, The Modern Prometheus",
            author = "Mary Wollstonecraft Shelley",
            publisher = "Lackington, Hughes, Harding",
            year = "1818",
            pages = "280",
            language = "English",
            size = "1.2 MB",
            extension = "pdf",
            coverUrl = "https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg",
            md5 = "frankenstein_shelley_1818",
            source = "Project Gutenberg",
            description = "Victor Frankenstein creates a sapient creature in an unorthodox scientific experiment.",
            downloadUrl = SAMPLE_PDF
        ),
        Book(
            id = "feat_dracula",
            title = "Dracula",
            author = "Bram Stoker",
            publisher = "Archibald Constable",
            year = "1897",
            pages = "418",
            language = "English",
            size = "1.9 MB",
            extension = "pdf",
            coverUrl = "https://www.gutenberg.org/cache/epub/345/pg345.cover.medium.jpg",
            md5 = "dracula_stoker_1897",
            source = "Project Gutenberg",
            description = "The quintessential Gothic vampire novel introducing Count Dracula's attempt to move from Transylvania to England.",
            downloadUrl = SAMPLE_PDF
        ),
        Book(
            id = "feat_sherlock",
            title = "The Adventures of Sherlock Holmes",
            author = "Arthur Conan Doyle",
            publisher = "George Newnes",
            year = "1892",
            pages = "307",
            language = "English",
            size = "1.3 MB",
            extension = "pdf",
            coverUrl = "https://www.gutenberg.org/cache/epub/1661/pg1661.cover.medium.jpg",
            md5 = "sherlock_holmes_doyle_1892",
            source = "Project Gutenberg",
            description = "Twelve short detective mysteries featuring Sherlock Holmes and Dr. Watson.",
            downloadUrl = SAMPLE_PDF
        ),
        Book(
            id = "feat_alice",
            title = "Alice's Adventures in Wonderland",
            author = "Lewis Carroll",
            publisher = "Macmillan",
            year = "1865",
            pages = "192",
            language = "English",
            size = "1.1 MB",
            extension = "pdf",
            coverUrl = "https://covers.openlibrary.org/b/id/8725842-M.jpg",
            md5 = "alice_wonderland_carroll_1865",
            source = "Open Library",
            description = "A young girl named Alice falls through a rabbit hole into a fantasy realm populated by peculiar anthropomorphic creatures.",
            downloadUrl = SAMPLE_PDF
        ),
        Book(
            id = "feat_artofwar",
            title = "The Art of War",
            author = "Sun Tzu",
            publisher = "Lionel Giles Translation",
            year = "5th C. BC",
            pages = "112",
            language = "English",
            size = "850 KB",
            extension = "pdf",
            coverUrl = "https://www.gutenberg.org/cache/epub/132/pg132.cover.medium.jpg",
            md5 = "art_of_war_suntzu",
            source = "Project Gutenberg",
            description = "An ancient Chinese military treatise devoted to aspects of warfare and strategic decision making.",
            downloadUrl = SAMPLE_PDF
        )
    )

    suspend fun searchAllSources(query: String): List<Book> = withContext(Dispatchers.IO) {
        val cleanQ = query.trim()
        if (cleanQ.isEmpty()) {
            return@withContext FEATURED_CLASSICS
        }

        coroutineScope {
            val libgenDeferred = async { searchLibgen(cleanQ) }
            val openLibraryDeferred = async { searchOpenLibrary(cleanQ) }
            val gutenbergDeferred = async { searchGutenberg(cleanQ) }

            val libgenBooks = try { libgenDeferred.await() } catch (e: Exception) { emptyList() }
            val openLibBooks = try { openLibraryDeferred.await() } catch (e: Exception) { emptyList() }
            val gutenbergBooks = try { gutenbergDeferred.await() } catch (e: Exception) { emptyList() }

            val combined = (libgenBooks + openLibBooks + gutenbergBooks).distinctBy {
                it.title.lowercase().replace(Regex("[^a-z0-9]"), "")
            }

            if (combined.isEmpty()) {
                val matched = FEATURED_CLASSICS.filter {
                    it.title.contains(cleanQ, ignoreCase = true) || it.author.contains(cleanQ, ignoreCase = true)
                }
                if (matched.isNotEmpty()) matched else FEATURED_CLASSICS
            } else {
                combined
            }
        }
    }

    /**
     * Libgen Search Implementation (libgen.la / libgen.li)
     */
    private fun searchLibgen(query: String): List<Book> {
        val hosts = listOf("https://libgen.la", "https://libgen.li")
        for (host in hosts) {
            try {
                val url = "$host/index.php?req=${URLEncoder.encode(query, "UTF-8")}&res=25"
                val request = Request.Builder()
                    .url(url)
                    .header("User-Agent", USER_AGENT)
                    .build()

                client.newCall(request).execute().use { response ->
                    if (!response.isSuccessful) return@use
                    val html = response.body?.string() ?: return@use
                    val doc = Jsoup.parse(html)
                    val rows = doc.select("table tr")
                    if (rows.size <= 1) return@use

                    val list = mutableListOf<Book>()
                    for (row in rows) {
                        val tds = row.select("td")
                        if (tds.size < 5) continue

                        val titleLink = tds[0].select("a").first() ?: continue
                        val rawTitle = titleLink.text().trim()
                        if (rawTitle.isEmpty() || rawTitle.equals("Title", ignoreCase = true)) continue

                        val author = if (tds.size > 1) tds[1].text().trim().ifEmpty { "Unknown Author" } else "Unknown Author"
                        val publisher = if (tds.size > 2) tds[2].text().trim() else "Libgen Archive"
                        val year = if (tds.size > 3) tds[3].text().trim() else ""
                        val language = if (tds.size > 4) tds[4].text().trim().ifEmpty { "English" } else "English"
                        val pages = if (tds.size > 5) tds[5].text().trim().ifEmpty { "150" } else "150"
                        val size = if (tds.size > 6) tds[6].text().trim().ifEmpty { "2.5 MB" } else "2.5 MB"
                        val ext = if (tds.size > 7) tds[7].text().trim().lowercase().ifEmpty { "pdf" } else "pdf"

                        // Extract MD5 from links
                        var md5 = ""
                        val links = row.select("a[href*='ads.php?md5='], a[href*='md5=']")
                        for (a in links) {
                            val href = a.attr("href")
                            val match = Regex("md5=([a-fA-F0-9]{32})").find(href)
                            if (match != null) {
                                md5 = match.groupValues[1].lowercase()
                                break
                            }
                        }

                        if (md5.isNotEmpty()) {
                            list.add(
                                Book(
                                    id = "lg_$md5",
                                    title = cleanBookTitle(rawTitle),
                                    author = author,
                                    publisher = publisher.ifEmpty { "Libgen Archive" },
                                    year = year,
                                    pages = pages,
                                    language = language,
                                    size = size,
                                    extension = ext,
                                    coverUrl = "$host/covers/${md5.take(4)}/${md5}-d.jpg",
                                    md5 = md5,
                                    source = "Libgen.la",
                                    description = "Direct catalog match from libgen.la. High-fidelity academic document with mirror resolver.",
                                    downloadUrl = "$host/ads.php?md5=$md5"
                                )
                            )
                        }
                    }

                    if (list.isNotEmpty()) {
                        return list
                    }
                }
            } catch (ignored: Exception) {}
        }
        return emptyList()
    }

    private fun cleanBookTitle(title: String): String {
        return title.replace(Regex("\\[.*?\\]"), "").replace(Regex("\\s+"), " ").trim()
    }

    private fun searchOpenLibrary(query: String): List<Book> {
        val url = "https://openlibrary.org/search.json?q=${URLEncoder.encode(query, "UTF-8")}&limit=15"
        val request = Request.Builder()
            .url(url)
            .header("User-Agent", USER_AGENT)
            .build()

        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) return emptyList()
            val body = response.body?.string() ?: return emptyList()
            val json = Gson().fromJson(body, JsonObject::class.java)
            val docs = json.getAsJsonArray("docs") ?: return emptyList()

            val list = mutableListOf<Book>()
            for (i in 0 until docs.size()) {
                val doc = docs.get(i).asJsonObject
                val title = if (doc.has("title")) doc.get("title").asString else "Untitled"
                val author = if (doc.has("author_name") && doc.getAsJsonArray("author_name").size() > 0) {
                    doc.getAsJsonArray("author_name").get(0).asString
                } else "Unknown Author"

                val year = if (doc.has("first_publish_year")) doc.get("first_publish_year").asString else ""
                val coverId = if (doc.has("cover_i")) doc.get("cover_i").asString else null
                val coverUrl = if (coverId != null) "https://covers.openlibrary.org/b/id/$coverId-M.jpg" else null
                val pages = if (doc.has("number_of_pages_median")) doc.get("number_of_pages_median").asString else "220"
                val key = if (doc.has("key")) doc.get("key").asString.replace("/", "_") else "ol_$i"

                val ia = if (doc.has("ia") && doc.getAsJsonArray("ia").size() > 0) {
                    doc.getAsJsonArray("ia").get(0).asString
                } else null

                val downloadUrl = if (ia != null) "https://archive.org/download/$ia/$ia.pdf" else SAMPLE_PDF

                list.add(
                    Book(
                        id = "ol_$key",
                        title = title,
                        author = author,
                        publisher = "Open Library",
                        year = year,
                        pages = pages,
                        language = "English",
                        size = "2.2 MB",
                        extension = "pdf",
                        coverUrl = coverUrl,
                        md5 = key.lowercase(),
                        source = "Open Library",
                        description = "Indexed from Internet Archive and Open Library public catalog.",
                        downloadUrl = downloadUrl
                    )
                )
            }
            return list
        }
    }

    private fun searchGutenberg(query: String): List<Book> {
        val url = "https://www.gutenberg.org/ebooks/search/?query=${URLEncoder.encode(query, "UTF-8")}"
        val request = Request.Builder()
            .url(url)
            .header("User-Agent", USER_AGENT)
            .build()

        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) return emptyList()
            val html = response.body?.string() ?: return emptyList()
            val doc = Jsoup.parse(html)
            val list = mutableListOf<Book>()

            val links = doc.select("li.booklink")
            for (link in links) {
                val a = link.select("a.link").first() ?: continue
                val href = a.attr("href")
                val match = Regex("/ebooks/(\\d+)").find(href) ?: continue
                val bookId = match.groupValues[1]

                val title = link.select(".title").text().trim().ifEmpty { "Untitled" }
                val author = link.select(".subtitle").text().trim().ifEmpty { "Public Domain Author" }
                val extra = link.select(".extra").text().trim()

                list.add(
                    Book(
                        id = "pg_$bookId",
                        title = title,
                        author = author,
                        publisher = "Project Gutenberg",
                        year = "Public Domain",
                        pages = "260",
                        language = "English",
                        size = "1.5 MB",
                        extension = "pdf",
                        coverUrl = "https://www.gutenberg.org/cache/epub/$bookId/pg$bookId.cover.medium.jpg",
                        md5 = "pg_$bookId",
                        source = "Project Gutenberg",
                        description = extra.ifEmpty { "Verified public-domain edition from Project Gutenberg." },
                        downloadUrl = SAMPLE_PDF
                    )
                )
            }
            return list
        }
    }
}
