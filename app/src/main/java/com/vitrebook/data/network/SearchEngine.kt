package com.vitrebook.data.network

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

    val FEATURED_CLASSICS: List<Book> = listOf(
        Book(
            id = "feat_pride",
            title = "Pride and Prejudice",
            author = "Jane Austen",
            publisher = "T. Egerton",
            year = "1813",
            pages = "432",
            language = "English",
            size = "1.5 MB",
            extension = "pdf",
            coverUrl = "https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg",
            md5 = "pride_and_prejudice_austen_1813",
            source = "Direct PDF Archive",
            description = "A romantic novel of manners following Elizabeth Bennet as she learns the repercussion of hasty judgments.",
            downloadUrl = "https://www.planetpublish.com/wp-content/uploads/2011/11/Pride_and_Prejudice_NT.pdf"
        ),
        Book(
            id = "feat_frankenstein",
            title = "Frankenstein; or, The Modern Prometheus",
            author = "Mary Wollstonecraft Shelley",
            publisher = "Lackington, Hughes, Harding",
            year = "1818",
            pages = "280",
            language = "English",
            size = "880 KB",
            extension = "pdf",
            coverUrl = "https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg",
            md5 = "frankenstein_shelley_1818",
            source = "Direct PDF Archive",
            description = "Victor Frankenstein creates a sapient creature in an unorthodox scientific experiment.",
            downloadUrl = "https://www.planetpublish.com/wp-content/uploads/2011/11/Frankenstein_NT.pdf"
        ),
        Book(
            id = "feat_dracula",
            title = "Dracula",
            author = "Bram Stoker",
            publisher = "Archibald Constable",
            year = "1897",
            pages = "418",
            language = "English",
            size = "1.7 MB",
            extension = "pdf",
            coverUrl = "https://www.gutenberg.org/cache/epub/345/pg345.cover.medium.jpg",
            md5 = "dracula_stoker_1897",
            source = "Direct PDF Archive",
            description = "The quintessential Gothic vampire novel introducing Count Dracula's attempt to move from Transylvania to England.",
            downloadUrl = "https://www.planetpublish.com/wp-content/uploads/2011/11/Dracula_NT.pdf"
        ),
        Book(
            id = "feat_sherlock",
            title = "The Hound of the Baskervilles",
            author = "Arthur Conan Doyle",
            publisher = "George Newnes",
            year = "1902",
            pages = "256",
            language = "English",
            size = "740 KB",
            extension = "pdf",
            coverUrl = "https://www.gutenberg.org/cache/epub/2852/pg2852.cover.medium.jpg",
            md5 = "hound_baskervilles_doyle_1902",
            source = "Direct PDF Archive",
            description = "Sherlock Holmes and Dr. Watson investigate the legend of a terrifying, diabolical hound haunting Dartmoor.",
            downloadUrl = "https://www.planetpublish.com/wp-content/uploads/2011/11/The_Hound_of_the_Baskervilles_NT.pdf"
        ),
        Book(
            id = "feat_dorian",
            title = "The Picture of Dorian Gray",
            author = "Oscar Wilde",
            publisher = "Ward, Lock and Company",
            year = "1890",
            pages = "250",
            language = "English",
            size = "640 KB",
            extension = "pdf",
            coverUrl = "https://www.gutenberg.org/cache/epub/174/pg174.cover.medium.jpg",
            md5 = "dorian_gray_wilde_1890",
            source = "Direct PDF Archive",
            description = "A philosophical novel of aestheticism, moral duplicity, and a supernatural portrait that ages in place of its owner.",
            downloadUrl = "https://www.planetpublish.com/wp-content/uploads/2011/11/The_Picture_of_Dorian_Gray_NT.pdf"
        ),
        Book(
            id = "feat_prince",
            title = "The Prince",
            author = "Niccolò Machiavelli",
            publisher = "Antonio Blado d'Asola",
            year = "1532",
            pages = "140",
            language = "English",
            size = "620 KB",
            extension = "pdf",
            coverUrl = "https://www.gutenberg.org/cache/epub/1232/pg1232.cover.medium.jpg",
            md5 = "the_prince_machiavelli_1532",
            source = "Direct PDF Archive",
            description = "A practical treatise on statecraft, political realism, and acquiring power in renaissance Italy.",
            downloadUrl = "https://www.planetpublish.com/wp-content/uploads/2011/11/The_Prince_NT.pdf"
        )
    )

    val TOP_10_TODAY: List<Book> = listOf(
        FEATURED_CLASSICS[0], // Pride and Prejudice
        FEATURED_CLASSICS[1], // Frankenstein
        Book(
            id = "top_timemachine",
            title = "The Time Machine",
            author = "H. G. Wells",
            publisher = "Heinemann",
            year = "1895",
            pages = "118",
            language = "English",
            size = "410 KB",
            extension = "pdf",
            coverUrl = "https://www.gutenberg.org/cache/epub/35/pg35.cover.medium.jpg",
            md5 = "time_machine_wells_1895",
            source = "Direct PDF Archive",
            description = "A Victorian scientist travels into the far future year 802,701 AD to discover humanity divided into Eloi and Morlocks.",
            downloadUrl = "https://www.planetpublish.com/wp-content/uploads/2011/11/The_Time_Machine_NT.pdf"
        ),
        FEATURED_CLASSICS[2], // Dracula
        Book(
            id = "top_crime_punish",
            title = "Crime and Punishment",
            author = "Fyodor Dostoevsky",
            publisher = "The Russian Messenger",
            year = "1866",
            pages = "545",
            language = "English",
            size = "2.4 MB",
            extension = "pdf",
            coverUrl = "https://www.gutenberg.org/cache/epub/2554/pg2554.cover.medium.jpg",
            md5 = "crime_punishment_dostoevsky",
            source = "Direct PDF Archive",
            description = "A destitute former student in Saint Petersburg struggles with moral torment and guilt after committing murder.",
            downloadUrl = "https://www.planetpublish.com/wp-content/uploads/2011/11/Crime_and_Punishment_NT.pdf"
        ),
        FEATURED_CLASSICS[3], // The Hound of the Baskervilles
        Book(
            id = "top_warworlds",
            title = "The War of the Worlds",
            author = "H. G. Wells",
            publisher = "William Heinemann",
            year = "1898",
            pages = "288",
            language = "English",
            size = "720 KB",
            extension = "pdf",
            coverUrl = "https://www.gutenberg.org/cache/epub/36/pg36.cover.medium.jpg",
            md5 = "war_of_the_worlds_wells",
            source = "Direct PDF Archive",
            description = "One of the earliest stories detailing a cataclysmic conflict between mankind and an extraterrestrial race from Mars.",
            downloadUrl = "https://www.planetpublish.com/wp-content/uploads/2011/11/The_War_of_the_Worlds_NT.pdf"
        ),
        FEATURED_CLASSICS[5], // The Prince
        Book(
            id = "top_mobydick",
            title = "Moby Dick; or, The Whale",
            author = "Herman Melville",
            publisher = "Harper & Brothers",
            year = "1851",
            pages = "635",
            language = "English",
            size = "2.6 MB",
            extension = "pdf",
            coverUrl = "https://www.gutenberg.org/cache/epub/2701/pg2701.cover.medium.jpg",
            md5 = "moby_dick_melville_1851",
            source = "Direct PDF Archive",
            description = "The sailor Ishmael narrates the obsessive quest of Captain Ahab for revenge against the giant white sperm whale Moby Dick.",
            downloadUrl = "https://www.planetpublish.com/wp-content/uploads/2011/11/Moby_Dick_NT.pdf"
        ),
        FEATURED_CLASSICS[4] // The Picture of Dorian Gray
    )

    val SCIFI_SHELF: List<Book> = listOf(
        FEATURED_CLASSICS[1], // Frankenstein
        TOP_10_TODAY[2], // The Time Machine
        TOP_10_TODAY[6], // The War of the Worlds
        Book(
            id = "scifi_two_cities",
            title = "A Tale of Two Cities",
            author = "Charles Dickens",
            publisher = "Chapman & Hall",
            year = "1859",
            pages = "448",
            language = "English",
            size = "1.5 MB",
            extension = "pdf",
            coverUrl = "https://www.gutenberg.org/cache/epub/98/pg98.cover.medium.jpg",
            md5 = "tale_two_cities_dickens",
            source = "Direct PDF Archive",
            description = "Set in London and Paris before and during the French Revolution, exploring self-sacrifice, rebirth, and tyranny.",
            downloadUrl = "https://www.planetpublish.com/wp-content/uploads/2011/11/A_Tale_of_Two_Cities_NT.pdf"
        ),
        Book(
            id = "scifi_expectations",
            title = "Great Expectations",
            author = "Charles Dickens",
            publisher = "Chapman & Hall",
            year = "1861",
            pages = "505",
            language = "English",
            size = "2.1 MB",
            extension = "pdf",
            coverUrl = "https://www.gutenberg.org/cache/epub/1400/pg1400.cover.medium.jpg",
            md5 = "great_expectations_dickens",
            source = "Direct PDF Archive",
            description = "The bildungsroman of orphan Pip as he navigates wealth, unrequited love for Estella, and secret benefactors.",
            downloadUrl = "https://www.planetpublish.com/wp-content/uploads/2011/11/Great_Expectations_NT.pdf"
        )
    )

    val PHILOSOPHY_SHELF: List<Book> = listOf(
        FEATURED_CLASSICS[5], // The Prince
        TOP_10_TODAY[4], // Crime and Punishment
        Book(
            id = "phil_odyssey",
            title = "The Odyssey",
            author = "Homer",
            publisher = "Samuel Butler Translation",
            year = "8th C. BC",
            pages = "384",
            language = "English",
            size = "1.4 MB",
            extension = "pdf",
            coverUrl = "https://www.gutenberg.org/cache/epub/1727/pg1727.cover.medium.jpg",
            md5 = "the_odyssey_homer",
            source = "Direct PDF Archive",
            description = "The epic Greek journey of Odysseus, king of Ithaca, wandering home after the fall of Troy.",
            downloadUrl = "https://www.planetpublish.com/wp-content/uploads/2011/11/The_Odyssey_NT.pdf"
        ),
        Book(
            id = "phil_iliad",
            title = "The Iliad",
            author = "Homer",
            publisher = "Alexander Pope Translation",
            year = "8th C. BC",
            pages = "460",
            language = "English",
            size = "1.6 MB",
            extension = "pdf",
            coverUrl = "https://www.gutenberg.org/cache/epub/6130/pg6130.cover.medium.jpg",
            md5 = "the_iliad_homer",
            source = "Direct PDF Archive",
            description = "The ancient Greek epic poem celebrating the rage of Achilles during the final weeks of the Trojan War.",
            downloadUrl = "https://www.planetpublish.com/wp-content/uploads/2011/11/The_Iliad_NT.pdf"
        ),
        Book(
            id = "phil_scarlet",
            title = "The Scarlet Letter",
            author = "Nathaniel Hawthorne",
            publisher = "Ticknor, Reed & Fields",
            year = "1850",
            pages = "238",
            language = "English",
            size = "1.0 MB",
            extension = "pdf",
            coverUrl = "https://www.gutenberg.org/cache/epub/33/pg33.cover.medium.jpg",
            md5 = "scarlet_letter_hawthorne",
            source = "Direct PDF Archive",
            description = "Hester Prynne conceives a daughter out of wedlock in Puritan Boston and struggles to create a new life of repentance and dignity.",
            downloadUrl = "https://www.planetpublish.com/wp-content/uploads/2011/11/The_Scarlet_Letter_NT.pdf"
        )
    )

    val MYSTERY_SHELF: List<Book> = listOf(
        FEATURED_CLASSICS[3], // The Hound of the Baskervilles
        FEATURED_CLASSICS[2], // Dracula
        Book(
            id = "myst_jane_eyre",
            title = "Jane Eyre",
            author = "Charlotte Brontë",
            publisher = "Smith, Elder & Co.",
            year = "1847",
            pages = "480",
            language = "English",
            size = "2.1 MB",
            extension = "pdf",
            coverUrl = "https://www.gutenberg.org/cache/epub/1260/pg1260.cover.medium.jpg",
            md5 = "jane_eyre_bronte_1847",
            source = "Direct PDF Archive",
            description = "An orphaned governess falls in love with her brooding employer Mr. Rochester at mysterious Thornfield Hall.",
            downloadUrl = "https://www.planetpublish.com/wp-content/uploads/2011/11/Jane_Eyre_NT.pdf"
        ),
        Book(
            id = "myst_wuthering",
            title = "Wuthering Heights",
            author = "Emily Brontë",
            publisher = "Thomas Cautley Newby",
            year = "1847",
            pages = "350",
            language = "English",
            size = "1.4 MB",
            extension = "pdf",
            coverUrl = "https://www.gutenberg.org/cache/epub/768/pg768.cover.medium.jpg",
            md5 = "wuthering_heights_bronte",
            source = "Direct PDF Archive",
            description = "The intense, almost demonic love between Catherine Earnshaw and Heathcliff across the wild Yorkshire moors.",
            downloadUrl = "https://www.planetpublish.com/wp-content/uploads/2011/11/Wuthering_Heights_NT.pdf"
        ),
        Book(
            id = "myst_huckfinn",
            title = "The Adventures of Huckleberry Finn",
            author = "Mark Twain",
            publisher = "Charles L. Webster & Company",
            year = "1884",
            pages = "366",
            language = "English",
            size = "1.3 MB",
            extension = "pdf",
            coverUrl = "https://www.gutenberg.org/cache/epub/76/pg76.cover.medium.jpg",
            md5 = "huckleberry_finn_twain",
            source = "Direct PDF Archive",
            description = "Huck Finn and the runaway slave Jim journey down the Mississippi River in search of freedom.",
            downloadUrl = "https://www.planetpublish.com/wp-content/uploads/2011/11/The_Adventures_of_Huckleberry_Finn_NT.pdf"
        )
    )

    private val ALL_VERIFIED_BOOKS: List<Book> = (
        FEATURED_CLASSICS + TOP_10_TODAY + SCIFI_SHELF + PHILOSOPHY_SHELF + MYSTERY_SHELF
    ).distinctBy { it.id }

    suspend fun searchAllSources(query: String): List<Book> = withContext(Dispatchers.IO) {
        val cleanQ = query.trim()
        if (cleanQ.isEmpty()) {
            return@withContext FEATURED_CLASSICS
        }

        // 1. First check verified local direct archive
        val localMatches = ALL_VERIFIED_BOOKS.filter {
            it.title.contains(cleanQ, ignoreCase = true) || it.author.contains(cleanQ, ignoreCase = true)
        }

        // 2. Query Libgen (libgen.la / libgen.li)
        val libgenBooks = try {
            searchLibgen(cleanQ)
        } catch (e: Exception) {
            emptyList()
        }

        val combined = (localMatches + libgenBooks).distinctBy {
            it.title.lowercase().replace(Regex("[^a-z0-9]"), "")
        }

        if (combined.isNotEmpty()) combined else localMatches.ifEmpty { FEATURED_CLASSICS }
    }

    /**
     * Libgen Search Implementation (libgen.la / libgen.li)
     * Queries real direct Libgen catalogs
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
                                    description = "Direct catalog match from libgen.la. Academic document and literature archive.",
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
}
