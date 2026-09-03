# term-suggestion

Given a search term, return up to N suggestions from a word list. Only lowercase alphanumeric terms participate in matching. A suggestion is a term that contains the query or is closest to it under the project's similarity rule.

When several terms share the same number of differences, prefer those whose length is closest to the query length, then break ties alphabetically.

Similarity is measured by the number of letter substitutions required to align the query with a substring of the candidate (insertions are not considered). Fewer substitutions mean a closer match.

Example: searching for 2 suggestions close to `gros` in `[gros, gras, graisse, agressif, go, ros, gro]` yields:

- `gros` = 0 differences
- `gras` = 1 difference
- `graisse` = 2 differences
- `agressif` = 1 difference
- `go` = not similar (too few letters)
- `ros` = not similar (too few letters)
- `gro` = not similar (too few letters)

## Word format

The query is validated before search runs. The dictionary may contain heterogeneous entries, but **only lowercase alphanumeric words** (`[a-z0-9]+`) participate in search. Non-conforming dictionary entries are ignored (see [Dictionary](#dictionary)).

### Input (query)

The search term must be **lowercase** and **alphanumeric** (`[a-z0-9]+`).

Otherwise, an error is thrown before search begins:

> Ce n'est pas le format attendu : le mot doit être en minuscules et ne contenir que des caractères alphanumériques ([a-z0-9]).

Rejected examples: `GROS`, ` chat`, `café`, `mot!`.

### Dictionary

The dictionary file may contain any words (accents, uppercase, spaces, punctuation, and so on). **During search**, any entry that is **not alphanumeric** — outside the lowercase `[a-z0-9]+` pattern — is **ignored**: it is neither compared to the query nor returned as a suggestion, and no error is raised.

Example: a search for `notre` will not match `nôtre` in the dictionary, but will match `notre` if present.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ (20+ recommended)

## Installation

```bash
cd term-suggestion
npm install
npm run build:dico
```

## Usage

```bash
npm run search -- gros 10
npm run search -- gros 10 --dico path/to/my-dico.txt
```

Arguments:

1. search term
2. number of suggestions (optional, default: 10)
3. `--dico <path>` — dictionary file to use (optional, default: `data/dico.txt`)

## Web UI

A web interface lets you try suggestions without using the command line.

```bash
npm run ui
```

Then open [http://localhost:3456](http://localhost:3456) in your browser. The default port is **3456**; it can be changed with the `PORT` environment variable:

```bash
PORT=8080 npm run ui
```

**How to use:**

1. Load a dictionary file (`.txt` or `.json`) with the file picker.
2. Enter a search word (lowercase alphanumeric, same rules as the CLI).
3. Suggestions update as you type; the result count is configurable.

> **Note (local demo):** in this version, the full word list is sent to the browser when the dictionary is loaded, then sent back to the server on every search. In a typical deployment, the dictionary would stay on the server (session or cache). This demo therefore does not reflect the performance characteristics of a production setup.

### HTTP endpoints

#### `POST /api/dictionary`

Parses a dictionary file.

**Request:** `{ "content": "<file text>" }`

**Response:** `{ "words": [...], "count": N }`

#### `POST /api/suggestions`

**Request:** `{ "words": [...], "query": "gros", "limit": 10 }`

**Response:** `{ "suggestions": [...] }`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run search -- <word> [n] [--dico <path>]` | Run a search |
| `npm run ui` | Start the web UI (default port 3456) |
| `npm run build:dico` | Build `data/dico.txt` from `data/sources/` |
| `npm run perf` | Benchmark performance (500k words, 10 queries) |
| `npm test` | Unit tests (Vitest) |

## Tests

See [tests/README.md](tests/README.md) for how to run all tests, a single file, filter by name, or use watch mode.

## Structure

```
term-suggestion/
├── data/
│   ├── dico.txt                     # default dictionary (generated)
│   └── sources/                     # raw word lists (build:dico inputs)
│       ├── french-words.json
│       ├── francais.txt
│       └── words_alpha.txt
├── scripts/                         # CLI entrypoints and dev tools
│   ├── search-word.ts
│   ├── build-dico.ts
│   ├── measure-performance.ts
│   └── serve-ui.ts
├── ui/                              # web UI
│   ├── index.html
│   ├── app.js
│   └── style.css
├── src/                             # library (core logic)
│   ├── index.ts
│   ├── get-suggestions.ts
│   ├── hamming-window-score.ts
│   ├── max-heap.ts
│   ├── validator.ts
│   ├── suggestion-ranking.ts
│   ├── load-word-list.ts
│   └── parse-word-source.ts
└── tests/
    ├── get-suggestions.test.ts
    ├── hamming-window-score.test.ts
    ├── load-word-list.test.ts
    ├── max-heap.test.ts
    ├── suggestion-ranking.test.ts
    └── validator.test.ts
```

### Folder roles

- **`data/sources/`** — raw downloaded or external word lists. These are **not** scripts, only data files.
- **`data/dico.txt`** — merged dictionary produced by `npm run build:dico`.
- **`scripts/`** — runnable commands (`search`, `build:dico`, benchmarks, and so on).
- **`ui/`** — web UI pages and assets (`npm run ui`).
- **`src/`** — reusable code (algorithm, dictionary loading, validation).

## API

```typescript
import { getSuggestions, loadWordList } from './src/index.ts';

const wordList = loadWordList();
// or with a custom dictionary:
const custom = loadWordList({ path: 'path/to/my-dico.txt' });
const results = getSuggestions('gros', wordList, 10);
```

## Possible improvement

For better performance on large dictionaries, a **maximum distance threshold** could exclude candidates whose score exceeds that limit from suggestions.
