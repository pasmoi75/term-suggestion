import { describe, expect, it } from 'vitest';
import { hammingWindowScore } from '../src/hamming-window-score.ts';

describe('hammingWindowScore', () => {
  it('returns 0 for an exact match', () => {
    expect(hammingWindowScore('gros', 'gros')).toBe(0);
  });

  it('returns 1 for one substitution on same length', () => {
    expect(hammingWindowScore('gros', 'gras')).toBe(1);
  });

  it('returns null when the word is too short', () => {
    expect(hammingWindowScore('gros', 'go')).toBeNull();
    expect(hammingWindowScore('gros', 'gro')).toBeNull();
  });

  it('finds the best sliding window in a longer word', () => {
    expect(hammingWindowScore('gros', 'graisse')).toBe(2);
    expect(hammingWindowScore('gros', 'agressif')).toBe(1);
  });

  it('finds a match at a non-zero offset', () => {
    expect(hammingWindowScore('ros', 'abros')).toBe(0);
  });

  it('works with a single-character query', () => {
    expect(hammingWindowScore('g', 'agressif')).toBe(0);
  });

  it('returns the query length when all characters differ', () => {
    expect(hammingWindowScore('abc', 'xyz')).toBe(3);
  });

  it('uses a single window when word and query have the same length', () => {
    expect(hammingWindowScore('chat', 'chut')).toBe(1);
  });

  it('finds an exact match at a suffix offset', () => {
    expect(hammingWindowScore('abc', 'xxabc')).toBe(0);
  });

  it('matches repetitive substrings (aa in aaaa, aba in abababa)', () => {
    expect(hammingWindowScore('aa', 'aaaa')).toBe(0);
    expect(hammingWindowScore('aba', 'abababa')).toBe(0);
  });
});
