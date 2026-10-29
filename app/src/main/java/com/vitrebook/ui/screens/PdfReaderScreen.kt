package com.vitrebook.ui.screens

import android.graphics.Bitmap
import android.graphics.pdf.PdfRenderer
import android.os.ParcelFileDescriptor
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ChevronLeft
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.graphics.ColorMatrix
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vitrebook.data.model.DownloadedBook
import com.vitrebook.data.repository.LibraryManager
import com.vitrebook.ui.theme.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File

// Inversion matrix for true night mode reading: Inverts RGB channels while keeping Alpha intact
private val InvertColorMatrix = ColorMatrix(
    floatArrayOf(
        -1f,  0f,  0f, 0f, 255f,
         0f, -1f,  0f, 0f, 255f,
         0f,  0f, -1f, 0f, 255f,
         0f,  0f,  0f, 1f,   0f
    )
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PdfReaderScreen(
    book: DownloadedBook,
    libraryManager: LibraryManager,
    onBack: () -> Unit
) {
    var currentPageIndex by remember { mutableIntStateOf(book.lastReadPage) }
    var totalPageCount by remember { mutableIntStateOf(book.totalPages.coerceAtLeast(1)) }
    var renderedBitmap by remember { mutableStateOf<Bitmap?>(null) }
    var isNightMode by remember { mutableStateOf(true) }
    var scale by remember { mutableFloatStateOf(1f) }
    var offsetX by remember { mutableFloatStateOf(0f) }
    var offsetY by remember { mutableFloatStateOf(0f) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    // Render page using native Android PdfRenderer
    LaunchedEffect(currentPageIndex, book.localFilePath) {
        withContext(Dispatchers.IO) {
            try {
                val file = File(book.localFilePath)
                if (!file.exists()) {
                    errorMessage = "File not found at ${book.localFilePath}"
                    return@withContext
                }

                val pfd = ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY)
                val renderer = PdfRenderer(pfd)
                totalPageCount = renderer.pageCount

                val safeIndex = currentPageIndex.coerceIn(0, totalPageCount - 1)
                val page = renderer.openPage(safeIndex)

                // High resolution render multiplier
                val bitmapWidth = page.width * 2
                val bitmapHeight = page.height * 2
                val bitmap = Bitmap.createBitmap(bitmapWidth, bitmapHeight, Bitmap.Config.ARGB_8888)

                // Fill white background before rendering
                bitmap.eraseColor(android.graphics.Color.WHITE)
                page.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)

                page.close()
                renderer.close()
                pfd.close()

                withContext(Dispatchers.Main) {
                    renderedBitmap = bitmap
                    // Auto-save reading bookmark
                    libraryManager.updateReadingProgress(book.md5, safeIndex, totalPageCount)
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    errorMessage = "Unable to render PDF: ${e.message}"
                }
            }
        }
    }

    Scaffold(
        containerColor = if (isNightMode) ObsidianBackground else Color(0xFFF4F4F5),
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = book.title,
                            color = if (isNightMode) TextPrimary else Color(0xFF18181B),
                            style = MaterialTheme.typography.titleMedium,
                            maxLines = 1
                        )
                        Text(
                            text = "Page ${currentPageIndex + 1} of $totalPageCount",
                            color = if (isNightMode) TextMuted else Color(0xFF71717A),
                            fontSize = 11.sp
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            Icons.Default.ArrowBack,
                            contentDescription = "Back",
                            tint = if (isNightMode) TextPrimary else Color(0xFF18181B)
                        )
                    }
                },
                actions = {
                    // Night Mode Toggle
                    IconButton(onClick = { isNightMode = !isNightMode }) {
                        Icon(
                            imageVector = if (isNightMode) Icons.Default.LightMode else Icons.Default.DarkMode,
                            contentDescription = "Toggle Night Mode",
                            tint = if (isNightMode) SecondaryEmerald else Color(0xFF18181B)
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = if (isNightMode) ObsidianBackground else Color(0xFFE4E4E7)
                )
            )
        },
        bottomBar = {
            // Page navigation scrubber bar
            Surface(
                color = if (isNightMode) ObsidianSurface else Color(0xFFE4E4E7),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(12.dp)
                    .clip(RoundedCornerShape(16.dp))
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        IconButton(
                            onClick = {
                                if (currentPageIndex > 0) {
                                    currentPageIndex--
                                    scale = 1f
                                    offsetX = 0f
                                    offsetY = 0f
                                }
                            },
                            enabled = currentPageIndex > 0
                        ) {
                            Icon(Icons.Default.ChevronLeft, contentDescription = "Previous Page")
                        }

                        Slider(
                            value = currentPageIndex.toFloat(),
                            onValueChange = {
                                currentPageIndex = it.toInt()
                                scale = 1f
                                offsetX = 0f
                                offsetY = 0f
                            },
                            valueRange = 0f..(totalPageCount - 1).coerceAtLeast(1).toFloat(),
                            modifier = Modifier.weight(1f)
                        )

                        IconButton(
                            onClick = {
                                if (currentPageIndex < totalPageCount - 1) {
                                    currentPageIndex++
                                    scale = 1f
                                    offsetX = 0f
                                    offsetY = 0f
                                }
                            },
                            enabled = currentPageIndex < totalPageCount - 1
                        ) {
                            Icon(Icons.Default.ChevronRight, contentDescription = "Next Page")
                        }
                    }
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .pointerInput(Unit) {
                    detectTransformGestures { _, pan, zoom, _ ->
                        scale = (scale * zoom).coerceIn(1f, 4f)
                        if (scale > 1f) {
                            offsetX += pan.x
                            offsetY += pan.y
                        } else {
                            offsetX = 0f
                            offsetY = 0f
                        }
                    }
                },
            contentAlignment = Alignment.Center
        ) {
            if (errorMessage != null) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.padding(24.dp)
                ) {
                    Text(text = "⚠️", fontSize = 40.sp)
                    Spacer(modifier = Modifier.height(10.dp))
                    Text(text = errorMessage ?: "", color = TextDanger, style = MaterialTheme.typography.bodyMedium)
                }
            } else if (renderedBitmap != null) {
                Image(
                    bitmap = renderedBitmap!!.asImageBitmap(),
                    contentDescription = "PDF Page ${currentPageIndex + 1}",
                    contentScale = ContentScale.Fit,
                    colorFilter = if (isNightMode) ColorFilter.colorMatrix(InvertColorMatrix) else null,
                    modifier = Modifier
                        .fillMaxSize()
                        .graphicsLayer(
                            scaleX = scale,
                            scaleY = scale,
                            translationX = offsetX,
                            translationY = offsetY
                        )
                )
            } else {
                CircularProgressIndicator(
                    color = PrimaryRuby,
                    modifier = Modifier.size(36.dp)
                )
            }
        }
    }
}
