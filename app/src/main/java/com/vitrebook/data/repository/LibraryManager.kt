package com.vitrebook.data.repository

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.vitrebook.data.model.DownloadedBook
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.io.File

class LibraryManager(private val context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("vitrebook_library", Context.MODE_PRIVATE)
    private val gson = Gson()
    private val lock = Any()

    private val _booksFlow = MutableStateFlow<List<DownloadedBook>>(emptyList())
    val booksFlow: StateFlow<List<DownloadedBook>> = _booksFlow.asStateFlow()

    init {
        loadBooks()
    }

    fun loadBooks() = synchronized(lock) {
        val json = prefs.getString("books_json", null)
        if (json.isNullOrEmpty()) {
            _booksFlow.value = emptyList()
            return
        }
        val type = object : TypeToken<List<DownloadedBook>>() {}.type
        val list: List<DownloadedBook> = try {
            gson.fromJson(json, type) ?: emptyList()
        } catch (e: Exception) {
            emptyList()
        }
        _booksFlow.value = list.sortedByDescending { it.downloadedAt }
    }

    private fun persistBooks(list: List<DownloadedBook>) = synchronized(lock) {
        val json = gson.toJson(list)
        prefs.edit().putString("books_json", json).apply()
        _booksFlow.value = list.sortedByDescending { it.downloadedAt }
    }

    fun saveBook(book: DownloadedBook) = synchronized(lock) {
        val current = _booksFlow.value.toMutableList()
        val index = current.indexOfFirst { it.md5 == book.md5 }
        if (index >= 0) {
            current[index] = book
        } else {
            current.add(0, book)
        }
        persistBooks(current)
    }

    fun getBookByMd5(md5: String): DownloadedBook? = synchronized(lock) {
        return _booksFlow.value.find { it.md5 == md5 }
    }

    fun updateReadingProgress(md5: String, page: Int, totalPages: Int) = synchronized(lock) {
        val current = _booksFlow.value.toMutableList()
        val index = current.indexOfFirst { it.md5 == md5 }
        if (index >= 0) {
            val updated = current[index].copy(
                lastReadPage = page,
                totalPages = if (totalPages > 0) totalPages else current[index].totalPages
            )
            current[index] = updated
            persistBooks(current)
        }
    }

    fun deleteBook(md5: String) = synchronized(lock) {
        val current = _booksFlow.value.toMutableList()
        val book = current.find { it.md5 == md5 }
        if (book != null) {
            try {
                val file = File(book.localFilePath)
                if (file.exists()) {
                    file.delete()
                }
            } catch (ignored: Exception) {}
            current.removeAll { it.md5 == md5 }
            persistBooks(current)
        }
    }

    fun clearAll() = synchronized(lock) {
        _booksFlow.value.forEach { book ->
            try {
                val file = File(book.localFilePath)
                if (file.exists()) file.delete()
            } catch (ignored: Exception) {}
        }
        prefs.edit().clear().apply()
        _booksFlow.value = emptyList()
    }
}
