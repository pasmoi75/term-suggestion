# Tests

Unit tests use [Vitest](https://vitest.dev/).

## Running tests

**All tests:**

```bash
npm test
```

**Single file:**

```bash
npm test -- tests/foo.test.ts
```

**Filter by test name:**

```bash
npm test -- -t "pattern"
```

**Watch mode (re-run on each change):**

```bash
npx vitest tests/foo.test.ts
```

## Test files

| File | Coverage |
|------|----------|
| `get-suggestions.test.ts` | Main suggestion algorithm |
| `hamming-window-score.test.ts` | Similarity score (sliding window) |
| `load-word-list.test.ts` | Dictionary loading |
| `max-heap.test.ts` | Max heap for top-N selection |
| `suggestion-ranking.test.ts` | Suggestion ranking criteria |
| `validator.test.ts` | Query format validation |
| `parse-word-source.test.ts` | Word source parsing (txt, json) |
| `edge-cases.test.ts` | Edge cases and tie-breakers |
| `accent-variants.test.ts` | Accented variants in the dictionary |
| `serve-ui.test.ts` | Web UI HTTP handlers |
