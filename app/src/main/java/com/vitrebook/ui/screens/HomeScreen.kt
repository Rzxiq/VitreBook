package com.vitrebook.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vitrebook.data.model.Book
import com.vitrebook.data.model.DownloadedBook
import com.vitrebook.data.network.SearchEngine
import com.vitrebook.data.repository.LibraryManager
import com.vitrebook.ui.components.HeroBillboard
import com.vitrebook.ui.components.StreamingPosterCard
import com.vitrebook.ui.components.Top10PosterCard
import com.vitrebook.ui.theme.*

@Composable
fun HomeScreen(
    libraryManager: LibraryManager,
    onBookSelected: (Book) -> Unit,
    onOpenReader: (DownloadedBook) -> Unit
) {
    val downloadedBooks by libraryManager.booksFlow.collectAsState()
    val activeBook = downloadedBooks.firstOrNull()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(ObsidianBackground)
    ) {
        // Hero Billboard Header
        item {
            HeroBillboard(
                featuredBook = SearchEngine.TOP_10_TODAY[1], // Frankenstein
                activeReadingBook = activeBook,
                onResumeReading = {
                    if (activeBook != null) {
                        onOpenReader(activeBook)
                    } else {
                        onBookSelected(SearchEngine.TOP_10_TODAY[1])
                    }
                },
                onViewDetails = {
                    if (activeBook != null) {
                        val book = Book(
                            id = activeBook.id,
                            title = activeBook.title,
                            author = activeBook.author,
                            publisher = "VitreBook Offline",
                            year = "Recent",
                            pages = activeBook.totalPages.toString(),
                            language = "English",
                            size = "${activeBook.fileSize / (1024 * 1024)} MB",
                            extension = "pdf",
                            coverUrl = activeBook.coverUrl,
                            md5 = activeBook.id,
                            source = "Downloaded",
                            description = "Downloaded book in offline storage.",
                            downloadUrl = ""
                        )
                        onBookSelected(book)
                    } else {
                        onBookSelected(SearchEngine.TOP_10_TODAY[1])
                    }
                }
            )
        }

        // Shelf 1: Continue Reading (if any downloaded books exist)
        if (downloadedBooks.isNotEmpty()) {
            item {
                Spacer(modifier = Modifier.height(20.dp))
                ShelfHeader(title = "Continue Reading", subtitle = "${downloadedBooks.size} books in progress")
                Spacer(modifier = Modifier.height(10.dp))
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    items(downloadedBooks) { downloaded ->
                        val progress = if (downloaded.totalPages > 0) {
                            downloaded.lastReadPage.toFloat() / downloaded.totalPages.toFloat()
                        } else null

                        val bookItem = Book(
                            id = downloaded.id,
                            title = downloaded.title,
                            author = downloaded.author,
                            publisher = "VitreBook",
                            year = "Downloaded",
                            pages = downloaded.totalPages.toString(),
                            language = "English",
                            size = "${downloaded.fileSize / (1024 * 1024)} MB",
                            extension = "pdf",
                            coverUrl = downloaded.coverUrl,
                            md5 = downloaded.id,
                            source = "Offline",
                            description = "Offline copy in library",
                            downloadUrl = ""
                        )

                        StreamingPosterCard(
                            book = bookItem,
                            progress = progress,
                            onClick = { onOpenReader(downloaded) }
                        )
                    }
                }
            }
        }

        // Shelf 2: Top 10 Books Today (Netflix Cinema Style Numbers)
        item {
            Spacer(modifier = Modifier.height(24.dp))
            ShelfHeader(title = "Top 10 Books Today", subtitle = "Most read across all libraries")
            Spacer(modifier = Modifier.height(10.dp))
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                itemsIndexed(SearchEngine.TOP_10_TODAY) { index, book ->
                    Top10PosterCard(
                        rank = index + 1,
                        book = book,
                        onClick = { onBookSelected(book) }
                    )
                }
            }
        }

        // Shelf 3: Trending Now
        item {
            Spacer(modifier = Modifier.height(24.dp))
            ShelfHeader(title = "Trending Now", subtitle = "Popular public domain & open editions")
            Spacer(modifier = Modifier.height(10.dp))
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                items(SearchEngine.FEATURED_CLASSICS) { book ->
                    StreamingPosterCard(
                        book = book,
                        onClick = { onBookSelected(book) }
                    )
                }
            }
        }

        // Shelf 4: Sci-Fi & Speculative Fiction
        item {
            Spacer(modifier = Modifier.height(24.dp))
            ShelfHeader(title = "Sci-Fi & Speculative Fiction", subtitle = "Future worlds, time travel & alien encounters")
            Spacer(modifier = Modifier.height(10.dp))
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                items(SearchEngine.SCIFI_SHELF) { book ->
                    StreamingPosterCard(
                        book = book,
                        onClick = { onBookSelected(book) }
                    )
                }
            }
        }

        // Shelf 5: Philosophy & Stoicism
        item {
            Spacer(modifier = Modifier.height(24.dp))
            ShelfHeader(title = "Philosophy & Stoic Thought", subtitle = "Timeless reflections on life, power & reason")
            Spacer(modifier = Modifier.height(10.dp))
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                items(SearchEngine.PHILOSOPHY_SHELF) { book ->
                    StreamingPosterCard(
                        book = book,
                        onClick = { onBookSelected(book) }
                    )
                }
            }
        }

        // Shelf 6: Mystery & Gothic Tales
        item {
            Spacer(modifier = Modifier.height(24.dp))
            ShelfHeader(title = "Gothic & Mystery Thrillers", subtitle = "Dark folklore, detectives & supernatural suspense")
            Spacer(modifier = Modifier.height(10.dp))
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                items(SearchEngine.MYSTERY_SHELF) { book ->
                    StreamingPosterCard(
                        book = book,
                        onClick = { onBookSelected(book) }
                    )
                }
            }
        }

        // Bottom space for floating glass nav bar
        item {
            Spacer(modifier = Modifier.height(110.dp))
        }
    }
}

@Composable
private fun ShelfHeader(title: String, subtitle: String? = null) {
    Column(modifier = Modifier.padding(horizontal = 16.dp)) {
        Text(
            text = title,
            color = IceWhite,
            fontSize = 17.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 0.2.sp
        )
        if (!subtitle.isNullOrEmpty()) {
            Text(
                text = subtitle,
                color = TextMuted,
                fontSize = 11.sp
            )
        }
    }
}
