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
}

export interface MirrorConfig {
  id: string;
  name: string;
  baseUrl: string;
  searchPath: string;
  resolverUrlTemplate: string;
  isActive: boolean;
}

export type SourceConfig = MirrorConfig;

export interface RemoteConfigResponse {
  version: number;
  updatedAt: string;
  mirrors: MirrorConfig[];
}

export interface DownloadProgress {
  bookId: string;
  bytesWritten: number;
  contentLength: number;
  percentage: number;
  speedBytesPerSec: number;
}
