import type { ServerResponse } from 'node:http';
import {
  getSuggestions,
  parseWordSource,
  isValidQueryInput,
  INVALID_QUERY_FORMAT_MESSAGE,
} from './index.ts';

export function sendJson(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

export function dedupeWords(rawWords: string[]): string[] {
  const seen = new Set<string>();
  const words: string[] = [];
  for (const word of rawWords) {
    if (word === '' || seen.has(word)) continue;
    seen.add(word);
    words.push(word);
  }
  return words;
}

export async function handleApiDictionary(body: string, res: ServerResponse): Promise<void> {
  let payload: { content?: string };
  try {
    payload = JSON.parse(body) as { content?: string };
  } catch {
    sendJson(res, 400, { error: 'Corps JSON invalide.' });
    return;
  }

  if (typeof payload.content !== 'string') {
    sendJson(res, 400, { error: 'Le champ "content" est requis.' });
    return;
  }

  try {
    const words = dedupeWords(parseWordSource(payload.content));
    sendJson(res, 200, { words, count: words.length });
  } catch (error) {
    sendJson(res, 400, {
      error: error instanceof Error ? error.message : 'Erreur lors du parsing du dictionnaire.',
    });
  }
}

export function isValidSuggestionLimit(limit: unknown): limit is number {
  return (
    typeof limit === 'number' &&
    Number.isFinite(limit) &&
    Number.isInteger(limit) &&
    limit >= 0
  );
}

export async function handleApiSuggestions(body: string, res: ServerResponse): Promise<void> {
  let payload: { query?: string; words?: string[]; limit?: number };
  try {
    payload = JSON.parse(body) as { query?: string; words?: string[]; limit?: number };
  } catch {
    sendJson(res, 400, { error: 'Corps JSON invalide.' });
    return;
  }

  const query = payload.query ?? '';
  const words = payload.words;
  const limit = payload.limit ?? 10;

  if (!Array.isArray(words)) {
    sendJson(res, 400, { error: 'Le champ "words" est requis.' });
    return;
  }

  if (!isValidSuggestionLimit(limit)) {
    sendJson(res, 400, { error: 'Le nombre de suggestions doit être un nombre positif ou nul.' });
    return;
  }

  if (query === '') {
    sendJson(res, 200, { suggestions: [] });
    return;
  }

  if (!isValidQueryInput(query)) {
    sendJson(res, 400, { error: INVALID_QUERY_FORMAT_MESSAGE });
    return;
  }

  try {
    const suggestions = getSuggestions(query, words, limit);
    sendJson(res, 200, { suggestions });
  } catch (error) {
    sendJson(res, 400, { error: error instanceof Error ? error.message : 'Erreur inattendue.' });
  }
}
