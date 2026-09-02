import { describe, expect, it } from 'vitest';
import { parseWordSource } from '../src/parse-word-source.ts';

describe('parseWordSource', () => {
  it('parses a JSON array of words', () => {
    expect(parseWordSource('["gros","gras","chat"]')).toEqual(['gros', 'gras', 'chat']);
  });

  it('parses an empty JSON array', () => {
    expect(parseWordSource('[]')).toEqual([]);
  });

  it('parses newline-delimited text with CRLF line endings', () => {
    expect(parseWordSource('gros\r\ngras\r\nchat')).toEqual(['gros', 'gras', 'chat']);
  });

  it('throws on invalid JSON when content starts with [', () => {
    expect(() => parseWordSource('[not valid json')).toThrow();
  });
});
