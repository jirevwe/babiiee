import { Page } from '../page';
import { Fetcher } from '../fetcher';
import { parentPort } from 'worker_threads';

export async function fetchHtmlAndExtractLink(message: {
  parent: string;
  currentUrl: string;
}) {
  const fetcher = new Fetcher();
  const page = new Page(message.currentUrl);

  const res = await fetcher.fetch(message.currentUrl);
  const urls = page.getPageUrls(res.window.document);

  parentPort.postMessage({
    parent: message.parent,
    currentUrl: message.currentUrl,
    childrenUrls: urls
  });
}

parentPort.on('message', fetchHtmlAndExtractLink);
