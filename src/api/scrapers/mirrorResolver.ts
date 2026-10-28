import * as cheerio from 'cheerio';
import { httpClient } from '../httpClient';

/**
 * Resolves an MD5 hash into a direct download URL by parsing libgen.la and mirror landing pages.
 */
export async function resolveDirectFileUrl(
  md5: string,
  resolverTemplate: string
): Promise<string> {
  const targetUrl = resolverTemplate.replace('{MD5}', md5);

  const response = await httpClient.get<string>(targetUrl, {
    timeout: 20000,
  });

  const html = response.data;
  return extractDirectUrlFromHtml(html, targetUrl);
}

/**
 * Extract download link from the HTML content of the resolver page (libgen.la/ads.php or library.lol).
 */
export function extractDirectUrlFromHtml(html: string, pageUrl: string): string {
  const $ = cheerio.load(html);
  let directUrl = '';

  // 1. Check for libgen.la "GET" download button or get.php link
  $('a').each((_, el) => {
    if (directUrl) return;
    const text = $(el).text().trim().toUpperCase();
    const href = $(el).attr('href') || '';

    if (
      text === 'GET' ||
      text.includes('DOWNLOAD') ||
      text.includes('CLOUD') ||
      text.includes('IPFS.IO') ||
      text.includes('PINATA') ||
      href.includes('get.php')
    ) {
      if (href.startsWith('http://') || href.startsWith('https://')) {
        directUrl = href;
      } else if (href.startsWith('/')) {
        const urlObj = new URL(pageUrl);
        directUrl = `${urlObj.origin}${href}`;
      }
    }
  });

  // 2. Check for anchor tags directly pointing to .pdf or .epub files
  if (!directUrl) {
    $('a[href$=".pdf"], a[href$=".epub"], a[href*=".pdf?"], a[href*=".epub?"]').each((_, el) => {
      if (directUrl) return;
      const href = $(el).attr('href');
      if (href) {
        if (href.startsWith('http://') || href.startsWith('https://')) {
          directUrl = href;
        } else if (href.startsWith('/')) {
          const urlObj = new URL(pageUrl);
          directUrl = `${urlObj.origin}${href}`;
        }
      }
    });
  }

  // 3. Check for specific IDs or headings in download pages
  if (!directUrl) {
    const candidateHref =
      $('#download a').first().attr('href') ||
      $('h2 a').first().attr('href') ||
      $('table#main a[href*="get.php"]').first().attr('href');

    if (candidateHref) {
      if (candidateHref.startsWith('http')) {
        directUrl = candidateHref;
      } else {
        const urlObj = new URL(pageUrl);
        directUrl = `${urlObj.origin}/${candidateHref.replace(/^\//, '')}`;
      }
    }
  }

  if (!directUrl) {
    throw new Error('Unable to resolve direct download link from mirror page.');
  }

  return directUrl;
}
