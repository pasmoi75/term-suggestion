import { describe, expect, it } from 'vitest';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadWordList } from '../src/load-word-list.ts';
import { getSuggestions } from '../src/get-suggestions.ts';
import {
  INVALID_QUERY_FORMAT_MESSAGE,
  isValidQueryInput,
} from '../src/validator.ts';

const ACCENT_VARIANTS_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  '../data/test-accent-variants.txt',
);

/** Words in the fixture that pass [a-z0-9]+ (accents are stored but not searchable). */
const MATCHABLE_BASELINE_WORDS = [
  'testouteurou',
  'testouteurou1',
  'testouteurou2',
  'test0uteurou',
  'testouteurouu',
  'testouteuroux',
  'testouteuroua',
  'testouteuroub',
];

describe('accent variants dictionary (test-accent-variants.txt)', () => {
  const wordList = loadWordList({ path: ACCENT_VARIANTS_PATH });

  it('loads exactly 100 distinct lines from the accent fixture', () => {
    expect(wordList).toHaveLength(100);
    expect(new Set(wordList).size).toBe(100);
  });

  it('keeps accented entries in the loaded list (parsing does not strip them)', () => {
    expect(wordList).toContain('testouteurou');
    expect(wordList).toContain('téstouteurou');
    expect(wordList).toContain('testôuteurôu');
    expect(wordList).toContain('téstôuteurou');
  });

  it('stores only matchable words for [a-z0-9]+ among the ASCII baselines', () => {
    for (const word of MATCHABLE_BASELINE_WORDS) {
      expect(isValidQueryInput(word)).toBe(true);
    }
  });

  it('marks accented variants as non-matchable during search', () => {
    const accentedSamples = [
      'téstouteurou',
      'testoutéurou',
      'testôuteurou',
      'testoùteurou',
      'téstoutéurou',
      'testôuteurôu',
      'téstôuteurou',
    ];
    for (const word of accentedSamples) {
      expect(isValidQueryInput(word)).toBe(false);
    }
  });
});

describe('search with accent variants fixture', () => {
  const wordList = loadWordList({ path: ACCENT_VARIANTS_PATH });
  const query = 'testouteurou';

  it('ranks the exact ASCII baseline first', () => {
    const results = getSuggestions(query, wordList, 10);
    expect(results[0]).toBe('testouteurou');
  });

  it('returns only [a-z0-9]+ dictionary entries (accented words are ignored)', () => {
    const results = getSuggestions(query, wordList, 20);
    expect(results).toHaveLength(MATCHABLE_BASELINE_WORDS.length);
    for (const term of results) {
      expect(isValidQueryInput(term)).toBe(true);
    }
    for (const accented of ['téstouteurou', 'testôuteurôu', 'téstôuteurou']) {
      expect(results).not.toContain(accented);
    }
  });

  it('ranks same-length one-edit ASCII variants after the exact match', () => {
    const results = getSuggestions(query, wordList, 10);
    expect(results.slice(0, 3)).toEqual([
      'testouteurou',
      'testouteurou1',
      'testouteurou2',
    ]);
  });

  it('includes the digit-substitution variant with a higher score than exact matches', () => {
    const results = getSuggestions(query, wordList, 10);
    expect(results).toContain('test0uteurou');
    expect(results.indexOf('test0uteurou')).toBeGreaterThan(0);
  });

  it('returns an empty list when the fixture contains only accented variants', () => {
    const accentedOnly = wordList.filter((word) => !isValidQueryInput(word));
    expect(accentedOnly.length).toBeGreaterThan(90);
    expect(getSuggestions(query, accentedOnly, 5)).toEqual([]);
  });

  it('returns an empty list for an empty dictionary subset', () => {
    expect(getSuggestions(query, [], 5)).toEqual([]);
  });

  it('rejects accented queries (same rule as dictionary filtering)', () => {
    expect(() => getSuggestions('téstouteurou', wordList, 5)).toThrow(
      INVALID_QUERY_FORMAT_MESSAGE,
    );
    expect(() => getSuggestions('testôuteurou', wordList, 5)).toThrow(
      INVALID_QUERY_FORMAT_MESSAGE,
    );
  });

  it('rejects queries with invalid characters', () => {
    expect(() => getSuggestions('testouteurou!', wordList, 5)).toThrow(
      INVALID_QUERY_FORMAT_MESSAGE,
    );
    expect(() => getSuggestions('TESTOUTEUROU', wordList, 5)).toThrow(
      INVALID_QUERY_FORMAT_MESSAGE,
    );
  });

  it('handles all same-length ASCII extension variants consistently', () => {
    const sameLengthExtensions = MATCHABLE_BASELINE_WORDS.filter(
      (word) => word.length === query.length + 1,
    );
    expect(sameLengthExtensions.length).toBeGreaterThan(0);

    const results = getSuggestions(query, sameLengthExtensions, 10);
    expect(results.every((term) => term.startsWith('testouteurou'))).toBe(
      true,
    );
  });
});
