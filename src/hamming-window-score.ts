/**
 * Minimum Hamming distance between the query and any equal-length window in word.
 * Only substitutions are counted; the query must fit entirely inside the word.
 * Returns null when the word is shorter than the query.
 */
export function hammingWindowScore(query: string, word: string): number | null {
  if (word.length < query.length) return null;

  let min = Infinity;
  for (let i = 0; i <= word.length - query.length; i++) {
    let d = 0;
    for (let j = 0; j < query.length; j++) {
      if (query[j] !== word[i + j]) {
        d++;
        // This window cannot beat the best score found so far; try the next offset.
        if (d >= min) break;
      }
    }
    if (d < min) min = d;
  }
  return min;
}
