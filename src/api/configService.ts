import { httpClient } from './httpClient';
import { MirrorConfig, RemoteConfigResponse } from '../types/book';

export const DEFAULT_MIRRORS: MirrorConfig[] = [
  {
    id: 'libgen-is',
    name: 'Libgen.is (Primary)',
    baseUrl: 'https://libgen.is',
    searchPath: '/search.php',
    resolverUrlTemplate: 'https://library.lol/main/{MD5}',
    isActive: true,
  },
  {
    id: 'libgen-rs',
    name: 'Libgen.rs (Mirror 1)',
    baseUrl: 'https://libgen.rs',
    searchPath: '/search.php',
    resolverUrlTemplate: 'https://library.lol/main/{MD5}',
    isActive: false,
  },
  {
    id: 'libgen-st',
    name: 'Libgen.li (Mirror 2)',
    baseUrl: 'https://libgen.li',
    searchPath: '/index.php',
    resolverUrlTemplate: 'https://libgen.li/ads.php?md5={MD5}',
    isActive: false,
  },
];

const REMOTE_CONFIG_URL =
  'https://gist.githubusercontent.com/ranarzxi3/raw/vitrebook_mirrors.json';

export async function fetchRemoteMirrors(): Promise<MirrorConfig[]> {
  try {
    const response = await httpClient.get<RemoteConfigResponse>(REMOTE_CONFIG_URL, {
      timeout: 8000,
    });
    if (response.data && Array.isArray(response.data.mirrors) && response.data.mirrors.length > 0) {
      return response.data.mirrors;
    }
  } catch (error) {
    // Graceful fallback to default mirrors on network failure
    console.warn('Unable to load remote mirror gist, using defaults:', error);
  }
  return DEFAULT_MIRRORS;
}
