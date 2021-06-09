import { Worker } from 'worker_threads';
import { join } from 'path';
import { Page } from './page';
import { Fetcher } from './fetcher';
import Graph from 'graph-data-structure';

async function run() {
  const parentUrl = 'https://monzo.com/';
  const workers = initWorkers(10);

  const queue = [parentUrl];

  // this is a cache of visited urls
  const graph = Graph();

  const fetcher = new Fetcher();
  const page = new Page(parentUrl);

  const res = await fetcher.fetch(parentUrl);
  const urls = page.getPageUrls(res.window.document);
  queue.push(...urls);

  // register callback
  for (const w of workers) {
    // process the first item on the queue
    w.postMessage(queue.shift());

    // the worker thread has completed it's work
    w.on(
      'message',
      (message: {
        parentUrl: string;
        currentUrl: string;
        childrenUrls: string[];
      }) => {
        graph.addNode(message.currentUrl);
        graph.addEdge(message.parentUrl, message.currentUrl);

        for (const url of message.childrenUrls) {
          if (!graph.nodes().includes(url)) {
            queue.push(url);
          }
        }

        if (queue.length > 0) {
          const newUrl = queue.shift();
          w.postMessage({ parent: message.currentUrl, currentUrl: newUrl });
        }
      }
    );

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
