import { searchLibgenCatalog } from './libgenScraper';
import { resolveDirectFileUrl } from './mirrorResolver';
import { ScrapedBook, MirrorConfig } from '../../types/book';

export class ScraperManager {
  static async search(
    activeMirror: MirrorConfig,
    query: string,
    filter?: 'pdf' | 'epub'
  ): Promise<ScrapedBook[]> {
    return searchLibgenCatalog(
      activeMirror.baseUrl,
      activeMirror.searchPath,
      query,
      filter
    );
  }

  static async resolveDownloadUrl(
    activeMirror: MirrorConfig,
    md5: string
  ): Promise<string> {
    return resolveDirectFileUrl(md5, activeMirror.resolverUrlTemplate);
  }
}

export * from './libgenScraper';
export * from './mirrorResolver';
