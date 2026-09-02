import { describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  DEFAULT_DICTIONARY_PATH,
  loadWordList,
} from '../src/load-word-list.ts';

describe('loadWordList', () => {
  it('uses data/dico.txt by default', () => {
    const words = loadWordList();
    expect(words.length).toBeGreaterThan(0);
    expect(
      DEFAULT_DICTIONARY_PATH.endsWith('data\\dico.txt') ||
        DEFAULT_DICTIONARY_PATH.endsWith('data/dico.txt'),
    ).toBe(true);
  });

  it('loads words from a custom dictionary path', () => {
    const dir = mkdtempSync(join(tmpdir(), 'term-suggestion-dico-'));
    const path = join(dir, 'custom-dico.txt');
    writeFileSync(path, 'gros\ngras\nchat\n', 'utf-8');

    expect(loadWordList({ path })).toEqual(['gros', 'gras', 'chat']);
  });

  it('respects targetSize', () => {
    const dir = mkdtempSync(join(tmpdir(), 'term-suggestion-dico-'));
    const path = join(dir, 'limited-dico.txt');
    writeFileSync(path, 'aaa\naab\naac\naad\n', 'utf-8');

    expect(loadWordList({ path, targetSize: 2 })).toEqual(['aaa', 'aab']);
  });

  it('keeps non-alphanumeric words from the dictionary file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'term-suggestion-dico-'));
    const path = join(dir, 'mixed-dico.txt');
    writeFileSync(path, 'chat\nnÃ´tre\ncafÃ©\n', 'utf-8');

    expect(loadWordList({ path })).toEqual(['chat', 'nÃ´tre', 'cafÃ©']);
  });
});
