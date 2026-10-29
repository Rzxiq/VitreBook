package com.vitrebook.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocalLibrary
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    object Explore : Screen("explore", "Explore", Icons.Default.Search)
    object Library : Screen("library", "Library", Icons.Default.LocalLibrary)
    object Settings : Screen("settings", "Settings", Icons.Default.Settings)
}
