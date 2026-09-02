import { describe, expect, it } from 'vitest';
import { getSuggestions } from '../src/get-suggestions.ts';

describe('getSuggestions edge cases', () => {
  it('picks gras over gris at topN=1 when both score 1 (alphabetical tie-break)', () => {
    expect(getSuggestions('gros', ['gris', 'gras'], 1)).toEqual(['gras']);
  });

  it('prefers closer length when heap is full with equal scores (agressif vs gras, topN=1)', () => {
    expect(getSuggestions('gros', ['agressif', 'gras'], 1)).toEqual(['gras']);
  });

  it('finds an exact match in a suffix window via integration', () => {
    expect(getSuggestions('abc', ['xxabc', 'yyabc', 'nomatch'], 2)).toEqual([
      'xxabc',
      'yyabc',
    ]);
  });

  it('finds repetitive-pattern matches via integration', () => {
    expect(getSuggestions('aa', ['aaaa', 'bbbb'], 1)).toEqual(['aaaa']);
    expect(getSuggestions('aba', ['abababa', 'xyxyxyx'], 1)).toEqual(['abababa']);
  });

  it('returns an empty list when the query is longer than every dictionary word', () => {
    expect(getSuggestions('abcdefgh', ['abc', 'ab', 'a'], 5)).toEqual([]);
  });

  it('returns an empty list when numberOfSuggestions is negative', () => {
    expect(getSuggestions('gros', ['gros', 'gras'], -1)).toEqual([]);
  });

  it('allows a non-integer numberOfSuggestions (heap uses numeric comparison)', () => {
    expect(getSuggestions('gros', ['gros', 'gras', 'chat'], 2.7)).toEqual([
      'gros',
      'gras',
      'chat',
    ]);
  });

  it('filters mixed dictionary entries and ranks valid matches', () => {
    expect(getSuggestions('gros', ['GROS', 'gros', '123', 'a-b', 'gras'], 10)).toEqual([
      'gros',
      'gras',
    ]);
  });
});

describe('getSuggestions topN limits', () => {
  it('returns all eligible candidates when topN equals the matchable count with varied scores', () => {
    const dict = ['gros', 'gras', 'agressif', 'chat'];
    expect(getSuggestions('gros', dict, 3)).toEqual(['gros', 'gras', 'agressif']);
  });

  it('returns only matchable words when topN exceeds filtered dictionary size', () => {
    const accentedJunk = Array.from({ length: 97 }, (_, i) => `accènt${i}`);
    const matchable = ['testouteurou', 'testouteurou1', 'testouteurou2'];
    const dict = [...matchable, ...accentedJunk];
    const results = getSuggestions('testouteurou', dict, 100);
    expect(results).toHaveLength(3);
    expect(results).toEqual(matchable);
  });
});

describe('getSuggestions ranking tie-breakers', () => {
  it('sorts final output with localeCompare (a2 before a10 on equal score)', () => {
    expect(getSuggestions('x', ['a10', 'a2'], 2)).toEqual(['a2', 'a10']);
  });

  it('breaks triple+ alphabetical ties on equal score and length', () => {
    expect(getSuggestions('ab', ['az', 'ax', 'ay'], 3)).toEqual(['ax', 'ay', 'az']);
  });

  it('prefers closer length on equal score (ab/ax/abc/abxy)', () => {
    expect(getSuggestions('ab', ['abxy', 'abc', 'ab', 'ax'], 4)).toEqual([
      'ab',
      'abc',
      'abxy',
      'ax',
    ]);
  });
});
