package com.vitrebook.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.vitrebook.data.model.Book
import com.vitrebook.data.model.DownloadedBook
import com.vitrebook.data.network.DownloadService
import com.vitrebook.data.repository.LibraryManager
import com.vitrebook.ui.components.DownloadProgressDialog
import com.vitrebook.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun LibraryScreen(
    libraryManager: LibraryManager,
    onOpenReader: (DownloadedBook) -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val downloadedBooks by libraryManager.booksFlow.collectAsState()

    var isDownloadingStarter by remember { mutableStateOf(false) }
    var starterProgress by remember { mutableStateOf<com.vitrebook.data.model.DownloadProgress?>(null) }

    fun loadStarterBook() {
        val sample = Book(
            id = "starter_book_01",
            title = "VitreBook Starter Guide (Sample PDF)",
            author = "VitreBook Project",
            publisher = "Open Access Documentation",
            year = "2024",
            pages = "14",
            language = "English",
            size = "1.2 MB",
            extension = "pdf",
            coverUrl = "https://raw.githubusercontent.com/mozilla/pdf.js/master/examples/learning/helloworld.pdf",
            md5 = "starter_sample_pdf_guide",
            source = "Starter Guide",
            description = "A complete multi-page document to test native Android page flipping, night mode color inversion, and reading memory.",
            downloadUrl = "https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf"
        )

        coroutineScope.launch {
            isDownloadingStarter = true
            val downloaded = DownloadService(context).downloadBook(sample) { prog ->
                starterProgress = prog
            }
            libraryManager.saveBook(downloaded)
            isDownloadingStarter = false
            onOpenReader(downloaded)
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

                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "My Library",
                            style = MaterialTheme.typography.headlineLarge,
                            fontWeight = FontWeight.ExtraBold
                        )
                        Text(
                            text = "${downloadedBooks.size} downloaded offline books",
                            color = TextMuted,
                            fontSize = 12.sp
                        )
                    }

                    Button(
                        onClick = { loadStarterBook() },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = ObsidianSurfaceElevated,
                            contentColor = TextPrimary
                        ),
                        shape = RoundedCornerShape(10.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, ObsidianBorder),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Icon(
                            imageVector = androidx.compose.material.icons.Icons.Default.Bolt,
                            contentDescription = null,
                            tint = SecondaryEmerald,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(text = "Starter Book", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            if (downloadedBooks.isEmpty()) {
                item {
                    Spacer(modifier = Modifier.height(40.dp))
                    OutlinedCard(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.outlinedCardColors(containerColor = ObsidianSurface),
                        border = CardDefaults.outlinedCardBorder().copy(
                            brush = androidx.compose.ui.graphics.SolidColor(ObsidianBorder)
                        )
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(32.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = androidx.compose.material.icons.Icons.Default.LocalLibrary,
                                contentDescription = null,
                                tint = TextMuted,
                                modifier = Modifier.size(54.dp)
                            )
                            Spacer(modifier = Modifier.height(14.dp))
                            Text(
                                text = "Your Library is Empty",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "Search books in Explore to download, or load our instant sample guide to test the native reader.",
                                color = TextMuted,
                                fontSize = 13.sp,
                                modifier = Modifier.padding(horizontal = 8.dp),
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center
                            )
                            Spacer(modifier = Modifier.height(20.dp))
                            Button(
                                onClick = { loadStarterBook() },
                                colors = ButtonDefaults.buttonColors(containerColor = PrimaryRuby),
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Text(text = "Load Starter Guide (Sample PDF)", fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            } else {
                items(downloadedBooks, key = { it.md5 }) { book ->
                    OutlinedCard(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.outlinedCardColors(containerColor = ObsidianSurface),
                        border = CardDefaults.outlinedCardBorder().copy(
                            brush = androidx.compose.ui.graphics.SolidColor(ObsidianBorder)
                        )
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            // Cover
                            Box(
                                modifier = Modifier
                                    .width(68.dp)
                                    .height(98.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(ObsidianSurfaceElevated)
                            ) {
                                if (!book.coverUrl.isNullOrEmpty()) {
                                    AsyncImage(
                                        model = book.coverUrl,
                                        contentDescription = book.title,
                                        contentScale = ContentScale.Crop,
                                        modifier = Modifier.fillMaxSize()
                                    )
                                } else {
                                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                        Icon(
                                            imageVector = androidx.compose.material.icons.Icons.Default.Book,
                                            contentDescription = null,
                                            tint = TextMuted,
                                            modifier = Modifier.size(24.dp)
                                        )
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.width(14.dp))

                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = book.title,
                                    style = MaterialTheme.typography.titleMedium,
                                    maxLines = 2,
                                    overflow = TextOverflow.Ellipsis
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = book.author,
                                    color = TextSecondary,
                                    fontSize = 12.sp,
                                    maxLines = 1
                                )

                                Spacer(modifier = Modifier.height(8.dp))

                                // Reading progress
                                val progressFraction = if (book.totalPages > 0) {
                                    (book.lastReadPage.toFloat() / book.totalPages.toFloat()).coerceIn(0f, 1f)
                                } else 0f
                                val progressPercent = (progressFraction * 100).toInt()

                                Column {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text(
                                            text = if (book.lastReadPage > 0) "Page ${book.lastReadPage + 1} of ${book.totalPages}" else "Unread",
                                            color = TextMuted,
                                            fontSize = 10.sp
                                        )
                                        Text(
                                            text = "$progressPercent%",
                                            color = SecondaryEmerald,
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                    Spacer(modifier = Modifier.height(4.dp))
                                    LinearProgressIndicator(
                                        progress = { progressFraction },
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .height(4.dp),
                                        color = SecondaryEmerald,
                                        trackColor = ObsidianBorder
                                    )
                                }

                                Spacer(modifier = Modifier.height(10.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Button(
                                        onClick = { onOpenReader(book) },
                                        modifier = Modifier.weight(1f),
                                        shape = RoundedCornerShape(8.dp),
                                        colors = ButtonDefaults.buttonColors(containerColor = TextPrimary, contentColor = ObsidianBackground),
                                        contentPadding = PaddingValues(vertical = 6.dp)
                                    ) {
                                        Icon(Icons.Default.MenuBook, contentDescription = null, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(text = if (book.lastReadPage > 0) "Continue" else "Read Now", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                    }

                                    IconButton(
                                        onClick = { libraryManager.deleteBook(book.md5) },
                                        modifier = Modifier.size(36.dp)
                                    ) {
                                        Icon(Icons.Default.Delete, contentDescription = "Delete", tint = TextDanger, modifier = Modifier.size(18.dp))
                                    }
                                }
                            }
                        }
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }

    if (isDownloadingStarter) {
        DownloadProgressDialog(
            bookTitle = "VitreBook Starter Guide",
            progress = starterProgress,
            onCancel = { isDownloadingStarter = false }
        )
    }
}
