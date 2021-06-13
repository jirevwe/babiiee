import { Timing } from './timing';

const sleep = (n: number) =>
  new Promise((resolve) => setTimeout(() => resolve(true), n));

describe('Timing Tests', () => {
  it.each`
    time    | expected
    ${5000} | ${'0m5s'}
  `(
    '',
    async ({ time, expected }) => {
      const timing = new Timing();
      timing.start();
      await sleep(time);
      timing.end();
      expect(timing.toHumanReadableTime()).toBe(expected);
    },
    6000
  );
});
