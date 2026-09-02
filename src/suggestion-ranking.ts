export type ScoredEntry = { term: string; score: number; lengthDiff: number };

export function isBetterSuggestion(a: ScoredEntry, b: ScoredEntry): boolean {
  if (a.score !== b.score) return a.score < b.score;
  if (a.lengthDiff !== b.lengthDiff) return a.lengthDiff < b.lengthDiff;
  return a.term < b.term;
}

export function compareEntries(a: ScoredEntry, b: ScoredEntry): number {
  if (a.score !== b.score) return a.score - b.score;
  if (a.lengthDiff !== b.lengthDiff) return a.lengthDiff - b.lengthDiff;
  return a.term.localeCompare(b.term);
}
