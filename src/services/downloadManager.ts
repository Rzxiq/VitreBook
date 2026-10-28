import ReactNativeBlobUtil from 'react-native-blob-util';
import { ScrapedBook, DownloadedBook, DownloadProgress } from '../types/book';
import { sanitizeFilename } from '../utils/fileHelpers';
import { useLibraryStore } from '../store/useLibraryStore';

export class DownloadManager {
  private static activeTasks: Map<string, any> = new Map();

  /**
   * Download a book PDF directly to local app storage with progress tracking.
   */
  static async startDownload(
    book: ScrapedBook,
    directUrl: string,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<DownloadedBook> {
    const { dirs } = ReactNativeBlobUtil.fs;
    const cleanTitle = sanitizeFilename(book.title);
    const fileName = `${cleanTitle}_${book.md5.slice(0, 8)}.${book.extension || 'pdf'}`;
    const destinationPath = `${dirs.DocumentDir}/${fileName}`;

    let lastBytes = 0;
    let lastTime = Date.now();

    const task = ReactNativeBlobUtil.config({
      path: destinationPath,
      fileCache: true,
      appendExt: book.extension || 'pdf',
    }).fetch('GET', directUrl);

    this.activeTasks.set(book.md5, task);

    task.progress({ count: 10 }, (received: string, total: string) => {
      const written = parseInt(received, 10) || 0;
      const contentLength = parseInt(total, 10) || 0;
      const now = Date.now();
      const timeDelta = (now - lastTime) / 1000;
      const bytesDelta = written - lastBytes;

      const speed = timeDelta > 0 ? bytesDelta / timeDelta : 0;
      lastBytes = written;
      lastTime = now;

      const percentage = contentLength > 0 ? Math.round((written / contentLength) * 100) : 0;

      if (onProgress) {
        onProgress({
          bookId: book.id,
          bytesWritten: written,
          contentLength,
          percentage,
          speedBytesPerSec: speed,
        });
      }
    });

    try {
      const res = await task;
      const filePath = res.path();
      const stat = await ReactNativeBlobUtil.fs.stat(filePath);

      const downloadedBook: DownloadedBook = {
        id: book.id,
        md5: book.md5,
        title: book.title,
        author: book.author,
        localFilePath: filePath,
        fileSize: Number(stat.size),
        extension: book.extension || 'pdf',
        downloadedAt: Date.now(),
        totalPages: parseInt(book.pages, 10) || 0,
        lastReadPage: 1,
        coverUrl: book.coverUrl,
      };

      useLibraryStore.getState().addBook(downloadedBook);
      return downloadedBook;
    } finally {
      this.activeTasks.delete(book.md5);
    }
  }

  static cancelDownload(md5: string): void {
    const task = this.activeTasks.get(md5);
    if (task) {
      task.cancel();
      this.activeTasks.delete(md5);
    }
  }

  static async deleteBook(book: DownloadedBook): Promise<void> {
    try {
      const exists = await ReactNativeBlobUtil.fs.exists(book.localFilePath);
      if (exists) {
        await ReactNativeBlobUtil.fs.unlink(book.localFilePath);
      }
    } catch (e) {
      console.warn('Failed to delete file from disk:', e);
    } finally {
      useLibraryStore.getState().removeBook(book.md5);
    }
  }
}
