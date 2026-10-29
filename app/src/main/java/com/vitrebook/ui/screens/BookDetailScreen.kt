package com.vitrebook.ui.screens

import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.vitrebook.data.model.Book
import com.vitrebook.data.model.DownloadedBook
import com.vitrebook.data.model.DownloadProgress
import com.vitrebook.data.network.DownloadService
import com.vitrebook.data.network.SearchEngine
import com.vitrebook.data.repository.LibraryManager
import com.vitrebook.ui.components.DownloadProgressDialog
import com.vitrebook.ui.components.StreamingPosterCard
import com.vitrebook.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BookDetailScreen(
    book: Book,
    libraryManager: LibraryManager,
    onBack: () -> Unit,
    onOpenReader: (DownloadedBook) -> Unit,
    onBookSelected: (Book) -> Unit = {}
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val downloadedBooks by libraryManager.booksFlow.collectAsState()
    val downloadedBook = downloadedBooks.find { it.md5 == book.md5 || it.id == book.id }

    var isDownloading by remember { mutableStateOf(false) }
    var downloadProgress by remember { mutableStateOf<DownloadProgress?>(null) }

    fun startDownloadOrRead() {
        if (downloadedBook != null) {
            onOpenReader(downloadedBook)
            return
        }

        coroutineScope.launch {
            isDownloading = true
            try {
                val downloaded = DownloadService(context).downloadBook(book) { prog ->
                    downloadProgress = prog
                }
                libraryManager.saveBook(downloaded)
                isDownloading = false
                onOpenReader(downloaded)
            } catch (e: Exception) {
                isDownloading = false
            }
        }
    }

    val relatedBooks = remember(book) {
        SearchEngine.FEATURED_CLASSICS.filter { it.id != book.id }.take(5)
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(ObsidianBackground)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
        ) {
            // Cinematic Backdrop Header
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(320.dp)
            ) {
                if (!book.coverUrl.isNullOrEmpty()) {
                    AsyncImage(
                        model = book.coverUrl,
                        contentDescription = book.title,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                }

                // Gradient Overlay
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(
                                    Color(0x55000000),
                                    Color(0xAA000000),
                                    ObsidianBackground.copy(alpha = 0.95f),
                                    ObsidianBackground
                                )
                            )
                        )
                )

                // Large Overlapping Poster Card
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp)
                        .padding(top = 100.dp),
                    verticalAlignment = Alignment.Bottom
                ) {
                    Box(
                        modifier = Modifier
                            .width(130.dp)
                            .height(195.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(ObsidianSurfaceElevated)
                            .border(1.5.dp, ObsidianBorder, RoundedCornerShape(14.dp))
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
                                    modifier = Modifier.size(48.dp)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.width(16.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Surface(
                            shape = RoundedCornerShape(4.dp),
                            color = IceWhite.copy(alpha = 0.15f),
                            border = androidx.compose.foundation.BorderStroke(0.5.dp, ObsidianBorder)
                        ) {
                            Text(
                                text = "98% MATCH",
                                color = IceWhite,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.ExtraBold,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = book.title,
                            color = IceWhite,
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.ExtraBold,
                            maxLines = 3
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        Text(
                            text = "By ${book.author}",
                            color = SilverAccent,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // Metadata Chips Row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = ObsidianSurfaceElevated,
                    border = androidx.compose.foundation.BorderStroke(1.dp, ObsidianBorder)
                ) {
                    Text(
                        text = book.year.ifEmpty { "Classic" },
                        color = TextPrimary,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }

                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = ObsidianSurfaceElevated,
                    border = androidx.compose.foundation.BorderStroke(1.dp, ObsidianBorder)
                ) {
                    Text(
                        text = "${book.pages} Pages",
                        color = TextPrimary,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }

                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = ObsidianSurfaceElevated,
                    border = androidx.compose.foundation.BorderStroke(1.dp, ObsidianBorder)
                ) {
                    Text(
                        text = "${book.size} • ${book.extension.uppercase()}",
                        color = SilverAccent,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // Primary Streaming Actions
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Button(
                    onClick = { startDownloadOrRead() },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = IceWhite,
                        contentColor = Color.Black
                    ),
                    shape = RoundedCornerShape(10.dp),
                    contentPadding = PaddingValues(horizontal = 24.dp, vertical = 14.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(
                        imageVector = if (downloadedBook != null) Icons.Default.PlayArrow else Icons.Default.Download,
                        contentDescription = null,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (downloadedBook != null) "Read Now" else "Download & Read",
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 15.sp
                    )
                }

                OutlinedButton(
                    onClick = {
                        val shareIntent = Intent(Intent.ACTION_SEND).apply {
                            type = "text/plain"
                            putExtra(Intent.EXTRA_SUBJECT, book.title)
                            putExtra(Intent.EXTRA_TEXT, "Read \"${book.title}\" by ${book.author} on VitreBook.")
                        }
                        context.startActivity(Intent.createChooser(shareIntent, "Share Book"))
                    },
                    colors = ButtonDefaults.outlinedButtonColors(
                        containerColor = ObsidianSurface,
                        contentColor = IceWhite
                    ),
                    border = androidx.compose.foundation.BorderStroke(1.dp, ObsidianBorder),
                    shape = RoundedCornerShape(10.dp),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 14.dp)
                ) {
                    Icon(
                        Icons.Default.Share,
                        contentDescription = "Share",
                        modifier = Modifier.size(20.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Synopsis / Overview
            Column(modifier = Modifier.padding(horizontal = 20.dp)) {
                Text(
                    text = "SYNOPSIS",
                    color = TextMuted,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = if (!book.description.isNullOrEmpty()) book.description else "A celebrated work in the public domain. Download and read with VitreBook's built-in offline PDF reader.",
                    color = TextPrimary,
                    fontSize = 14.sp,
                    lineHeight = 22.sp
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Details Card
            OutlinedCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.outlinedCardColors(containerColor = ObsidianSurface),
                border = CardDefaults.outlinedCardBorder().copy(
                    brush = androidx.compose.ui.graphics.SolidColor(ObsidianBorder)
                )
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "EDITION DETAILS",
                        color = TextMuted,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 0.8.sp
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    DetailRow(label = "Publisher", value = book.publisher.ifEmpty { "Public Domain" })
                    DetailRow(label = "Language", value = book.language.ifEmpty { "English" })
                    DetailRow(label = "Index Source", value = book.source)
                    DetailRow(label = "Format & Encryption", value = "Standard Unencrypted PDF")
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // "More Like This" Recommendations Shelf
            Column {
                Text(
                    text = "MORE LIKE THIS",
                    color = TextMuted,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp,
                    modifier = Modifier.padding(horizontal = 20.dp)
                )
                Spacer(modifier = Modifier.height(10.dp))
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 20.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(relatedBooks) { related ->
                        StreamingPosterCard(
                            book = related,
                            width = 114,
                            height = 171,
                            onClick = { onBookSelected(related) }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(50.dp))
        }

        // Floating Back Button in Top Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 40.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = onBack,
                modifier = Modifier
                    .size(42.dp)
                    .background(ObsidianSurface.copy(alpha = 0.85f), RoundedCornerShape(21.dp))
                    .border(1.dp, ObsidianBorder, RoundedCornerShape(21.dp))
            ) {
                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Back",
                    tint = IceWhite,
                    modifier = Modifier.size(20.dp)
                )
            }
        }
    }

    if (isDownloading) {
        DownloadProgressDialog(
            bookTitle = book.title,
            progress = downloadProgress,
            onCancel = { isDownloading = false }
        )
    }
}

@Composable
private fun DetailRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = label, color = TextMuted, fontSize = 12.sp)
        Text(text = value, color = IceWhite, fontSize = 12.sp, fontWeight = FontWeight.Medium)
    }
}
