import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import { sections, optionDefinitions } from './constants';
import { Crawler } from './crawler/crawler';

async function run() {
  const usage = commandLineUsage(sections);

  try {
    const options = commandLineArgs(optionDefinitions);

    const requiredArgs = ['url'];
    const argKeys = Object.keys(options).filter((it) => it !== 'help');

    if (options.help || argKeys.length === 0) {
      console.log(usage);
      process.exit(0);
    }

    const missingArgs = [];
    for (const param of requiredArgs) {
      if (!argKeys.includes(param)) missingArgs.push(param);
    }

    if (missingArgs.length > 0) {
      console.log(`missing required arguments: ${missingArgs.join(', ')}`);
      console.log(usage);

      process.exit(1);
    }

    const rootUrl = options.url.endsWith('/') ? options.url : options.url + '/';
    const httpTimeout: number = parseInt(options.timeout) || 1000 * 30;
    const threadCount: number = parseInt(options.concurrency) || 20;

    const crawler = new Crawler();
    crawler.crawl(rootUrl, httpTimeout, threadCount);
  } catch (error) {
    console.log(error.message);
    console.log(usage);

    process.exit(1);
  }
}

run();
