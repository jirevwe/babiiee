import axios from 'axios';
import { JSDOM } from 'jsdom';

export class Fetcher {
  constructor() {}

  async fetch(url: string): Promise<JSDOM> {
    const { data } = await axios.get(url);
    const dom = new JSDOM(data);
    return dom;
  }
}
