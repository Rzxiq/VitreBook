export interface ScrapedBook {
  id: string;
  title: string;
  author: string;
  publisher: string;
  year: string;
  pages: string;
  language: string;
  size: string;
  extension: string;
  coverUrl?: string;
  md5: string;
  source?: 'Open Library' | 'Gutenberg' | 'Libgen' | 'Curated' | string;
  description?: string;
  directDownloadUrl?: string;
}

export type CatalogBook = ScrapedBook;

export interface DownloadedBook {
  id: string;
  md5: string;
  title: string;
  author: string;
  localFilePath: string;
  fileSize: number;
  extension: string;
  downloadedAt: number;
  totalPages: number;
  lastReadPage: number;
  coverUrl?: string;
  source?: string;
}

export interface DownloadProgress {
  bookId: string;
  bytesWritten: number;
  contentLength: number;
  percentage: number;
  speedBytesPerSec: number;
}
