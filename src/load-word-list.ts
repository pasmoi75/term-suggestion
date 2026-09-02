import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseWordSource } from './parse-word-source.ts';

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), '../data');
export const DEFAULT_DICTIONARY_PATH = join(DATA_DIR, 'dico.txt');

export interface LoadWordListOptions {
  path?: string;
  targetSize?: number;
}

export function loadWordList(options: LoadWordListOptions = {}): string[] {
  const dictionaryPath = options.path ?? DEFAULT_DICTIONARY_PATH;
  const targetSize = options.targetSize ?? Number.POSITIVE_INFINITY;
  const source = readFileSync(dictionaryPath, 'utf-8');
  const seen = new Set<string>();
  const wordList: string[] = [];

  for (const word of parseWordSource(source)) {
    if (word === '' || seen.has(word)) continue;
    seen.add(word);
    wordList.push(word);
    if (wordList.length >= targetSize) break;
  }

  return wordList;
}
