import axios from 'axios';
import { JSDOM } from 'jsdom';

export class Fetcher {
  constructor(readonly timeout: number) {}

  async fetch(url: string): Promise<JSDOM> {
    const { data } = await axios.get(url, { timeout: this.timeout });
    const dom = new JSDOM(data);
    return dom;
  }
}
