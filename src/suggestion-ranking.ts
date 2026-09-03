export type ScoredEntry = { term: string; score: number; lengthDiff: number };

/**
 * Ranking order: lower Hamming score, then length closer to the query,
 * then alphabetical order for a stable, deterministic tie-break.
 */
export function isBetterSuggestion(a: ScoredEntry, b: ScoredEntry): boolean {
  if (a.score !== b.score) return a.score < b.score;
  if (a.lengthDiff !== b.lengthDiff) return a.lengthDiff < b.lengthDiff;
  return a.term < b.term;
}

/** Ascending sort using the same criteria as isBetterSuggestion. */
export function compareEntries(a: ScoredEntry, b: ScoredEntry): number {
  if (a.score !== b.score) return a.score - b.score;
  if (a.lengthDiff !== b.lengthDiff) return a.lengthDiff - b.lengthDiff;
  return a.term.localeCompare(b.term);
}
