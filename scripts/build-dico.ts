import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_DICTIONARY_PATH } from '../src/load-word-list.ts';
import { parseWordSource } from '../src/parse-word-source.ts';

const SOURCES_DIR = join(dirname(fileURLToPath(import.meta.url)), '../data/sources');
const SOURCE_FILES = ['french-words.json', 'francais.txt', 'words_alpha.txt'];

const seen = new Set<string>();
const words: string[] = [];

for (const file of SOURCE_FILES) {
  const source = readFileSync(join(SOURCES_DIR, file), 'utf-8');
  for (const word of parseWordSource(source)) {
    if (word === '' || seen.has(word)) continue;
    seen.add(word);
    words.push(word);
  }
}

writeFileSync(DEFAULT_DICTIONARY_PATH, words.join('\n'), 'utf-8');
console.log(`Built ${DEFAULT_DICTIONARY_PATH} (${words.length.toLocaleString()} words)`);
