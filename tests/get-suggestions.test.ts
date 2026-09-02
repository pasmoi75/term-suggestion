import { describe, expect, it } from 'vitest';
import { getSuggestions } from '../src/get-suggestions.ts';

const sampleList = ['gros', 'gras', 'graisse', 'agressif', 'go', 'ros', 'gro'];

describe('getSuggestions', () => {
  it('returns the closest matches from the spec example', () => {
    expect(getSuggestions('gros', sampleList, 4)).toEqual([
      'gros',
      'gras',
      'agressif',
      'graisse',
    ]);
  });

  it('returns only two suggestions when requested', () => {
    expect(getSuggestions('gros', sampleList, 2)).toEqual(['gros', 'gras']);
  });

  it('returns an empty list when numberOfSuggestions is 0', () => {
    expect(getSuggestions('gros', sampleList, 0)).toEqual([]);
  });

  it('excludes words shorter than the query', () => {
    const results = getSuggestions('gros', sampleList, 10);
    expect(results).not.toContain('go');
    expect(results).not.toContain('ros');
    expect(results).not.toContain('gro');
  });

  it('returns an empty list for an empty word list', () => {
    expect(getSuggestions('gros', [], 5)).toEqual([]);
  });

  it('returns at most the number of available words', () => {
    expect(getSuggestions('go', ['mot', 'roi'], 10)).toEqual(['mot', 'roi']);
  });

  it('can return duplicate terms if the word list contains duplicates', () => {
    expect(getSuggestions('gros', ['gros', 'gros', 'gras'], 3)).toEqual([
      'gros',
      'gros',
      'gras',
    ]);
  });

  it('ignores non-alphanumeric dictionary words when searching', () => {
    expect(getSuggestions('notre', ['nôtre'], 5)).toEqual([]);
    expect(getSuggestions('notre', ['nôtre', 'notre'], 5)).toEqual(['notre']);
  });

  it('excludes accented dictionary entries for an ASCII query (grês/grés vs gres)', () => {
    expect(getSuggestions('gres', ['grês', 'grés'], 10)).toEqual([]);
  });
});
