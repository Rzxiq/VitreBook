package com.vitrebook

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
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
                var currentTab by remember { mutableStateOf<Screen>(Screen.Explore) }
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
                        // Full Screen Native PDF Reader
                        activeReadingBook != null -> {
                            PdfReaderScreen(
                                book = activeReadingBook!!,
                                libraryManager = libraryManager,
                                onBack = { activeReadingBook = null }
                            )
                        }

                        // Book Detail View
                        selectedBookForDetail != null -> {
                            BookDetailScreen(
                                book = selectedBookForDetail!!,
                                libraryManager = libraryManager,
                                onBack = { selectedBookForDetail = null },
                                onOpenReader = { downloaded ->
                                    selectedBookForDetail = null
                                    activeReadingBook = downloaded
                                }
                            )
                        }

                        // Main Tabs Scaffold with Material 3 NavigationBar
                        else -> {
                            Scaffold(
                                containerColor = ObsidianBackground,
                                bottomBar = {
                                    NavigationBar(
                                        containerColor = ObsidianBackground,
                                        tonalElevation = 0.dp
                                    ) {
                                        val items = listOf(Screen.Explore, Screen.Library, Screen.Settings)
                                        items.forEach { screen ->
                                            val isSelected = currentTab == screen
                                            NavigationBarItem(
                                                selected = isSelected,
                                                onClick = { currentTab = screen },
                                                icon = {
                                                    Text(
                                                        text = screen.icon,
                                                        fontSize = if (isSelected) 20.sp else 18.sp
                                                    )
                                                },
                                                label = {
                                                    Text(
                                                        text = screen.title,
                                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                                        fontSize = 11.sp
                                                    )
                                                },
                                                colors = NavigationBarItemDefaults.colors(
                                                    selectedIconColor = TextPrimary,
                                                    selectedTextColor = TextPrimary,
                                                    unselectedIconColor = TextMuted,
                                                    unselectedTextColor = TextMuted,
                                                    indicatorColor = ObsidianSurfaceElevated
                                                )
                                            )
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
                                        is Screen.Explore -> {
                                            ExploreScreen(
                                                onBookSelected = { book ->
                                                    selectedBookForDetail = book
                                                }
                                            )
                                        }
                                        is Screen.Library -> {
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
