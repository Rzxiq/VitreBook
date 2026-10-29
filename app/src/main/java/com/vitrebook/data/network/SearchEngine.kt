package com.vitrebook.data.network

import android.util.Log
import com.vitrebook.data.model.Book
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

object SearchEngine {
    private const val TAG = "SearchEngine"

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

    val MORE_CLASSICS: List<Book> = listOf(
        Book(
            id = "class_great_exp",
            title = "Great Expectations",
            author = "Charles Dickens",
            publisher = "Chapman & Hall",
            year = "1861",
            pages = "505",
            language = "English",
            size = "2.2 MB",
            extension = "pdf",
            coverUrl = "https://www.gutenberg.org/cache/epub/1400/pg1400.cover.medium.jpg",
            md5 = "great_expectations_dickens",
            source = "Direct PDF Archive",
            description = "The story of the orphan Pip, tracing his growth and financial advancement through an anonymous benefactor.",
            downloadUrl = "https://www.planetpublish.com/wp-content/uploads/2011/11/Great_Expectations_NT.pdf"
        ),
        Book(
            id = "class_moby_dick",
            title = "Moby-Dick; or, The Whale",
            author = "Herman Melville",
            publisher = "Harper & Brothers",
            year = "1851",
            pages = "635",
            language = "English",
            size = "2.8 MB",
            extension = "pdf",
            coverUrl = "https://www.gutenberg.org/cache/epub/2701/pg2701.cover.medium.jpg",
            md5 = "moby_dick_melville",
            source = "Direct PDF Archive",
            description = "The obsessive quest of Ahab, captain of the whaling ship Pequod, for revenge against Moby Dick.",
            downloadUrl = "https://www.planetpublish.com/wp-content/uploads/2011/11/Moby_Dick_NT.pdf"
        ),
        Book(
            id = "class_two_cities",
            title = "A Tale of Two Cities",
            author = "Charles Dickens",
            publisher = "Chapman & Hall",
            year = "1859",
            pages = "448",
            language = "English",
            size = "1.8 MB",
            extension = "pdf",
            coverUrl = "https://www.gutenberg.org/cache/epub/98/pg98.cover.medium.jpg",
            md5 = "tale_two_cities_dickens",
            source = "Direct PDF Archive",
            description = "Set in London and Paris before and during the French Revolution, depicting the plight of the French peasantry.",
            downloadUrl = "https://www.planetpublish.com/wp-content/uploads/2011/11/A_Tale_of_Two_Cities_NT.pdf"
        ),
        Book(
            id = "class_emma",
            title = "Emma",
            author = "Jane Austen",
            publisher = "John Murray",
            year = "1815",
            pages = "474",
            language = "English",
            size = "1.9 MB",
            extension = "pdf",
            coverUrl = "https://www.gutenberg.org/cache/epub/158/pg158.cover.medium.jpg",
            md5 = "emma_austen_1815",
            source = "Direct PDF Archive",
            description = "A novel of youthful hubris and romantic misunderstandings involving the clever and privileged Emma Woodhouse.",
            downloadUrl = "https://www.planetpublish.com/wp-content/uploads/2011/11/Emma_NT.pdf"
        ),
        Book(
            id = "class_sense_sens",
            title = "Sense and Sensibility",
            author = "Jane Austen",
            publisher = "Thomas Egerton",
            year = "1811",
            pages = "409",
            language = "English",
            size = "1.6 MB",
            extension = "pdf",
            coverUrl = "https://www.gutenberg.org/cache/epub/161/pg161.cover.medium.jpg",
            md5 = "sense_sensibility_austen",
            source = "Direct PDF Archive",
            description = "Follows the Dashwood sisters, Elinor and Marianne, as they personify sense (good judgment) and sensibility (emotional impulse).",
            downloadUrl = "https://www.planetpublish.com/wp-content/uploads/2011/11/Sense_and_Sensibility_NT.pdf"
        ),
        Book(
            id = "class_metamorphosis",
            title = "The Metamorphosis",
            author = "Franz Kafka",
            publisher = "Kurt Wolff Verlag",
            year = "1915",
            pages = "120",
            language = "English",
            size = "520 KB",
            extension = "pdf",
            coverUrl = "https://www.gutenberg.org/cache/epub/5200/pg5200.cover.medium.jpg",
            md5 = "the_metamorphosis_kafka",
            source = "Direct PDF Archive",
            description = "Gregor Samsa wakes one morning to find himself transformed into a monstrous insect-like creature.",
            downloadUrl = "https://www.planetpublish.com/wp-content/uploads/2011/11/The_Metamorphosis_NT.pdf"
        )
    )

    private val ALL_VERIFIED_BOOKS: List<Book> = (
        FEATURED_CLASSICS + TOP_10_TODAY + SCIFI_SHELF + PHILOSOPHY_SHELF + MYSTERY_SHELF + MORE_CLASSICS
    ).distinctBy { it.id }

    suspend fun searchAllSources(query: String): List<Book> = withContext(Dispatchers.IO) {
        val cleanQ = query.trim()
        if (cleanQ.isEmpty()) {
            return@withContext FEATURED_CLASSICS
        }

        Log.d(TAG, "Search started for query length: ${cleanQ.length}")

        // 1. First check verified local direct PDF archive
        val localMatches = searchLocalArchive(cleanQ)

        // LibGen is the only online search source; curated local matches remain available offline.
        val metadataMatches = try {
            LibGenSearch.search(cleanQ)
        } catch (e: Exception) {
            if (e is CancellationException) throw e
            Log.w(TAG, "LibGen metadata search error", e)
            emptyList()
        }

        val combined = (localMatches + metadataMatches).distinctBy {
            it.title.lowercase().replace(Regex("[^a-z0-9]"), "")
        }

        Log.d(TAG, "Search completed. Local: ${localMatches.size}, LibGen metadata: ${metadataMatches.size}, Total distinct: ${combined.size}")

        // Return empty list if no matches found; do not fall back to unrelated samples
        combined
    }

    fun searchLocalArchive(query: String): List<Book> {
        val cleanQ = query.trim()
        if (cleanQ.isEmpty()) return FEATURED_CLASSICS
        return ALL_VERIFIED_BOOKS.filter {
            it.title.contains(cleanQ, ignoreCase = true) || it.author.contains(cleanQ, ignoreCase = true)
        }
    }


}
