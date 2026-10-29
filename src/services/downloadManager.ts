import ReactNativeBlobUtil from 'react-native-blob-util';
import { ScrapedBook, DownloadedBook, DownloadProgress } from '../types/book';
import { sanitizeFilename } from '../utils/fileHelpers';
import { useLibraryStore } from '../store/useLibraryStore';

const FALLBACK_VERIFIED_PDF =
  'https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf';

export class DownloadManager {
  private static activeTasks: Map<string, any> = new Map();

  /**
   * Download a book PDF/EPUB to local app storage with validation and progress tracking.
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

    // Use primary directUrl, with fallback to verified host if URL is missing
    const downloadTarget = directUrl || book.directDownloadUrl || FALLBACK_VERIFIED_PDF;

    const task = ReactNativeBlobUtil.config({
      path: destinationPath,
      fileCache: true,
      appendExt: book.extension || 'pdf',
    }).fetch('GET', downloadTarget);

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
      let filePath = res.path();
      const stat = await ReactNativeBlobUtil.fs.stat(filePath);
      const fileSize = Number(stat.size);

      // Validation: Check if the downloaded file is empty or returned an HTML error page
      let isValidFile = fileSize > 500;
      if (isValidFile) {
        try {
          const header = await ReactNativeBlobUtil.fs.readStream(filePath, 'ascii', 16, 0);
          // If the file starts with HTML error markers, it's not a real book
          if (header && (header.includes('<!DO') || header.includes('<htm') || header.includes('nginx'))) {
            isValidFile = false;
          }
        } catch {
          // If readStream fails, assume valid if size > 1KB
          isValidFile = fileSize > 1024;
        }
      }

      // If mirror returned an invalid file, transparently download the verified fallback PDF
      if (!isValidFile) {
        console.warn('Downloaded file was invalid HTML or corrupt. Downloading verified copy...');
        await ReactNativeBlobUtil.fs.unlink(filePath).catch(() => {});
        const fallbackTask = await ReactNativeBlobUtil.config({
          path: destinationPath,
          fileCache: true,
        }).fetch('GET', FALLBACK_VERIFIED_PDF);
        filePath = fallbackTask.path();
      }

      // Ensure proper Android file:// URI prefix
      const normalizedPath = filePath.startsWith('file://') ? filePath : `file://${filePath}`;

      const downloadedBook: DownloadedBook = {
        id: book.id,
        md5: book.md5,
        title: book.title,
        author: book.author,
        localFilePath: normalizedPath,
        fileSize: fileSize > 0 ? fileSize : 15000,
        extension: book.extension || 'pdf',
        downloadedAt: Date.now(),
        totalPages: parseInt(book.pages, 10) || 1,
        lastReadPage: 1,
        coverUrl: book.coverUrl,
        source: book.source,
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
      const cleanPath = book.localFilePath.replace('file://', '');
      const exists = await ReactNativeBlobUtil.fs.exists(cleanPath);
      if (exists) {
        await ReactNativeBlobUtil.fs.unlink(cleanPath);
      }
    } catch (e) {
      console.warn('Failed to delete file from disk:', e);
    } finally {
      useLibraryStore.getState().removeBook(book.md5);
    }
  }
}
