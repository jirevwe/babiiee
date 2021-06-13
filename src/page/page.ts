export class Page {
  constructor(readonly parentUrl: string) {}

  getPageUrls(htmlBody: Document): string[] {
    const hrefs = htmlBody.getElementsByTagName('a');

    const urls = [];
    for (let i = 0; i < hrefs.length; i++) {
      const url = this.normalizeUrl(hrefs[i].href);

      // filter out empty urls
      if (url.length > 0) {
        urls.push(url);
      }
    }

    return urls;
  }

  /**
   * Filters out unwanted urls or uri schemes and appends a forward slash at the end of each valid url
   * 
   * Undesired url types include:
    - about:blank's
    - empty href tags
    - other Uri types
    - subdomains of the parent url
    - other domains
   * 
   * @param url the url to be normalised
   * @returns the normalised url or an empty string
   */
  normalizeUrl(url: string): string {
    try {
      // reject empty urls
      if (url.length === 0) {
        return '';
      }

      // reject about:blank urls
      if (url.startsWith('about:blank')) {
        return '';
      }

      // handle weird edge case in relative urls that start with ".."
      if (url.startsWith('.')) {
        url = url.replace(/^../gi, '');
      }

      // transform relative urls to absolute urls
      if (url.startsWith('/')) {
        url = `${this.parentUrl}${url.substring(1)}`;
      }

      const { host, protocol } = new URL(url);

      if (!['http:', 'https:'].includes(protocol)) {
        return '';
      }

      const { host: parentHost } = new URL(this.parentUrl);

      // filter out urls in other domains and subdomains
      if (host !== parentHost) {
        return '';
      }

      // append a forward slash to all valid urls
      if (!url.endsWith('/')) {
        url = `${url}/`;
      }

      return url;
    } catch (error) {
      return '';
    }
  }
}
