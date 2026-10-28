import * as cheerio from 'cheerio';
import { httpClient } from '../httpClient';
import { ScrapedBook } from '../../types/book';

/**
 * Searches the catalog mirror and parses the HTML table response into ScrapedBook items.
 */
export async function searchLibgenCatalog(
  baseUrl: string,
  searchPath: string,
  query: string,
  fileExtensionFilter?: 'pdf' | 'epub'
): Promise<ScrapedBook[]> {
  const cleanBase = baseUrl.replace(/\/$/, '');
  const cleanPath = searchPath.startsWith('/') ? searchPath : `/${searchPath}`;
  const searchUrl = `${cleanBase}${cleanPath}`;

  const params: Record<string, string> = {
    req: query,
    open: '0',
    res: '50',
    view: 'simple',
    phrase: '1',
    column: 'def',
  };

  const response = await httpClient.get<string>(searchUrl, { params });
  return parseSearchHtml(response.data, cleanBase, fileExtensionFilter);
}

/**
 * Parses raw HTML table into Catalog/Scraped Book entities.
 */
export function parseSearchHtml(
  html: string,
  baseUrl: string,
  extensionFilter?: 'pdf' | 'epub'
): ScrapedBook[] {
  const $ = cheerio.load(html);
  const results: ScrapedBook[] = [];

  // Libgen standard results table
  $('table').each((_, table) => {
    const rows = $(table).find('tr');
    if (rows.length < 2) return;

    rows.each((rowIndex, row) => {
      // First row is typically header
      if (rowIndex === 0) return;

      const cells = $(row).find('td');
      // Standard Libgen table has 9 to 11 columns
      if (cells.length < 9) return;

      const id = $(cells[0]).text().trim();
      const author = $(cells[1]).text().trim();

      // Title cell
      const titleCell = $(cells[2]);
      const titleAnchor = titleCell.find('a[id], a[href*="book"], a').first();
      const rawTitle = titleAnchor.length ? titleAnchor.text().trim() : titleCell.text().trim();
      const title = rawTitle.replace(/\s+/g, ' ');

      const publisher = $(cells[3]).text().trim();
      const year = $(cells[4]).text().trim();
      const pages = $(cells[5]).text().trim();
      const language = $(cells[6]).text().trim();
      const size = $(cells[7]).text().trim();
      const extension = $(cells[8]).text().trim().toLowerCase();

      // Apply extension filter if provided
      if (extensionFilter && extension !== extensionFilter) {
        return;
      }

      // Extract 32-character MD5 hash from mirror links
      let md5 = '';
      const mirrorAnchors = $(row).find('a[href*="md5="], a[href*="/main/"], a[href*="ads.php"], a[href*="library.lol"]');

      mirrorAnchors.each((_, anchor) => {
        if (md5) return;
        const href = $(anchor).attr('href') || '';
        const md5Match = href.match(/([a-fA-F0-9]{32})/);
        if (md5Match && md5Match[1]) {
          md5 = md5Match[1].toLowerCase();
        }
      });

      // Cover image detection
      let coverUrl: string | undefined;
      const img = $(row).find('img');
      if (img.length > 0) {
        const src = img.attr('src');
        if (src) {
          coverUrl = src.startsWith('http') ? src : `${baseUrl}/${src.replace(/^\//, '')}`;
        }
      }

      if (id && title && md5) {
        results.push({
          id,
          title,
          author,
          publisher,
          year,
          pages,
          language,
          size,
          extension,
          coverUrl,
          md5,
        });
      }
    });
  });

  return results;
}
