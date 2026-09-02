import {
  compareEntries,
  isBetterSuggestion,
  type ScoredEntry,
} from './suggestion-ranking.ts';

export class MaxHeap {
  private heap: ScoredEntry[] = [];

  constructor(private maxSize: number) {}

  get size(): number {
    return this.heap.length;
  }

  get worstScore(): number {
    if (this.heap.length === 0) return Infinity;
    return this.heap[0].score;
  }

  tryAdd(entry: ScoredEntry): void {
    if (this.maxSize <= 0) return;
    if (this.heap.length < this.maxSize) {
      this.heap.push(entry);
      this.bubbleUp(this.heap.length - 1);
      return;
    }
    if (isBetterSuggestion(entry, this.heap[0])) {
      this.heap[0] = entry;
      this.bubbleDown(0);
    }
  }

  toSortedTerms(): string[] {
    return [...this.heap].sort(compareEntries).map(({ term }) => term);
  }

  private isWorse(a: ScoredEntry, b: ScoredEntry): boolean {
    return isBetterSuggestion(b, a);
  }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!this.isWorse(this.heap[i], this.heap[p])) break;
      [this.heap[i], this.heap[p]] = [this.heap[p], this.heap[i]];
      i = p;
    }
  }

  private bubbleDown(i: number): void {
    while (true) {
      let w = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      if (l < this.heap.length && this.isWorse(this.heap[l], this.heap[w])) w = l;
      if (r < this.heap.length && this.isWorse(this.heap[r], this.heap[w])) w = r;
      if (w === i) break;
      [this.heap[i], this.heap[w]] = [this.heap[w], this.heap[i]];
      i = w;
    }
  }
}
