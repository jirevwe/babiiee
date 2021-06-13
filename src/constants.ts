import { OptionDefinition } from 'command-line-args';
import { Section } from 'command-line-usage';

export const optionDefinitions: OptionDefinition[] = [
  { name: 'help', alias: 'h', type: Boolean },
  { name: 'url', alias: 'u', type: String },
  { name: 'timeout', alias: 't', type: String },
  { name: 'concurrency', alias: 'c', type: String }
];

export const sections: Section[] = [
  {
    header: 'Babiiee Web Crawler',
    content: `Usage:
    yarn start <options>
    
    Examples:
    yarn start -u https://example.com -t 30 -c 20
    yarn start --url https://example.com --timeout 30 --concurrency 20
    `
  },
  {
    header: 'Options',
    optionList: [
      {
        name: 'url',
        alias: 'u',
        type: String,
        description: 'required, the root url of the website'
      },
      {
        name: 'timeout',
        alias: 'y',
        type: String,
        description: 'optional, the http timeout; defaults to 30 seconds'
      },
      {
        name: 'concurrency',
        alias: 'c',
        description: `optional, the number of threads to start; defaults to 5`
      },
      {
        name: 'help',
        alias: 'h',
        type: Boolean,
        description: 'Print this usage guide.'
      }
    ]
  }
];
