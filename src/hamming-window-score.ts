export function hammingWindowScore(query: string, word: string): number | null {
  if (word.length < query.length) return null;

  let min = Infinity;
  for (let i = 0; i <= word.length - query.length; i++) {
    let d = 0;
    for (let j = 0; j < query.length; j++) {
      if (query[j] !== word[i + j]) {
        d++;
        if (d >= min) break;
      }
    }
    if (d < min) min = d;
  }
  return min;
}
