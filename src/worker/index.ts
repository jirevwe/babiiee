import { Page } from '../page';
import { Fetcher } from '../fetcher';

export default async function fetchHtmlAndExtractLink(message: {
  parentUrl: string;
  currentUrl: string;
}) {
  const fetcher = new Fetcher();
  const page = new Page(message.currentUrl);

  const res = await fetcher.fetch(message.currentUrl);
  const urls = page.getPageUrls(res.window.document);

  return {
    parentUrl: message.parentUrl,
    currentUrl: message.currentUrl,
    childrenUrls: urls.filter((it) => it.length > 0)
  };
}
