package com.vitrebook.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.vitrebook.data.model.Book
import com.vitrebook.data.model.DownloadedBook
import com.vitrebook.ui.theme.*

/**
 * Standard cinema-style vertical poster card with optional reading progress bar.
 */
@Composable
fun StreamingPosterCard(
    book: Book,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    progress: Float? = null,
    width: Int = 124,
    height: Int = 186
) {
    Column(
        modifier = modifier
            .width(width.dp)
            .clickable { onClick() }
    ) {
        Box(
            modifier = Modifier
                .width(width.dp)
                .height(height.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(ObsidianSurfaceElevated)
                .border(1.dp, ObsidianBorder, RoundedCornerShape(12.dp))
        ) {
            if (!book.coverUrl.isNullOrEmpty()) {
                AsyncImage(
                    model = book.coverUrl,
                    contentDescription = book.title,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
            } else {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Book,
                        contentDescription = null,
                        tint = TextMuted,
                        modifier = Modifier.size(32.dp)
                    )
                }
            }

            // Subtle gradient shadow at bottom of cover
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(40.dp)
                    .align(Alignment.BottomCenter)
                    .background(
                        Brush.verticalGradient(
                            listOf(Color.Transparent, Color(0xAA000000))
                        )
                    )
            )

            // Direct PDF Badge
            Surface(
                shape = RoundedCornerShape(topStart = 0.dp, bottomStart = 0.dp, topEnd = 6.dp, bottomEnd = 6.dp),
                color = ObsidianSurface.copy(alpha = 0.85f),
                border = androidx.compose.foundation.BorderStroke(0.5.dp, ObsidianBorder),
                modifier = Modifier
                    .padding(top = 8.dp)
                    .align(Alignment.TopStart)
            ) {
                Text(
                    text = book.extension.uppercase(),
                    color = IceWhite,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.ExtraBold,
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                )
            }

            // Bottom reading progress bar if available
            if (progress != null && progress > 0f) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(4.dp)
                        .align(Alignment.BottomCenter)
                        .background(Color(0x66000000))
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth(fraction = progress.coerceIn(0.05f, 1f))
                            .fillMaxHeight()
                            .background(IceWhite)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            text = book.title,
            color = TextPrimary,
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )

        Text(
            text = book.author,
            color = TextMuted,
            fontSize = 11.sp,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
    }
}

/**
 * Top 10 Styled card featuring large ranking numerals.
 */
@Composable
fun Top10PosterCard(
    rank: Int,
    book: Book,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .clickable { onClick() }
            .padding(end = 12.dp),
        verticalAlignment = Alignment.Bottom
    ) {
        // Giant stylized Rank Numeral
        Text(
            text = "$rank",
            fontSize = 82.sp,
            fontWeight = FontWeight.Black,
            fontFamily = FontFamily.SansSerif,
            color = Color(0xFF2C2C35),
            textAlign = TextAlign.End,
            modifier = Modifier
                .width(48.dp)
                .offset(x = 8.dp, y = 4.dp)
        )

        // Poster Card
        StreamingPosterCard(
            book = book,
            onClick = onClick,
            width = 118,
            height = 177
        )
    }
}

/**
 * Netflix-Style Hero Billboard spotlighting current active book or featured masterpiece.
 */
@Composable
fun HeroBillboard(
    featuredBook: Book,
    activeReadingBook: DownloadedBook?,
    onResumeReading: () -> Unit,
    onViewDetails: () -> Unit,
    modifier: Modifier = Modifier
) {
    val displayBook = if (activeReadingBook != null) {
        Book(
            id = activeReadingBook.id,
            title = activeReadingBook.title,
            author = activeReadingBook.author,
            publisher = "VitreBook Storage",
            year = "Recent",
            pages = activeReadingBook.totalPages.toString(),
            language = "English",
            size = "${activeReadingBook.fileSize / (1024 * 1024)} MB",
            extension = "pdf",
            coverUrl = activeReadingBook.coverUrl,
            md5 = activeReadingBook.id,
            source = "Downloaded",
            description = "Resuming offline reading session.",
            downloadUrl = ""
        )
    } else {
        featuredBook
    }

    val progressFraction: Float = if (activeReadingBook != null && activeReadingBook.totalPages > 0) {
        activeReadingBook.lastReadPage.toFloat() / activeReadingBook.totalPages.toFloat()
    } else {
        0f
    }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(380.dp)
            .background(ObsidianBackground)
    ) {
        // Backdrop Image
        if (!displayBook.coverUrl.isNullOrEmpty()) {
            AsyncImage(
                model = displayBook.coverUrl,
                contentDescription = displayBook.title,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .fillMaxSize()
            )
        }

        // Multi-layer Cinematic Gradient Wash
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color(0x33000000),
                            Color(0x88000000),
                            ObsidianBackground.copy(alpha = 0.95f),
                            ObsidianBackground
                        )
                    )
                )
        )

        // Top Subtle Glass Edge
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(1.dp)
                .background(ObsidianBorder)
        )

        // Hero Content
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 20.dp, vertical = 20.dp),
            verticalArrangement = Arrangement.Bottom
        ) {
            // Streaming Category / Match Tag
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Surface(
                    shape = RoundedCornerShape(4.dp),
                    color = if (activeReadingBook != null) IceWhite.copy(alpha = 0.15f) else Color(0x33FFFFFF),
                    border = androidx.compose.foundation.BorderStroke(1.dp, ObsidianBorder)
                ) {
                    Text(
                        text = if (activeReadingBook != null) "CONTINUE READING" else "FEATURED MASTERPIECE",
                        color = IceWhite,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.ExtraBold,
                        letterSpacing = 1.sp,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }

                Text(
                    text = "98% Match",
                    color = IceWhite,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )

                Text(
                    text = "${displayBook.pages} Pages",
                    color = TextMuted,
                    fontSize = 11.sp
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Title
            Text(
                text = displayBook.title,
                color = IceWhite,
                fontSize = 24.sp,
                fontWeight = FontWeight.Black,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                lineHeight = 28.sp
            )

            Spacer(modifier = Modifier.height(4.dp))

            // Author & Synopsis
            Text(
                text = "By ${displayBook.author}",
                color = SilverAccent,
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium
            )

            if (!displayBook.description.isNullOrEmpty()) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = displayBook.description,
                    color = TextMuted,
                    fontSize = 12.sp,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
            }

            // Progress bar if in progress
            if (progressFraction > 0f) {
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    LinearProgressIndicator(
                        progress = { progressFraction.coerceIn(0.01f, 1f) },
                        modifier = Modifier
                            .weight(1f)
                            .height(4.dp)
                            .clip(RoundedCornerShape(2.dp)),
                        color = IceWhite,
                        trackColor = Color(0xFF27272A)
                    )
                    Text(
                        text = "Page ${activeReadingBook?.lastReadPage} of ${activeReadingBook?.totalPages}",
                        color = TextMuted,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Primary Play / Resume Button
                Button(
                    onClick = onResumeReading,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = IceWhite,
                        contentColor = Color.Black
                    ),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 20.dp, vertical = 10.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(
                        imageVector = Icons.Default.PlayArrow,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = if (activeReadingBook != null) "Resume" else "Read Now",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                }

                // Secondary Info / Details Button
                OutlinedButton(
                    onClick = onViewDetails,
                    colors = ButtonDefaults.outlinedButtonColors(
                        containerColor = ObsidianSurface.copy(alpha = 0.8f),
                        contentColor = IceWhite
                    ),
                    border = androidx.compose.foundation.BorderStroke(1.dp, ObsidianBorder),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 10.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Details",
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 14.sp
                    )
                }
            }
        }
    }
}
