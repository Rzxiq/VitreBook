package com.vitrebook.data.network

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class SearchEngineTest {
    @Test
    fun emptyQueryReturnsFeaturedClassics() {
        val results = SearchEngine.searchLocalArchive("")

        assertEquals(SearchEngine.FEATURED_CLASSICS.size, results.size)
        assertEquals("Pride and Prejudice", results.first().title)
    }

    @Test
    fun localVerifiedSearchFindsMatches() {
        val matches = SearchEngine.searchLocalArchive("Doyle")

        assertTrue(
            "Searching for Doyle should match Sherlock Holmes",
            matches.any { it.author.contains("Doyle", ignoreCase = true) }
        )
    }
}
