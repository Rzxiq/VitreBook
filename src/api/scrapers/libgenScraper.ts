import * as cheerio from 'cheerio';
import { httpClient } from '../httpClient';
import { ScrapedBook } from '../../types/book';

/**
 * Searches the catalog mirror (e.g. libgen.la) and parses the HTML table response into ScrapedBook items.
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

  const isIndexPhp = cleanPath.includes('index.php') || cleanBase.includes('libgen.la') || cleanBase.includes('libgen.li');

  const params: Record<string, any> = isIndexPhp
    ? {
        req: query,
        res: '50',
        columns: ['t', 'a'],
        objects: ['f', 'e', 's'],
        topics: ['l', 'f'],
      }
    : {
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
 * Parses raw HTML table from libgen.la and compatible mirrors into Catalog/Scraped Book entities.
 */
export function parseSearchHtml(
  html: string,
  baseUrl: string,
  extensionFilter?: 'pdf' | 'epub'
): ScrapedBook[] {
  const $ = cheerio.load(html);
  const results: ScrapedBook[] = [];

  $('table').each((_, table) => {
    const rows = $(table).find('tr');
    if (rows.length < 2) return;

    rows.each((rowIndex, row) => {
      // First row is typically header
      if (rowIndex === 0) return;

      const cells = $(row).find('td');
      if (cells.length < 6) return;

      const id = $(cells[0]).text().trim();
      const author = $(cells[1]).text().trim();

      // Title cell
      const titleCell = $(cells[2]);
      const titleAnchor = titleCell.find('a[id], a[href*="book"], a[href*="ads.php"], a').first();
      const rawTitle = titleAnchor.length ? titleAnchor.text().trim() : titleCell.text().trim();
      const title = rawTitle.replace(/\s+/g, ' ');

      const publisher = cells.length > 3 ? $(cells[3]).text().trim() : '';
      const year = cells.length > 4 ? $(cells[4]).text().trim() : '';
      const pages = cells.length > 5 ? $(cells[5]).text().trim() : '';
      const language = cells.length > 6 ? $(cells[6]).text().trim() : 'English';
      const size = cells.length > 7 ? $(cells[7]).text().trim() : 'N/A';
      const extension = cells.length > 8 ? $(cells[8]).text().trim().toLowerCase() : 'pdf';

      // Apply extension filter if provided
      if (extensionFilter && extension && extension !== extensionFilter) {
        return;
      }

      // Extract 32-character MD5 hash from libgen.la mirror links or anchors
      let md5 = '';
      const mirrorAnchors = $(row).find(
        'a[href*="md5="], a[href*="/ads.php"], a[href*="/get.php"], a[href*="/main/"], a[href*="library.lol"]'
      );

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
          extension: extension || 'pdf',
          coverUrl,
          md5,
        });
      }
    });
  });

  return results;
}
