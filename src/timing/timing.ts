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
    const totalSeconds = (this.endTime - this.startTime) / 1000;

    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);

    return `${mins}m${secs}s`;
  }
}
