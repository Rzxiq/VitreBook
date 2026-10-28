import axios from 'axios';
import packageJson from '../../package.json';

export interface AppRelease {
  version: string;
  hasUpdate: boolean;
  releaseNotes: string;
  apkDownloadUrl?: string;
  publishedAt: string;
}

const GITHUB_REPO = 'ranarzxi3/VitreBook';
const RELEASES_API = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

export async function checkForAppUpdates(): Promise<AppRelease> {
  try {
    const response = await axios.get(RELEASES_API, {
      headers: { Accept: 'application/vnd.github.v3+json' },
      timeout: 10000,
    });

    const tagName = (response.data.tag_name || '').replace(/^v/, '');
    const currentVersion = packageJson.version;

    let apkDownloadUrl: string | undefined;
    if (Array.isArray(response.data.assets)) {
      const apkAsset = response.data.assets.find((asset: any) =>
        asset.name.endsWith('.apk')
      );
      if (apkAsset) {
        apkDownloadUrl = apkAsset.browser_download_url;
      }
    }

    const hasUpdate = isNewerVersion(tagName, currentVersion);

    return {
      version: tagName || currentVersion,
      hasUpdate,
      releaseNotes: response.data.body || 'No release notes provided.',
      apkDownloadUrl,
      publishedAt: response.data.published_at || '',
    };
  } catch (error) {
    return {
      version: packageJson.version,
      hasUpdate: false,
      releaseNotes: '',
      publishedAt: '',
    };
  }
}

function isNewerVersion(remote: string, current: string): boolean {
  if (!remote || !current) return false;
  const rParts = remote.split('.').map(Number);
  const cParts = current.split('.').map(Number);
  for (let i = 0; i < Math.max(rParts.length, cParts.length); i++) {
    const r = rParts[i] || 0;
    const c = cParts[i] || 0;
    if (r > c) return true;
    if (r < c) return false;
  }
  return false;
}
