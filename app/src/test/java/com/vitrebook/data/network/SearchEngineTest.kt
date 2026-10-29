package com.vitrebook.data.network

import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class SearchEngineTest {

    @Test
    fun testEmptyQueryReturnsFeaturedClassics() = runBlocking {
        val results = SearchEngine.searchAllSources("")
        assertEquals(SearchEngine.FEATURED_CLASSICS.size, results.size)
        assertEquals("Pride and Prejudice", results[0].title)
    }

    @Test
    fun testAuthorNameFormatting() {
        assertEquals("Mary Wollstonecraft Shelley", SearchEngine.formatAuthorName("Shelley, Mary Wollstonecraft"))
        assertEquals("Arthur Conan Doyle", SearchEngine.formatAuthorName("Doyle, Arthur Conan"))
        assertEquals("Homer", SearchEngine.formatAuthorName("Homer"))
        assertEquals("Unknown Author", SearchEngine.formatAuthorName("Unknown Author"))
    }

    @Test
    fun testCleanBookTitle() {
        assertEquals(
            "Frankenstein; or, The Modern Prometheus",
            SearchEngine.cleanBookTitle("Frankenstein; or, The Modern Prometheus [EBook #84]")
        )
        assertEquals(
            "The Hound of the Baskervilles",
            SearchEngine.cleanBookTitle("  The Hound of the Baskervilles   ")
        )
    }

    @Test
    fun testParseGutenbergResponseValid() {
        val fixture = """
            {
                "count": 2,
                "results": [
                    {
                        "id": 84,
                        "title": "Frankenstein; or, The Modern Prometheus",
                        "authors": [
                            {"name": "Shelley, Mary Wollstonecraft", "birth_year": 1797, "death_year": 1851}
                        ],
                        "formats": {
                            "image/jpeg": "https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg",
                            "application/epub+zip": "https://www.gutenberg.org/ebooks/84.epub3.images",
                            "text/html": "https://www.gutenberg.org/ebooks/84.html.images"
                        },
                        "languages": ["en"],
                        "summaries": ["Gothic horror novel by Mary Shelley."]
                    },
                    {
                        "id": 1661,
                        "title": "The Adventures of Sherlock Holmes",
                        "authors": [],
                        "formats": {
                            "text/plain; charset=utf-8": "https://www.gutenberg.org/ebooks/1661.txt.utf-8"
                        },
                        "languages": ["en"]
                    }
                ]
            }
        """.trimIndent()

        val parsed = SearchEngine.parseGutenbergResponse(fixture)
        assertEquals(2, parsed.size)

        val first = parsed[0]
        assertEquals("guten_84", first.id)
        assertEquals("Frankenstein; or, The Modern Prometheus", first.title)
        assertEquals("Mary Wollstonecraft Shelley", first.author)
        assertEquals("https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg", first.coverUrl)
        assertEquals("https://www.gutenberg.org/ebooks/84.epub3.images", first.downloadUrl)
        assertEquals("English", first.language)
        assertEquals("Project Gutenberg", first.source)
        assertNotNull(first.description)

        val second = parsed[1]
        assertEquals("guten_1661", second.id)
        assertEquals("The Adventures of Sherlock Holmes", second.title)
        assertEquals("Unknown Author", second.author) // Handled safely when author array is empty
        assertNull(second.coverUrl) // Gracefully null when format is missing
        assertEquals("https://www.gutenberg.org/ebooks/1661.txt.utf-8", second.downloadUrl)
    }

    @Test
    fun testParseGutenbergMalformedJson() {
        val malformed = "{ invalid json string ]"
        val parsed = SearchEngine.parseGutenbergResponse(malformed)
        assertTrue("Malformed JSON should return empty list without crashing", parsed.isEmpty())
    }

    @Test
    fun testParseGutenbergEmptyResults() {
        val emptyJson = "{\"count\": 0, \"results\": []}"
        val parsed = SearchEngine.parseGutenbergResponse(emptyJson)
        assertTrue(parsed.isEmpty())
    }

    @Test
    fun testLocalVerifiedSearchFindsMatches() = runBlocking {
        val matches = SearchEngine.searchAllSources("Doyle")
        assertTrue("Searching for Doyle should match Sherlock Holmes", matches.any { it.author.contains("Doyle", ignoreCase = true) })
    }
}
