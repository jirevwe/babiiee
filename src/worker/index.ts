import { Page } from '../page';
import { Fetcher } from '../fetcher';
import { parentPort } from 'worker_threads';

export async function fetchHtmlAndExtractLink(url: string) {
  const fetcher = new Fetcher();
  const page = new Page(url);

  const res = await fetcher.fetch(url);
  const urls = page.getPageUrls(res.window.document);

  parentPort.postMessage(urls)
}

parentPort.on('message', fetchHtmlAndExtractLink);
