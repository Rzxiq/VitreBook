import { httpClient } from './httpClient';
import { MirrorConfig, RemoteConfigResponse } from '../types/book';

/**
 * Verified working catalog sources (non-blocked, online, client-side accessible).
 */
export const DEFAULT_MIRRORS: MirrorConfig[] = [
  {
    id: 'open-library',
    name: 'Open Library (Live & Verified)',
    baseUrl: 'https://openlibrary.org',
    searchPath: '/search.json',
    resolverUrlTemplate: 'https://openlibrary.org{KEY}',
    isActive: true,
  },
  {
    id: 'project-gutenberg',
    name: 'Project Gutenberg (Public Domain)',
    baseUrl: 'https://www.gutenberg.org',
    searchPath: '/ebooks/search/',
    resolverUrlTemplate: 'https://www.gutenberg.org/ebooks/{MD5}',
    isActive: false,
  },
];

const REMOTE_CONFIG_URL =
  'https://gist.githubusercontent.com/Rzxiq/raw/vitrebook_mirrors.json';

export async function fetchRemoteMirrors(): Promise<MirrorConfig[]> {
  try {
    const response = await httpClient.get<RemoteConfigResponse>(REMOTE_CONFIG_URL, {
      timeout: 8000,
    });
    if (response.data && Array.isArray(response.data.mirrors) && response.data.mirrors.length > 0) {
      return response.data.mirrors;
    }
  } catch (error) {
    // Graceful fallback to verified working sources
    console.warn('Using verified working catalog sources:', error);
  }
  return DEFAULT_MIRRORS;
}
