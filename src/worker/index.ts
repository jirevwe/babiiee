import { Page } from '../page';
import { Fetcher } from '../fetcher';
import { parentPort } from 'worker_threads';
import { performance } from 'perf_hooks';
import { WorkerRequest, WorkerResponse } from 'common';

export default async function fetchHtmlAndExtractLink(message: WorkerRequest) {
  try {
    const start = performance.now();

    const fetcher = new Fetcher(message.timeout);
    const page = new Page(message.rootUrl);

    const res = await fetcher.fetch(message.currentUrl);
    const urls = page.getPageUrls(res.window.document);

    const end = performance.now();

    const payload: WorkerResponse = {
      status: 'success',
      timing: end - start,
      parentUrl: message.parentUrl,
      currentUrl: message.currentUrl,
      childrenUrls: urls.filter((it) => it.length > 0)
    };

    parentPort.postMessage(payload);
  } catch (error) {
    const payload: WorkerResponse = {
      status: 'failed',
      message: error.message,
      currentUrl: message.currentUrl
    };

    parentPort.postMessage(payload);
  }
}

parentPort.on('message', fetchHtmlAndExtractLink);
