import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleApiDictionary, handleApiSuggestions } from '../src/api-handlers.ts';

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
