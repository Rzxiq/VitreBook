package com.vitrebook

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vitrebook.data.model.Book
import com.vitrebook.data.model.DownloadedBook
import com.vitrebook.data.repository.LibraryManager
import com.vitrebook.ui.navigation.Screen
import com.vitrebook.ui.screens.*
import com.vitrebook.ui.theme.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val libraryManager = LibraryManager(applicationContext)

        setContent {
            VitreBookTheme {
                var currentTab by remember { mutableStateOf<Screen>(Screen.Home) }
                var selectedBookForDetail by remember { mutableStateOf<Book?>(null) }
                var activeReadingBook by remember { mutableStateOf<DownloadedBook?>(null) }

                // System back handler
                BackHandler(enabled = activeReadingBook != null || selectedBookForDetail != null) {
                    when {
                        activeReadingBook != null -> activeReadingBook = null
                        selectedBookForDetail != null -> selectedBookForDetail = null
                    }
                }

                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = ObsidianBackground
                ) {
                    when {
                        // Full Screen Native PDF Reader ("Gesture-Only Theater Mode")
                        activeReadingBook != null -> {
                            PdfReaderScreen(
                                book = activeReadingBook!!,
                                libraryManager = libraryManager,
                                onBack = { activeReadingBook = null }
                            )
                        }

                        // Full-Screen Cinematic Movie-Page Detail View
                        selectedBookForDetail != null -> {
                            BookDetailScreen(
                                book = selectedBookForDetail!!,
                                libraryManager = libraryManager,
                                onBack = { selectedBookForDetail = null },
                                onOpenReader = { downloaded ->
                                    selectedBookForDetail = null
                                    activeReadingBook = downloaded
                                },
                                onBookSelected = { related ->
                                    selectedBookForDetail = related
                                }
                            )
                        }

                        // Main 4-Tab Streaming Glass Dock (Home, Search, Downloads, Settings)
                        else -> {
                            Scaffold(
                                containerColor = ObsidianBackground,
                                bottomBar = {
                                    Surface(
                                        color = ObsidianSurface.copy(alpha = 0.92f),
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(horizontal = 14.dp, vertical = 10.dp)
                                            .clip(RoundedCornerShape(26.dp)),
                                        border = androidx.compose.foundation.BorderStroke(1.dp, ObsidianBorder),
                                        shadowElevation = 12.dp
                                    ) {
                                        NavigationBar(
                                            containerColor = Color.Transparent,
                                            tonalElevation = 0.dp,
                                            modifier = Modifier.height(64.dp)
                                        ) {
                                            val items = listOf(
                                                Screen.Home,
                                                Screen.Search,
                                                Screen.Downloads,
                                                Screen.Settings
                                            )
                                            items.forEach { screen ->
                                                val isSelected = currentTab == screen
                                                NavigationBarItem(
                                                    selected = isSelected,
                                                    onClick = { currentTab = screen },
                                                    icon = {
                                                        Icon(
                                                            imageVector = screen.icon,
                                                            contentDescription = screen.title,
                                                            modifier = Modifier.size(22.dp)
                                                        )
                                                    },
                                                    label = {
                                                        Text(
                                                            text = screen.title,
                                                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                                            fontSize = 10.sp
                                                        )
                                                    },
                                                    colors = NavigationBarItemDefaults.colors(
                                                        selectedIconColor = IceWhite,
                                                        selectedTextColor = IceWhite,
                                                        unselectedIconColor = TextMuted,
                                                        unselectedTextColor = TextMuted,
                                                        indicatorColor = ObsidianSurfaceElevated
                                                    )
                                                )
                                            }
                                        }
                                    }
                                }
                            ) { innerPadding ->
                                Surface(
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .padding(innerPadding),
                                    color = ObsidianBackground
                                ) {
                                    when (currentTab) {
                                        is Screen.Home -> {
                                            HomeScreen(
                                                libraryManager = libraryManager,
                                                onBookSelected = { book ->
                                                    selectedBookForDetail = book
                                                },
                                                onOpenReader = { downloaded ->
                                                    activeReadingBook = downloaded
                                                }
                                            )
                                        }
                                        is Screen.Search -> {
                                            ExploreScreen(
                                                onBookSelected = { book ->
                                                    selectedBookForDetail = book
                                                }
                                            )
                                        }
                                        is Screen.Downloads -> {
                                            LibraryScreen(
                                                libraryManager = libraryManager,
                                                onOpenReader = { downloaded ->
                                                    activeReadingBook = downloaded
                                                }
                                            )
                                        }
                                        is Screen.Settings -> {
                                            SettingsScreen(
                                                libraryManager = libraryManager
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
