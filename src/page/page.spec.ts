import { Page } from './page';
import { JSDOM } from 'jsdom';
import { loadHTMLPage } from './mocks';

describe('Page tests', () => {
  it.each`
    testDescription                                | parentUrl                 | url                              | expected
    ${'the same as the parent'}                    | ${'https://example.com/'} | ${'https://example.com/'}        | ${'https://example.com/'}
    ${'a direct link to a resource'}               | ${'https://example.com/'} | ${'https://example.com/food'}    | ${'https://example.com/food/'}
    ${'relative without a trailing forward slash'} | ${'https://example.com/'} | ${'/food'}                       | ${'https://example.com/food/'}
    ${'relative with a trailing forward slash'}    | ${'https://example.com/'} | ${'/food/'}                      | ${'https://example.com/food/'}
    ${'just a forward slash'}                      | ${'https://example.com/'} | ${'/'}                           | ${'https://example.com/'}
    ${'an empty href'}                             | ${'https://example.com/'} | ${''}                            | ${''}
    ${'a different uri type'}                      | ${'https://example.com/'} | ${'mailto:support@example.com/'} | ${''}
    ${'a different uri type'}                      | ${'https://example.com/'} | ${'tel:+2341234567890'}          | ${''}
    ${'an "about:blank"'}                          | ${'https://example.com/'} | ${'about:blank#header'}          | ${''}
    ${'a subdomain of the parent'}                 | ${'https://example.com/'} | ${'https://food.example.com/'}   | ${''}
    ${'has undesirable start characters'}          | ${'https://example.com/'} | ${'../blog/team/'}               | ${'https://example.com/blog/team/'}
  `(
    'should normalize a child url correctly when the uri is $testDescription',
    function ({ parentUrl, url, expected }) {
      const page = new Page(parentUrl);
      const normalized = page.normalizeUrl(url);
      expect(normalized).toBe(expected);
    }
  );

  it.each`
    pageName       | parentUrl                | expected
    ${'page.html'} | ${'https://example.com'} | ${4}
  `(
    'should retrieve urls from $pageName from $parentUrl',
    async function ({ parentUrl, pageName, expected }) {
      const page = new Page(parentUrl);
      const htmlMock = await loadHTMLPage(pageName);
      const dom = new JSDOM(htmlMock);
      const urls = page.getPageUrls(dom.window.document);

      expect(urls.length).toBe(expected);
    }
  );
});
