import { join } from 'path';
import { WorkerRequest, WorkerResponse } from '../typings';
import { ThreadPool } from '../theading/pool';
import { Timing } from '../timing/timing';

export class Crawler {
  crawl(rootUrl: string, httpTimeout: number, threadCount: number) {
    const set = new Set();
    const timing = new Timing();

    const execFile = join(__dirname, '../worker/worker.js');
    const pool = new ThreadPool<WorkerRequest, WorkerResponse>({
      execFile,
      threadCount,
      jobCallback,
      timeOutCallback
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
      await new Promise((resolve) => {
        setImmediate(() => {
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
              const exists = pool.queue.find((it) => it.currentUrl === url);

              if (!exists && !set.has(url)) {
                const req: WorkerRequest = {
                  timeout: httpTimeout,
                  currentUrl: url,
                  rootUrl
                };
                pool.push(req);
              }
            }

            pool.runNext();
          }

          if (payload.status === 'failed') {
            set.add(payload.currentUrl);

            timing.failed();

            console.log(
              `😩 (${timing.failedUrls}) ${payload.currentUrl} => ${payload.message}`
            );
          }

          resolve(true);
        });
      });
    }

    const root: WorkerRequest = {
      timeout: httpTimeout,
      currentUrl: rootUrl,
      rootUrl
    };

    timing.start();

    pool.push(root);
    pool.runNext();
  }
}
