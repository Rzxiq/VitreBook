package com.vitrebook.data.network

import okhttp3.HttpUrl.Companion.toHttpUrl
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class LibGenSearchTest {
    @Test
    fun searchUrlEncodesQueryAndIncludesExpectedSearchParameters() {
        val url = LibGenSearch.buildSearchUrl("Pride & Prejudice", 12)

        assertEquals("libgen.la", url.host)
        assertEquals("Pride & Prejudice", url.queryParameter("req"))
        assertEquals("12", url.queryParameter("res"))
        assertEquals("f", url.queryParameter("objects[]"))
        assertEquals("libgen", url.queryParameter("topics[]"))
        assertEquals(listOf("t", "a", "p", "y", "l", "s", "f"), url.queryParameterValues("columns[]"))
    }

    @Test
    fun parsesEditionMetadataWithoutCreatingDownloadUrl() {
        val html = """
            <html><body>
              <table>
                <tr>
                  <th>Title</th><th>Author</th><th>Publisher</th><th>Year</th>
                  <th>Language</th><th>Pages</th><th>Size</th><th>Extension</th>
                </tr>
                <tr>
                  <td><img src="/covers/42.jpg"/><a href="edition.php?id=42">The Example Book</a></td>
                  <td>Example Author</td><td>Example Press</td><td>1999</td>
                  <td>English</td><td>321</td><td>2.4 MB</td><td>PDF</td>
                </tr>
              </table>
            </body></html>
        """.trimIndent()

        val results = LibGenSearch.parseSearchResults(html)

        assertEquals(1, results.size)
        val book = results.single()
        assertEquals("The Example Book", book.title)
        assertEquals("Example Author", book.author)
        assertEquals("Example Press", book.publisher)
        assertEquals("1999", book.year)
        assertEquals("English", book.language)
        assertEquals("321", book.pages)
        assertEquals("2.4 MB", book.size)
        assertEquals("pdf", book.extension)
        assertEquals("https://libgen.la/covers/42.jpg", book.coverUrl)
        assertEquals("https://libgen.la/edition.php?id=42", book.editionPageUrl)
        assertNull("Metadata results must not be downloadable through VitreBook", book.downloadUrl)
        assertEquals("LibGen metadata", book.source)
    }

    @Test
    fun invalidYearAndPageCountAreDiscardedAndLimitIsApplied() {
        val html = """
            <table>
              <tr><th>Title</th><th>Author</th><th>Year</th><th>Pages</th><th>Format</th></tr>
              <tr><td>First</td><td>Author A</td><td>Not a year</td><td>321 pages</td><td>epub</td></tr>
              <tr><td>Second</td><td>Author B</td><td>1800</td><td>120</td><td>pdf</td></tr>
            </table>
        """.trimIndent()

        val results = LibGenSearch.parseSearchResults(html, limit = 1)

        assertEquals(1, results.size)
        assertEquals("", results.single().year)
        assertEquals("Unknown", results.single().pages)
        assertTrue(results.single().downloadUrl == null)
    }

    @Test
    fun emptyQueryUrlEncodingRemainsSafe() {
        val url = "https://libgen.la/index.php?req=hello+world".toHttpUrl()
        assertEquals("hello world", url.queryParameter("req"))
    }
}
