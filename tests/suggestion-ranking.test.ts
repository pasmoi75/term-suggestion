import { describe, expect, it } from 'vitest';
import { isBetterSuggestion } from '../src/suggestion-ranking.ts';

describe('isBetterSuggestion', () => {
  it('prefers a lower score', () => {
    expect(
      isBetterSuggestion(
        { term: 'b', score: 0, lengthDiff: 0 },
        { term: 'a', score: 1, lengthDiff: 0 },
      ),
    ).toBe(true);
  });

  it('prefers closer length on equal score', () => {
    expect(
      isBetterSuggestion(
        { term: 'gras', score: 1, lengthDiff: 0 },
        { term: 'agressif', score: 1, lengthDiff: 4 },
      ),
    ).toBe(true);
  });

  it('prefers alphabetical order on full tie', () => {
    expect(
      isBetterSuggestion(
        { term: 'gras', score: 1, lengthDiff: 0 },
        { term: 'gros', score: 1, lengthDiff: 0 },
      ),
    ).toBe(true);
  });
});
