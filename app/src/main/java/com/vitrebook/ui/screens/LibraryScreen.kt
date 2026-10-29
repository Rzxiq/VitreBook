package com.vitrebook.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.vitrebook.data.model.DownloadedBook
import com.vitrebook.data.network.DownloadService
import com.vitrebook.data.network.SearchEngine
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
    var starterDownloadProgress by remember { mutableStateOf<com.vitrebook.data.model.DownloadProgress?>(null) }
    var bookToDelete by remember { mutableStateOf<DownloadedBook?>(null) }

    fun loadStarterBook() {
        coroutineScope.launch {
            isDownloadingStarter = true
            try {
                val downloaded = DownloadService(context).downloadBook(starter) { p ->
                    starterDownloadProgress = p
                }
                libraryManager.saveBook(downloaded)
            } catch (ignored: Exception) {}
            isDownloadingStarter = false
            starterDownloadProgress = null
        }
    }

    val totalBytes = downloadedBooks.sumOf { it.fileSizeBytes }
    val totalSizeMb = String.format("%.1f MB", totalBytes / (1024.0 * 1024.0))

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
                Spacer(modifier = Modifier.height(14.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Downloads Locker",
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.ExtraBold,
                            color = IceWhite
                        )
                        Text(
                            text = "$totalSizeMb used • ${downloadedBooks.size} books stored offline",
                            color = TextMuted,
                            fontSize = 12.sp
                        )
                    }

                    // Quick starter download button for instant testing
                    Button(
                        onClick = { loadStarterBook() },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = ObsidianSurfaceElevated,
                            contentColor = IceWhite
                        ),
                        shape = RoundedCornerShape(10.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, ObsidianBorder),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Bolt,
                            contentDescription = null,
                            tint = IceWhite,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(text = "Quick Starter", fontSize = 12.sp, fontWeight = FontWeight.Bold)
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
                                .padding(36.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = Icons.Default.Download,
                                contentDescription = null,
                                tint = TextMuted,
                                modifier = Modifier.size(54.dp)
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "Locker is Empty",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = IceWhite
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "Downloaded books are saved here for full offline reading with zero internet connection.",
                                color = TextMuted,
                                fontSize = 13.sp,
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center
                            )
                            Spacer(modifier = Modifier.height(20.dp))
                            Button(
                                onClick = { loadStarterBook() },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = IceWhite,
                                    contentColor = Color.Black
                                ),
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                Text(text = "Download Starter Book", fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            } else {
                items(downloadedBooks, key = { it.id }) { book ->
                    val progressFraction = if (book.totalPages > 0) {
                        book.lastPageRead.toFloat() / book.totalPages.toFloat()
                    } else null

                    OutlinedCard(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onOpenReader(book) },
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.outlinedCardColors(containerColor = ObsidianSurface),
                        border = CardDefaults.outlinedCardBorder().copy(
                            brush = androidx.compose.ui.graphics.SolidColor(ObsidianBorder)
                        )
                    ) {
                        Column(modifier = Modifier.fillMaxWidth()) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(14.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                // Cover Art
                                Box(
                                    modifier = Modifier
                                        .width(64.dp)
                                        .height(96.dp)
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(ObsidianSurfaceElevated)
                                        .border(1.dp, ObsidianBorder, RoundedCornerShape(8.dp))
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
                                                imageVector = Icons.Default.Book,
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
                                        fontWeight = FontWeight.Bold,
                                        color = IceWhite,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                    Text(
                                        text = book.author,
                                        color = TextMuted,
                                        fontSize = 12.sp,
                                        maxLines = 1
                                    )

                                    Spacer(modifier = Modifier.height(6.dp))

                                    // Metadata Badges Row
                                    Row(
                                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Surface(
                                            shape = RoundedCornerShape(4.dp),
                                            color = ObsidianSurfaceElevated,
                                            border = androidx.compose.foundation.BorderStroke(0.5.dp, ObsidianBorder)
                                        ) {
                                            Text(
                                                text = "${book.fileSizeBytes / (1024 * 1024)} MB • PDF",
                                                color = SilverAccent,
                                                fontSize = 10.sp,
                                                fontWeight = FontWeight.Bold,
                                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                            )
                                        }

                                        if (book.lastPageRead > 0) {
                                            Text(
                                                text = "Page ${book.lastPageRead + 1} of ${book.totalPages}",
                                                color = TextMuted,
                                                fontSize = 10.sp
                                            )
                                        }
                                    }
                                }

                                Spacer(modifier = Modifier.width(8.dp))

                                // Resume button & Delete action
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    IconButton(
                                        onClick = { onOpenReader(book) },
                                        modifier = Modifier
                                            .size(36.dp)
                                            .background(IceWhite, RoundedCornerShape(18.dp))
                                    ) {
                                        Icon(
                                            Icons.Default.PlayArrow,
                                            contentDescription = "Read",
                                            tint = Color.Black,
                                            modifier = Modifier.size(20.dp)
                                        )
                                    }

                                    IconButton(onClick = { bookToDelete = book }) {
                                        Icon(
                                            Icons.Default.Delete,
                                            contentDescription = "Delete",
                                            tint = TextDanger,
                                            modifier = Modifier.size(20.dp)
                                        )
                                    }
                                }
                            }

                            // Card Bottom Progress Bar
                            if (progressFraction != null && progressFraction > 0f) {
                                LinearProgressIndicator(
                                    progress = { progressFraction.coerceIn(0.01f, 1f) },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(3.dp),
                                    color = IceWhite,
                                    trackColor = Color(0x33FFFFFF)
                                )
                            }
                        }
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(110.dp))
            }
        }
    }

    if (isDownloadingStarter) {
        DownloadProgressDialog(
            bookTitle = "Pride and Prejudice",
            progress = starterDownloadProgress,
            onCancel = { isDownloadingStarter = false }
        )
    }

    if (bookToDelete != null) {
        AlertDialog(
            onDismissRequest = { bookToDelete = null },
            title = { Text(text = "Remove from Locker?", color = IceWhite) },
            text = { Text(text = "Delete \"${bookToDelete?.title}\" from offline storage? You can re-download it anytime.", color = TextMuted) },
            confirmButton = {
                TextButton(onClick = {
                    bookToDelete?.let { libraryManager.removeBook(it.id) }
                    bookToDelete = null
                }) {
                    Text(text = "Delete", color = TextDanger, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { bookToDelete = null }) {
                    Text(text = "Cancel", color = IceWhite)
                }
            },
            containerColor = ObsidianSurface,
            shape = RoundedCornerShape(16.dp)
        )
    }
}
