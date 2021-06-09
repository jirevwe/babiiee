import { join } from 'path';
import { promises as fs } from 'fs';

/**
 * Loads the contents of an html file and returns the contents
 * @param page the ame of the mock html file
 * @returns the html content of the page
 */
export async function loadHTMLPage(page: string): Promise<string> {
  const path = join(__dirname, page);
  const buffer = await fs.readFile(path);
  const str = buffer.toString('utf-8');
  return str;
}
