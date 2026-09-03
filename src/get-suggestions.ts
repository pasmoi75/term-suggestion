import { hammingWindowScore } from './hamming-window-score.ts';
import { MaxHeap } from './max-heap.ts';
import { assertValidQueryInput, isValidQueryInput } from './validator.ts';

export function getSuggestions(
  word: string,
  wordList: string[],
  numberOfSuggestions: number,
): string[] {
  assertValidQueryInput(word);
  const query = word;
  const maxHeap = new MaxHeap(numberOfSuggestions);

  for (const term of wordList) {
    // Dictionary entries may contain accents or punctuation; skip non-matching tokens silently.
    if (!isValidQueryInput(term)) continue;
    const score = hammingWindowScore(query, term);
    // Word is too short to align the full query.
    if (score === null) continue;
    maxHeap.tryAdd({
      term,
      score,
      lengthDiff: Math.abs(term.length - query.length),
    });
  }

  return maxHeap.toSortedTerms();
}
