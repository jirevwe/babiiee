import { join } from 'path';
import { Worker } from 'worker_threads';
import { Fetcher } from './fetcher';
import { Page } from './page';
import { setTimeout } from 'timers/promises';
import { WorkerRequest, WorkerResponse } from 'common';
import EventEmitter from 'events';

async function run() {
  let visitedCount = 0;
  let totalTime = 0;
  const timeout = 1000 * 30;
  const rootUrl = 'https://monzo.com/';
  const threads = 20;
  const workers = initWorkers(threads);

  const ee = new EventEmitter();

  ee.on('done', () => {
    while (queue) {}
  });

  const set = new Set();
  const queue = [];

  const root = { parentUrl: null, currentUrl: rootUrl };
  const fetcher = new Fetcher(timeout);
  const page = new Page(root.currentUrl);

  const res = await fetcher.fetch(root.currentUrl);
  const urls = page.getPageUrls(res.window.document);

  const payload: WorkerResponse = {
    timing: 0,
    status: 'success',
    parentUrl: root.parentUrl,
    currentUrl: root.currentUrl,
    childrenUrls: urls.filter((it) => it.length > 0)
  };

  ++visitedCount;
  set.add(payload.currentUrl);

  console.log(
    `🤝 (${visitedCount}) ` +
      payload.currentUrl +
      '\n\t' +
      payload.childrenUrls.join('\n\t')
  );

  for (const url of payload.childrenUrls) {
    const doesNotExist =
      queue.filter((it) => it.currentUrl === url).length === 0;

    if (!set.has(url) && doesNotExist) {
      const req = {
        parentUrl: payload.currentUrl,
        currentUrl: url,
        timeout,
        rootUrl
      };

      queue.push(req);
    }
  }

  // push initial workload to the workers
  workers.forEach((w) => w.postMessage(queue.shift()));

  //register callback
  for (const w of workers) {
    // the worker thread has completed it's work
    w.on('message', (payload: WorkerResponse) => {
      if (payload.status === 'success') {
        visitedCount += 1;
        totalTime += payload.timing;

        set.add(payload.currentUrl);

        // console.log(
        //   `🤝 (${visitedCount}, ${(message.timing / 1000).toPrecision(2)}s) ` +
        //     message.currentUrl +
        //     '\n\t' +
        //     message.childrenUrls.join('\n\t')
        // );

        for (const url of payload.childrenUrls) {
          const doesNotExist =
            queue.filter((it) => it.currentUrl === url).length === 0;

          if (!set.has(url) && doesNotExist) {
            const req: WorkerRequest = {
              parentUrl: payload.currentUrl,
              currentUrl: url,
              timeout,
              rootUrl
            };

            queue.push(req);
          }
        }
      }

      if (payload.status === 'failed') {
        set.add(payload.currentUrl);

        console.log(`😩 ${payload.currentUrl} => ${payload.message}`);
      }

      if (queue.length < 1) {
        console.log(queue);
      }

      console.log(queue.length, set.size);
      w.postMessage(queue.shift());
    });

    w.on('error', async (error) => {
      console.log(`⚙️ Worker Error Event: ${error.message}`);

      // wait for one second then check the queue again
      await setTimeout(1000);
      w.postMessage(queue.shift());
    });

    w.on('exit', (code) => console.log(code));
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
