import { Worker } from 'worker_threads';
import { join } from 'path';
import { Page } from './page';
import { Fetcher } from './fetcher';

async function run() {
  const parentUrl = 'https://monzo.com/';
  const workers = initWorkers(20);

  const queue = [parentUrl];
  const set = new Set();

  // scrape the home page
  set.add(queue[0]);

  const fetcher = new Fetcher();
  const page = new Page(parentUrl);

  const res = await fetcher.fetch(parentUrl);
  const urls = page.getPageUrls(res.window.document);
  queue.push(...urls);

  // register callback
  for (const w of workers) {
    // process the first item on the queue
    w.postMessage(queue.shift());

    // the worker has completed it's work
    w.on('message', (message) => {
      for (const url of message) {
        queue.push(url);
      }

      console.log(queue.length, set.size, queue[0], w.threadId);

      const newUrl = queue.shift();
      if (!set.has(newUrl)) {
        set.add(newUrl);
      }
      w.postMessage(newUrl);
    });

    w.on('error', (error) => {
      console.log(error);
    });

    w.on('exit', (code) => {
      console.log(code);
    });
  }
}

function initWorkers(count: number): Worker[] {
  const workers = [];

  for (let i = 0; i < count; i++) {
    const worker = new Worker(join(__dirname, './worker/index.js'));
    workers.push(worker);
  }

  return workers;
}

run();
