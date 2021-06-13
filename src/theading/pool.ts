import os from 'os';
import { Worker as Thread } from 'worker_threads';

/**
 * Creates a thread pool
 *
 * @param threadCount the number of threads to spawn
 * @param execFile the file containing the worker function
 * @param jobCallback the result callback (executed on the main thread)
 * @param tasks initial tasks that will be seeded on the queue
 * @param timeOutCallback callback that's called after the pool has been idle for `threadTimeout` seconds
 * @param threadTimeout the amount of idle time the pool before the `timeOutCallback` function is called
 * @param debug print debug infomation
 */
export interface ThreadPoolOptions<Task, Result> {
  jobCallback: (result: Result) => Promise<void>;
  timeOutCallback: () => void;
  execFile: string;

  threadTimeout?: number;
  threadCount?: number;
  tasks?: Task[];
  debug?: boolean;
}

export class ThreadPool<Task, Result> {
  private threads: Thread[] = [];
  private idle: number[] = [];
  queue: Task[] = [];

  private timeout: NodeJS.Timeout;

  constructor(private readonly options: ThreadPoolOptions<Task, Result>) {
    const { tasks, debug, execFile, threadCount } = options;

    options.debug = !!debug;

    options.threadTimeout = options.threadTimeout
      ? options.threadTimeout * 1000
      : 3 * 1000;

    if (!threadCount) {
      options.threadCount = os.cpus().length * 2;
    }

    if (tasks) {
      this.queue.push(...tasks);
    }

    for (let i = 0; i < options.threadCount; i++) {
      const worker = new Thread(execFile);
      this.threads.push(worker);
      this.idle.push(worker.threadId);
      this.registerCallbacks(worker);
    }
  }

  /**
   * Adds work to the pool and tries to execute it
   */
  async push(payload: Task) {
    this.queue.push(payload);
  }

  /**
   * Picks the first task from queue and runs it
   */
  runNext() {
    if (this.options.debug) {
      console.log(`queue: ${this.queue.length}, idle: ${this.idle.length}`);
    }

    // the threads are idle and the queue is empty
    if (this.idle.length === this.threads.length && this.queue.length === 0) {
      this.timeout = setTimeout(
        this.options.timeOutCallback,
        this.options.threadTimeout
      );

      return;
    }

    if (this.idle.length === 0) return;

    // we have more jobs, don't stop the threads
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    // get the first idle worker
    const worker = this.threads.find((it) => it.threadId === this.idle[0]);

    // dequeue the first item
    const payload = this.queue.shift();

    if (!payload) return;

    this.formatDebugMessage(payload, 'task');

    // give the worker work to do
    worker.postMessage(payload);

    // remove the idle worker from the idle pool
    this.idle.shift();
  }

  private formatDebugMessage(payload: Task | Result, type: 'task' | 'result') {
    if (!this.options.debug) return;

    const data =
      typeof payload === 'object' ? JSON.stringify(payload) : payload;

    console.log(
      `${type} ${type === 'task' ? 'received' : 'sent'}, data: (${data})`
    );
  }

  private registerCallbacks(worker: Thread) {
    worker.on('message', (result: Result) => {
      this.formatDebugMessage(result, 'result');

      this.options.jobCallback(result);

      this.idle.push(worker.threadId);
      this.runNext();
    });

    worker.on('error', (error) => {
      console.log(
        `thread with thread id (${worker.threadId}) received an error event: ${error.message}`
      );

      this.idle.push(worker.threadId);
      this.runNext();
    });

    worker.on('messageerror', (error) => {
      console.log(
        `thread with thread id (${worker.threadId}) received a messageerror event: (${error.message})`
      );
    });

    worker.on('online', () => {
      if (this.options.debug) {
        console.log(`thread with id (${worker.threadId}) online`);
      }
    });

    worker.on('exit', (code) => {
      console.log(
        `thread with thread id (${worker.threadId}) exited with error code (${code})`
      );
    });
  }
}
