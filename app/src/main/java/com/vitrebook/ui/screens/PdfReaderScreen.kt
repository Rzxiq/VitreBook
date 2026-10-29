package com.vitrebook.ui.screens

import android.content.res.Resources
import android.graphics.Bitmap
import android.graphics.pdf.PdfRenderer
import android.os.ParcelFileDescriptor
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ChevronLeft
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Warning
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

// High-contrast night reading matrix: Inverts RGB channels while keeping Alpha intact
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
    var isFullscreen by remember { mutableStateOf(false) }
    var scale by remember { mutableFloatStateOf(1f) }
    var offsetX by remember { mutableFloatStateOf(0f) }
    var offsetY by remember { mutableFloatStateOf(0f) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var isLoading by remember { mutableStateOf(true) }

    val screenWidth = Resources.getSystem().displayMetrics.widthPixels
    val screenHeight = Resources.getSystem().displayMetrics.heightPixels

    // Safe memory rendering using native Android PdfRenderer
    LaunchedEffect(currentPageIndex, book.localFilePath) {
        isLoading = true
        errorMessage = null
        withContext(Dispatchers.IO) {
            var pfd: ParcelFileDescriptor? = null
            var renderer: PdfRenderer? = null
            var page: PdfRenderer.Page? = null

            try {
                val file = File(book.localFilePath)
                if (!file.exists() || file.length() < 100) {
                    withContext(Dispatchers.Main) {
                        errorMessage = "Document file missing or unreadable. Please re-download."
                        isLoading = false
                    }
                    return@withContext
                }

                pfd = ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY)
                renderer = PdfRenderer(pfd)
                val count = renderer.pageCount
                if (count <= 0) {
                    withContext(Dispatchers.Main) {
                        errorMessage = "Document contains 0 readable pages."
                        isLoading = false
                    }
                    return@withContext
                }

                val safeIndex = currentPageIndex.coerceIn(0, count - 1)
                page = renderer.openPage(safeIndex)

                // Compute optimal bitmap dimensions avoiding OutOfMemoryError
                val aspect = page.height.toFloat() / page.width.toFloat()
                val targetWidth = (screenWidth * 1.5f).toInt().coerceIn(720, 1440)
                val targetHeight = (targetWidth * aspect).toInt().coerceIn(960, 2160)

                val bitmap = Bitmap.createBitmap(targetWidth, targetHeight, Bitmap.Config.ARGB_8888)
                bitmap.eraseColor(android.graphics.Color.WHITE)
                page.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)

                withContext(Dispatchers.Main) {
                    totalPageCount = count
                    currentPageIndex = safeIndex
                    val old = renderedBitmap
                    renderedBitmap = bitmap
                    old?.recycle() // Free memory immediately
                    isLoading = false

                    // Auto-save progress
                    libraryManager.updateReadingProgress(book.md5, safeIndex, count)
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    errorMessage = "Rendering error: ${e.localizedMessage ?: "Unknown error"}"
                    isLoading = false
                }
            } finally {
                try { page?.close() } catch (ignored: Exception) {}
                try { renderer?.close() } catch (ignored: Exception) {}
                try { pfd?.close() } catch (ignored: Exception) {}
            }
        }
    }

    Scaffold(
        containerColor = if (isNightMode) ObsidianBackground else Color(0xFFF4F4F5),
        topBar = {
            AnimatedVisibility(
                visible = !isFullscreen,
                enter = fadeIn() + slideInVertically(),
                exit = fadeOut() + slideOutVertically()
            ) {
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
                        // Night Mode Toggle (No Emoji, Clean Material Vector)
                        IconButton(onClick = { isNightMode = !isNightMode }) {
                            Icon(
                                imageVector = if (isNightMode) Icons.Default.LightMode else Icons.Default.DarkMode,
                                contentDescription = "Toggle Theme",
                                tint = if (isNightMode) SecondaryEmerald else Color(0xFF18181B)
                            )
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = if (isNightMode) ObsidianSurface else Color(0xFFE4E4E7)
                    )
                )
            }
        },
        bottomBar = {
            AnimatedVisibility(
                visible = !isFullscreen,
                enter = fadeIn() + slideInVertically(initialOffsetY = { it }),
                exit = fadeOut() + slideOutVertically(targetOffsetY = { it })
            ) {
                Surface(
                    color = if (isNightMode) ObsidianSurface.copy(alpha = 0.95f) else Color(0xFFE4E4E7),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 10.dp)
                        .clip(RoundedCornerShape(20.dp)),
                    border = androidx.compose.foundation.BorderStroke(1.dp, if (isNightMode) ObsidianBorder else Color(0xFFD4D4D8))
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 12.dp, vertical = 6.dp)
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

                            // Crash-proof clamped slider
                            val maxPages = (totalPageCount - 1).coerceAtLeast(1)
                            val sliderValue = currentPageIndex.toFloat().coerceIn(0f, maxPages.toFloat())

                            Slider(
                                value = sliderValue,
                                onValueChange = {
                                    currentPageIndex = it.toInt().coerceIn(0, totalPageCount - 1)
                                    scale = 1f
                                    offsetX = 0f
                                    offsetY = 0f
                                },
                                valueRange = 0f..maxPages.toFloat(),
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
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .pointerInput(Unit) {
                    detectTapGestures(
                        onTap = { offset ->
                            val width = size.width
                            when {
                                offset.x < width * 0.22f -> {
                                    // Tap Left Margin -> Previous Page
                                    if (currentPageIndex > 0) {
                                        currentPageIndex--
                                        scale = 1f
                                        offsetX = 0f
                                        offsetY = 0f
                                    }
                                }
                                offset.x > width * 0.78f -> {
                                    // Tap Right Margin -> Next Page
                                    if (currentPageIndex < totalPageCount - 1) {
                                        currentPageIndex++
                                        scale = 1f
                                        offsetX = 0f
                                        offsetY = 0f
                                    }
                                }
                                else -> {
                                    // Tap Center -> Toggle UI Controls
                                    isFullscreen = !isFullscreen
                                }
                            }
                        }
                    )
                }
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
            when {
                errorMessage != null -> {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.padding(24.dp)
                    ) {
                        Icon(
                            Icons.Default.Warning,
                            contentDescription = "Error",
                            tint = TextDanger,
                            modifier = Modifier.size(44.dp)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = errorMessage ?: "",
                            color = TextDanger,
                            style = MaterialTheme.typography.bodyMedium,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(
                            onClick = {
                                val current = currentPageIndex
                                currentPageIndex = -1
                                currentPageIndex = current
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = ObsidianSurfaceElevated, contentColor = TextPrimary)
                        ) {
                            Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(text = "Retry Page")
                        }
                    }
                }
                isLoading -> {
                    CircularProgressIndicator(
                        color = PrimaryRuby,
                        modifier = Modifier.size(36.dp)
                    )
                }
                renderedBitmap != null -> {
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
                }
            }
        }
    }
}
