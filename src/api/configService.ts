import { httpClient } from './httpClient';
import { MirrorConfig, RemoteConfigResponse } from '../types/book';

/**
 * Active catalog mirrors with libgen.la fully integrated as primary.
 */
export const DEFAULT_MIRRORS: MirrorConfig[] = [
  {
    id: 'libgen-la',
    name: 'Libgen.la (Primary Mirror)',
    baseUrl: 'https://libgen.la',
    searchPath: '/index.php',
    resolverUrlTemplate: 'https://libgen.la/ads.php?md5={MD5}',
    isActive: true,
  },
  {
    id: 'open-library',
    name: 'Open Library (Global Catalog)',
    baseUrl: 'https://openlibrary.org',
    searchPath: '/search.json',
    resolverUrlTemplate: 'https://openlibrary.org{KEY}',
    isActive: false,
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
    console.warn('Using default configured mirrors with libgen.la:', error);
  }
  return DEFAULT_MIRRORS;
}
