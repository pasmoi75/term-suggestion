import {
  DEFAULT_DICTIONARY_PATH,
  getSuggestions,
  loadWordList,
} from '../src/index.ts';

function parseArgs(argv: string[]): {
  query: string;
  limit: number;
  dictionaryPath: string;
} {
  const args = [...argv];
  let dictionaryPath = DEFAULT_DICTIONARY_PATH;

  const dicoFlagIndex = args.indexOf('--dico');
  if (dicoFlagIndex !== -1) {
    const pathArg = args[dicoFlagIndex + 1];
    if (!pathArg) {
      console.error('Usage: npm run search -- <mot> [numberOfSuggestions] [--dico <chemin>]');
      process.exit(1);
    }
    dictionaryPath = pathArg;
    args.splice(dicoFlagIndex, 2);
  }

  const query = args[0];
  const limit = Number(args[1] ?? 10);

  return { query, limit, dictionaryPath };
}

const { query, limit, dictionaryPath } = parseArgs(process.argv.slice(2));

if (!query) {
  console.error('Usage: npm run search -- <mot> [numberOfSuggestions] [--dico <chemin>]');
  process.exit(1);
}

if (!Number.isFinite(limit) || limit < 0) {
  console.error('numberOfSuggestions must be a non-negative number');
  process.exit(1);
}

let wordList: string[];
try {
  wordList = loadWordList({ path: dictionaryPath });
} catch (error) {
  console.error(
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
}

let results: string[];
try {
  results = getSuggestions(query, wordList, limit);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

console.log(
  `Query: "${query}" | Dico: ${dictionaryPath} | Words: ${wordList.length.toLocaleString()} | Top ${limit}`,
);
for (const [i, term] of results.entries()) {
  console.log(`${i + 1}. ${term}`);
}
