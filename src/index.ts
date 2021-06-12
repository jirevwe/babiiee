import { join } from 'path';
import { WorkerRequest, WorkerResponse } from './typings';
import { ThreadPool } from './pool';
import { Timing } from './timing';
import { Mutex } from 'async-mutex';
import { isMainThread } from 'worker_threads';

async function run() {
  const httpTimeout = 1000 * 30;
  const rootUrl = 'https://crawler-test.com/';

  const set = new Set();
  const timing = new Timing();
  const mutex = new Mutex();

  const execFile = join(__dirname, './worker/index.js');
  const pool = new ThreadPool<WorkerRequest, WorkerResponse>({
    execFile,
    jobCallback,
    timeOutCallback,
    threadTimeout: 3
  });

  function timeOutCallback() {
    timing.end();

    console.log(
      `Total: ${timing.total()}. Completed: ${timing.visitedUrls}. Failed: ${
        timing.failedUrls
      }` +
        `\n Finished crawling ${timing.total()} URLs in ${timing.toHumanReadableTime()}`
    );
    process.exit(0);
  }

  async function jobCallback(payload: WorkerResponse) {
    await mutex.runExclusive(async () => {
      if (payload.status === 'success') {
        set.add(payload.currentUrl);
        timing.visit();

        console.log(
          `🤝 (${timing.visitedUrls}) ` +
            payload.currentUrl +
            '\n\t' +
            payload.childrenUrls.join('\n\t')
        );

        for (const url of payload.childrenUrls) {
          const doesNotExist =
            pool.queue.filter((it) => it.currentUrl === url).length === 0;

          if (!set.has(url) && doesNotExist) {
            const req: WorkerRequest = {
              currentUrl: url,
              timeout: httpTimeout,
              rootUrl
            };

            pool.run(req);
          }
        }
      }

      if (payload.status === 'failed') {
        set.add(payload.currentUrl);

        timing.failed();

        console.log(
          `😩 (${timing.visitedUrls}) ${payload.currentUrl} => ${payload.message}`
        );
      }
    });
  }

  const root = {
    timeout: httpTimeout,
    rootUrl: rootUrl,
    currentUrl: rootUrl
  };

  timing.start();
  pool.run(root);
}

if (isMainThread) {
  run();
}
