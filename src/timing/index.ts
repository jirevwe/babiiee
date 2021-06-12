import { performance } from 'perf_hooks';

export class Timing {
  visitedUrls: number = 0;
  failedUrls: number = 0;

  private startTime: number = 0;
  private endTime: number = 0;

  total() {
    return this.visitedUrls + this.failedUrls;
  }

  start() {
    this.startTime = performance.now();
  }

  end() {
    this.endTime = performance.now();
  }

  visit() {
    ++this.visitedUrls;
  }

  failed() {
    ++this.failedUrls;
  }

  toHumanReadableTime() {
    const totalTime = (this.endTime - this.startTime) / (60 * 1000);
    return totalTime;
  }
}
