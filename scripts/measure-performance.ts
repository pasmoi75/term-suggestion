import { getSuggestions, loadWordList } from '../src/index.ts';

const TARGET_SIZE = 500_000;
const NUMBER_OF_SUGGESTIONS = 10;
const WARMUP_RUNS = 3;
const TIMED_RUNS = 5;

const queries = [
  '12fdsfd0df524ds',
  'oudsofusdfhd',
  'sdfodsii',
  'ofudo',
  'gros',
  'maison',
  'xyzqwerty',
  'bonjour',
  'qsdklfjqmsldkf',
  'chat',
];

const wordList = loadWordList({ targetSize: TARGET_SIZE });

function runAllQueries(): number {
  const t0 = performance.now();
  for (const q of queries) getSuggestions(q, wordList, NUMBER_OF_SUGGESTIONS);
  return performance.now() - t0;
}

for (let i = 0; i < WARMUP_RUNS; i++) runAllQueries();

let totalMs = 0;
for (let i = 0; i < TIMED_RUNS; i++) totalMs += runAllQueries();

const avgTotalMs = totalMs / TIMED_RUNS;
const top10First = getSuggestions(queries[0], wordList, NUMBER_OF_SUGGESTIONS);

console.log(`Word list: ${wordList.length.toLocaleString()} entries`);
console.log(`Queries: ${queries.length} | Top N: ${NUMBER_OF_SUGGESTIONS}`);
console.log(`Total time (avg ${TIMED_RUNS} runs): ${avgTotalMs.toFixed(1)} ms`);
console.log(`Time per query: ${(avgTotalMs / queries.length).toFixed(1)} ms`);
console.log('');
console.log(`Top 10 for "${queries[0]}":`);
console.log(top10First);
