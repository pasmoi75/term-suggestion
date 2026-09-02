import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getSuggestions,
  parseWordSource,
  isValidQueryInput,
  INVALID_QUERY_FORMAT_MESSAGE,
} from '../src/index.ts';

const PORT = Number(process.env.PORT ?? 3456);
const UI_DIR = join(fileURLToPath(new URL('../ui', import.meta.url)));

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
};

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

function sendJson(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function dedupeWords(rawWords: string[]): string[] {
  const seen = new Set<string>();
  const words: string[] = [];
  for (const word of rawWords) {
    if (word === '' || seen.has(word)) continue;
    seen.add(word);
    words.push(word);
  }
  return words;
}

async function handleApiDictionary(body: string, res: ServerResponse): Promise<void> {
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

async function handleApiSuggestions(body: string, res: ServerResponse): Promise<void> {
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

  if (!Number.isFinite(limit) || limit < 0) {
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

async function serveStatic(pathname: string, res: ServerResponse): Promise<void> {
  const safePath = pathname === '/' ? '/index.html' : pathname;
  const relativePath = safePath.replace(/^\/+/, '');
  const filePath = join(UI_DIR, relativePath);

  if (!filePath.startsWith(UI_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  try {
    const content = await readFile(filePath);
    const ext = extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] ?? 'application/octet-stream' });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);

  if (req.method === 'POST' && url.pathname === '/api/dictionary') {
    const body = await readBody(req);
    await handleApiDictionary(body, res);
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/suggestions') {
    const body = await readBody(req);
    await handleApiSuggestions(body, res);
    return;
  }

  if (req.method === 'GET') {
    await serveStatic(url.pathname, res);
    return;
  }

  res.writeHead(405);
  res.end('Method not allowed');
});

server.listen(PORT, () => {
  console.log(`Interface disponible sur http://localhost:${PORT}`);
});
