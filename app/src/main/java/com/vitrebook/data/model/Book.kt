package com.vitrebook.data.model

import com.google.gson.annotations.SerializedName

data class Book(
    @SerializedName("id") val id: String,
    @SerializedName("title") val title: String,
    @SerializedName("author") val author: String,
    @SerializedName("publisher") val publisher: String = "",
    @SerializedName("year") val year: String = "",
    @SerializedName("pages") val pages: String = "150",
    @SerializedName("language") val language: String = "English",
    @SerializedName("size") val size: String = "1.5 MB",
    @SerializedName("extension") val extension: String = "pdf",
    @SerializedName("coverUrl") val coverUrl: String? = null,
    @SerializedName("md5") val md5: String,
    @SerializedName("source") val source: String = "Local Archive",
    @SerializedName("description") val description: String? = null,
    @SerializedName("downloadUrl") val downloadUrl: String? = null,
    @SerializedName("editionPageUrl") val editionPageUrl: String? = null
)

data class DownloadedBook(
    @SerializedName("id") val id: String,
    @SerializedName("md5") val md5: String,
    @SerializedName("title") val title: String,
    @SerializedName("author") val author: String,
    @SerializedName("localFilePath") val localFilePath: String,
    @SerializedName("fileSize") val fileSize: Long,
    @SerializedName("extension") val extension: String = "pdf",
    @SerializedName("downloadedAt") val downloadedAt: Long = System.currentTimeMillis(),
    @SerializedName("totalPages") var totalPages: Int = 1,
    @SerializedName("lastReadPage") var lastReadPage: Int = 0,
    @SerializedName("coverUrl") val coverUrl: String? = null,
    @SerializedName("source") val source: String = "Offline Library"
)

data class DownloadProgress(
    val bookId: String,
    val bytesWritten: Long,
    val totalBytes: Long,
    val percentage: Int,
    val speedFormatted: String
)
