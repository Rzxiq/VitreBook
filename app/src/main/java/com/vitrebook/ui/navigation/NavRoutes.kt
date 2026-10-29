package com.vitrebook.ui.navigation

sealed class Screen(val route: String, val title: String, val icon: String) {
    object Explore : Screen("explore", "Explore", "🔍")
    object Library : Screen("library", "Library", "📚")
    object Settings : Screen("settings", "Settings", "⚙️")
}
