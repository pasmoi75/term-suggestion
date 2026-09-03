import {
  compareEntries,
  isBetterSuggestion,
  type ScoredEntry,
} from './suggestion-ranking.ts';

/**
 * Bounded heap that retains the N best suggestions while scanning a large list.
 * The root always holds the worst entry among the kept candidates so we can
 * reject new items in O(1) when the heap is full.
 */
export class MaxHeap {
  private heap: ScoredEntry[] = [];

  constructor(private maxSize: number) {}

  get size(): number {
    return this.heap.length;
  }

  /** Score of the weakest kept candidate; Infinity when the heap is empty. */
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
    // Heap is full: replace the root only if the newcomer outranks the current worst.
    if (isBetterSuggestion(entry, this.heap[0])) {
      this.heap[0] = entry;
      this.bubbleDown(0);
    }
  }

  toSortedTerms(): string[] {
    return [...this.heap].sort(compareEntries).map(({ term }) => term);
  }

  /** True when a is a worse suggestion than b under the ranking rules. */
  private isWorse(a: ScoredEntry, b: ScoredEntry): boolean {
    return isBetterSuggestion(b, a);
  }

  /**
   * After insert, move the new node toward the root while it is worse than its parent.
   * Maintains the invariant that the root is the worst among all stored entries.
   */
  private bubbleUp(i: number): void {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!this.isWorse(this.heap[i], this.heap[p])) break;
      [this.heap[i], this.heap[p]] = [this.heap[p], this.heap[i]];
      i = p;
    }
  }

  /**
   * After replacing the root, push the node down toward the worse child until
   * both children are better suggestions than the current node.
   */
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
