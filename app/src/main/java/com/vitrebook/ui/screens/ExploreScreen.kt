package com.vitrebook.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vitrebook.data.model.Book
import com.vitrebook.data.network.SearchEngine
import com.vitrebook.ui.components.StreamingPosterCard
import com.vitrebook.ui.theme.*
import kotlinx.coroutines.launch

data class GenreCategory(
    val name: String,
    val description: String,
    val gradient: Brush,
    val initialBooks: List<Book>
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ExploreScreen(
    onBookSelected: (Book) -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    var query by remember { mutableStateOf("") }
    var books by remember { mutableStateOf(SearchEngine.FEATURED_CLASSICS) }
    var activeCategoryName by remember { mutableStateOf<String?>(null) }
    var isLoading by remember { mutableStateOf(false) }

    val genreCategories = remember {
        listOf(
            GenreCategory(
                name = "Sci-Fi",
                description = "Time travel & future worlds",
                gradient = Brush.linearGradient(listOf(Color(0xFF0D1B2A), Color(0xFF1B263B), Color(0xFF415A77))),
                initialBooks = SearchEngine.SCIFI_SHELF
            ),
            GenreCategory(
                name = "Philosophy",
                description = "Stoicism, duty & reason",
                gradient = Brush.linearGradient(listOf(Color(0xFF1A1A2E), Color(0xFF16213E), Color(0xFF0F3460))),
                initialBooks = SearchEngine.PHILOSOPHY_SHELF
            ),
            GenreCategory(
                name = "Classics",
                description = "Timeless world masterpieces",
                gradient = Brush.linearGradient(listOf(Color(0xFF2B1055), Color(0xFF4B0082), Color(0xFF7597DE))),
                initialBooks = SearchEngine.FEATURED_CLASSICS
            ),
            GenreCategory(
                name = "Mystery",
                description = "Detectives & Gothic terror",
                gradient = Brush.linearGradient(listOf(Color(0xFF23074D), Color(0xFFCC5333))),
                initialBooks = SearchEngine.MYSTERY_SHELF
            ),
            GenreCategory(
                name = "Strategy & War",
                description = "Military treatise & leadership",
                gradient = Brush.linearGradient(listOf(Color(0xFF1F1C18), Color(0xFF8E0E00))),
                initialBooks = listOf(SearchEngine.FEATURED_CLASSICS[5])
            ),
            GenreCategory(
                name = "Fantasy & Wonder",
                description = "Fairy realms & surreal journeys",
                gradient = Brush.linearGradient(listOf(Color(0xFF134E5E), Color(0xFF71B280))),
                initialBooks = listOf(SearchEngine.FEATURED_CLASSICS[4])
            )
        )
    }

    val trendingKeywords = listOf("Orwell", "Marcus Aurelius", "Frankenstein", "Plato", "Sherlock", "Dostoevsky", "Machiavelli")

    fun performSearch(q: String) {
        coroutineScope.launch {
            isLoading = true
            books = SearchEngine.searchAllSources(q)
            isLoading = false
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(ObsidianBackground)
            .padding(horizontal = 16.dp)
    ) {
        Spacer(modifier = Modifier.height(16.dp))

        // Header Title
        Text(
            text = "Search & Browse",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.ExtraBold,
            color = IceWhite
        )
        Text(
            text = "Browse genre hubs or search Libgen & direct PDF archives",
            color = TextMuted,
            fontSize = 12.sp
        )

        Spacer(modifier = Modifier.height(14.dp))

        // Docked Glass Search Bar
        OutlinedTextField(
            value = query,
            onValueChange = { newQuery ->
                query = newQuery
                if (newQuery.length >= 2) {
                    activeCategoryName = null
                    performSearch(newQuery)
                } else if (newQuery.isEmpty()) {
                    books = SearchEngine.FEATURED_CLASSICS
                }
            },
            placeholder = { Text(text = "Search titles, authors, or topics...", color = TextMuted, fontSize = 14.sp) },
            leadingIcon = {
                Icon(Icons.Default.Search, contentDescription = "Search", tint = IceWhite)
            },
            trailingIcon = {
                if (query.isNotEmpty() || activeCategoryName != null) {
                    IconButton(onClick = {
                        query = ""
                        activeCategoryName = null
                        books = SearchEngine.FEATURED_CLASSICS
                    }) {
                        Icon(Icons.Default.Clear, contentDescription = "Clear", tint = TextMuted)
                    }
                }
            },
            singleLine = true,
            shape = RoundedCornerShape(14.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = ObsidianSurface,
                unfocusedContainerColor = ObsidianSurface,
                focusedBorderColor = IceWhite.copy(alpha = 0.5f),
                unfocusedBorderColor = ObsidianBorder,
                focusedTextColor = TextPrimary,
                unfocusedTextColor = TextPrimary
            ),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(14.dp))

        if (isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = IceWhite, modifier = Modifier.size(32.dp))
            }
        }

        // Mode 1: Empty Search -> Show Genre Tile Hub & Trending Keywords
        if (query.isEmpty() && activeCategoryName == null) {
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                item(span = { androidx.compose.foundation.lazy.grid.GridItemSpan(2) }) {
                    Column {
                        Text(
                            text = "POPULAR KEYWORDS",
                            color = TextMuted,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 0.8.sp
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            trendingKeywords.take(4).forEach { kw ->
                                Surface(
                                    shape = RoundedCornerShape(20.dp),
                                    color = ObsidianSurfaceElevated,
                                    border = androidx.compose.foundation.BorderStroke(1.dp, ObsidianBorder),
                                    modifier = Modifier.clickable {
                                        query = kw
                                        performSearch(kw)
                                    }
                                ) {
                                    Text(
                                        text = kw,
                                        color = SilverAccent,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Medium,
                                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "BROWSE GENRE HUBS",
                            color = TextMuted,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 0.8.sp
                        )
                    }
                }

                // Genre Tiles
                items(genreCategories) { genre ->
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(104.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(genre.gradient)
                            .border(1.dp, ObsidianBorder, RoundedCornerShape(14.dp))
                            .clickable {
                                activeCategoryName = genre.name
                                books = genre.initialBooks
                            }
                            .padding(14.dp)
                    ) {
                        Column(modifier = Modifier.fillMaxSize(), verticalArrangement = Arrangement.SpaceBetween) {
                            Text(
                                text = genre.name,
                                color = IceWhite,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = genre.description,
                                color = Color(0xCCFFFFFF),
                                fontSize = 11.sp,
                                maxLines = 2
                            )
                        }
                    }
                }

                item(span = { androidx.compose.foundation.lazy.grid.GridItemSpan(2) }) {
                    Spacer(modifier = Modifier.height(110.dp))
                }
            }
        } else {
            // Mode 2: Search Active or Category Selected -> 3-Column Cinema Poster Wall
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = if (activeCategoryName != null) "CATEGORY: ${activeCategoryName?.uppercase()}" else "SEARCH RESULTS (${books.size})",
                    color = IceWhite,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
                if (activeCategoryName != null) {
                    TextButton(onClick = { activeCategoryName = null; books = SearchEngine.FEATURED_CLASSICS }) {
                        Text(text = "All Genres", color = SilverAccent, fontSize = 12.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            LazyVerticalGrid(
                columns = GridCells.Fixed(3),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(books) { book ->
                    StreamingPosterCard(
                        book = book,
                        width = 104,
                        height = 156,
                        onClick = { onBookSelected(book) }
                    )
                }

                item(span = { androidx.compose.foundation.lazy.grid.GridItemSpan(3) }) {
                    Spacer(modifier = Modifier.height(110.dp))
                }
            }
        }
    }
}
