import Graph from 'graph-data-structure';
import PromisePool from 'es6-promise-pool';
import fetchHtmlAndExtractLink from './worker';

/**
 * traverseBatched is like `traverse` but run in dynamic batches. i.e.
 * there'll never be more than `batchSize` runnning concurrently
 * @param ts the data to work on
 * @param batchSize the upper bound on concurrent promises
 * @param fn the worker function itself.
 */
export async function traverseBatched<T>(
  ts: T[],
  batchSize: number,
  fn: (t: T, i: number) => Promise<void>
) {
  let index = 0;

  const pool = new PromisePool(runTask, batchSize);

  function runTask() {
    if (index >= ts.length) {
      return null;
    }

    const value = ts[index];

    // update index for next iteration
    index += 1;

    return fn(value, index - 1);
  }

  return pool.start();
}

async function run() {
  const rootUrl = 'https://monzo.com/';
  const threads = 20;

  // this is a cache of visited urls
  const graph = Graph();
  const queue = [{ parentUrl: null, currentUrl: rootUrl }];

  // continue until the queue is empty
  while (queue.length > 0) {
    console.log('before: ' + queue.length + '\n');
    const min = Math.min(queue.length, threads);
    const items = queue.splice(0, min);

    await traverseBatched(items, threads, async (item, i) => {
      const set = await fetchHtmlAndExtractLink(item);

      console.log(
        '🤝' + set.currentUrl + '\n\t' + set.childrenUrls.join('\n\t')
      );
      graph.addNode(set.currentUrl);
      graph.addEdge(set.parentUrl, set.currentUrl);

      for (const url of set.childrenUrls) {
        const doesNotExist = queue.find((it) => it.currentUrl === url) !== null;

        if (!graph.nodes().includes(url) && doesNotExist) {
          queue.push({ parentUrl: set.currentUrl, currentUrl: url });
        }
      }
    });

    console.log('after: ' + queue.length + '\n');
  }
}

run();
