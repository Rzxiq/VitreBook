package com.vitrebook.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.LocalLibrary
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vitrebook.data.model.Book
import com.vitrebook.data.network.SearchEngine
import com.vitrebook.ui.components.BookCard
import com.vitrebook.ui.theme.*
import kotlinx.coroutines.launch

private val CATEGORIES = listOf("All", "Classics", "Fiction", "Sci-Fi", "Philosophy", "Mystery", "History")

@Composable
fun ExploreScreen(
    onBookSelected: (Book) -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    var query by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("All") }
    var books by remember { mutableStateOf(SearchEngine.FEATURED_CLASSICS) }
    var isLoading by remember { mutableStateOf(false) }

    fun performSearch(q: String) {
        coroutineScope.launch {
            isLoading = true
            books = SearchEngine.searchAllSources(q)
            isLoading = false
        }
    }

    Scaffold(
        containerColor = ObsidianBackground
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            item {
                Spacer(modifier = Modifier.height(10.dp))

                // Hero Brand Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = ObsidianSurfaceElevated,
                            modifier = Modifier.size(42.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, ObsidianBorder)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    imageVector = Icons.Default.LocalLibrary,
                                    contentDescription = null,
                                    tint = PrimaryRuby,
                                    modifier = Modifier.size(22.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        Column {
                            Text(
                                text = "VitreBook",
                                style = MaterialTheme.typography.headlineLarge,
                                fontWeight = FontWeight.ExtraBold
                            )
                            Text(
                                text = "Native Android E-Book Indexer",
                                color = TextMuted,
                                fontSize = 12.sp
                            )
                        }
                    }

                    // Live Status Pill
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = SecondaryEmerald.copy(alpha = 0.15f),
                        border = androidx.compose.foundation.BorderStroke(1.dp, SecondaryEmerald.copy(alpha = 0.4f))
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(6.dp)
                                    .clip(RoundedCornerShape(3.dp))
                                    .background(SecondaryEmerald)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "LIVE MULTI-SOURCE",
                                color = SecondaryEmerald,
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }

            // Search Bar
            item {
                OutlinedTextField(
                    value = query,
                    onValueChange = {
                        query = it
                        if (it.isEmpty() && selectedCategory == "All") {
                            books = SearchEngine.FEATURED_CLASSICS
                        } else {
                            performSearch(it)
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = ObsidianSurface,
                        unfocusedContainerColor = ObsidianSurface,
                        focusedBorderColor = TextPrimary,
                        unfocusedBorderColor = ObsidianBorder,
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary
                    ),
                    placeholder = {
                        Text(
                            text = "Search millions of public-domain books...",
                            color = TextMuted,
                            fontSize = 14.sp
                        )
                    },
                    leadingIcon = {
                        Icon(Icons.Default.Search, contentDescription = "Search", tint = TextMuted)
                    },
                    trailingIcon = {
                        if (query.isNotEmpty()) {
                            IconButton(onClick = {
                                query = ""
                                selectedCategory = "All"
                                books = SearchEngine.FEATURED_CLASSICS
                            }) {
                                Icon(Icons.Default.Clear, contentDescription = "Clear", tint = TextMuted)
                            }
                        }
                    },
                    singleLine = true
                )
            }

            // Category Chips Row
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    CATEGORIES.forEach { category ->
                        val isSelected = category == selectedCategory
                        FilterChip(
                            selected = isSelected,
                            onClick = {
                                selectedCategory = category
                                if (category == "All") {
                                    query = ""
                                    books = SearchEngine.FEATURED_CLASSICS
                                } else {
                                    query = category
                                    performSearch(category)
                                }
                            },
                            label = {
                                Text(
                                    text = category,
                                    fontSize = 12.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                                )
                            },
                            shape = RoundedCornerShape(10.dp),
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = TextPrimary,
                                selectedLabelColor = ObsidianBackground,
                                containerColor = ObsidianSurface,
                                labelColor = TextSecondary
                            ),
                            border = FilterChipDefaults.filterChipBorder(
                                enabled = true,
                                selected = isSelected,
                                borderColor = ObsidianBorder,
                                selectedBorderColor = TextPrimary
                            )
                        )
                    }
                }
            }

            // Results Counter / Loading Indicator
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (query.isEmpty()) "CURATED PUBLIC-DOMAIN CLASSICS" else "SEARCH RESULTS (${books.size})",
                        color = TextMuted,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 0.8.sp
                    )
                    if (isLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(16.dp),
                            color = PrimaryRuby,
                            strokeWidth = 2.dp
                        )
                    }
                }
            }

            // Book Cards List
            items(books, key = { it.id }) { book ->
                BookCard(
                    book = book,
                    onClick = { onBookSelected(book) }
                )
            }

            item {
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}
