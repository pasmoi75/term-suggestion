import { describe, expect, it } from 'vitest';
import { MaxHeap } from '../src/max-heap.ts';

describe('MaxHeap', () => {
  it('keeps only the best N entries', () => {
    const heap = new MaxHeap(2);
    heap.tryAdd({ term: 'c', score: 2, lengthDiff: 0 });
    heap.tryAdd({ term: 'a', score: 0, lengthDiff: 0 });
    heap.tryAdd({ term: 'b', score: 1, lengthDiff: 0 });
    expect(heap.toSortedTerms()).toEqual(['a', 'b']);
  });

  it('ignores a candidate worse than the current worst when full', () => {
    const heap = new MaxHeap(2);
    heap.tryAdd({ term: 'a', score: 0, lengthDiff: 0 });
    heap.tryAdd({ term: 'b', score: 1, lengthDiff: 0 });
    heap.tryAdd({ term: 'z', score: 5, lengthDiff: 0 });
    expect(heap.toSortedTerms()).toEqual(['a', 'b']);
  });

  it('replaces the worst candidate when a better one arrives', () => {
    const heap = new MaxHeap(2);
    heap.tryAdd({ term: 'a', score: 0, lengthDiff: 0 });
    heap.tryAdd({ term: 'c', score: 2, lengthDiff: 0 });
    heap.tryAdd({ term: 'b', score: 1, lengthDiff: 0 });
    expect(heap.toSortedTerms()).toEqual(['a', 'b']);
  });

  it('works with N = 1', () => {
    const heap = new MaxHeap(1);
    heap.tryAdd({ term: 'a', score: 1, lengthDiff: 0 });
    heap.tryAdd({ term: 'b', score: 0, lengthDiff: 0 });
    expect(heap.toSortedTerms()).toEqual(['b']);
  });
});
