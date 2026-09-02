import { describe, expect, it } from 'vitest';
import type { ServerResponse } from 'node:http';
import {
  handleApiDictionary,
  handleApiSuggestions,
  isValidSuggestionLimit,
} from '../src/api-handlers.ts';

function createMockResponse(): {
  res: ServerResponse;
  status: () => number;
  json: () => unknown;
} {
  let statusCode = 0;
  let payload = '';

  const res = {
    writeHead(code: number) {
      statusCode = code;
    },
    end(data: string) {
      payload = data;
    },
  } as unknown as ServerResponse;

  return {
    res,
    status: () => statusCode,
    json: () => JSON.parse(payload),
  };
}

describe('handleApiDictionary', () => {
  it('returns words and count on success', async () => {
    const mock = createMockResponse();
    await handleApiDictionary(JSON.stringify({ content: 'gros\ngras\nchat' }), mock.res);
    expect(mock.status()).toBe(200);

    const body = mock.json() as { count: number; words: string[] };
    expect(body.count).toBe(3);
    expect(body.words).toEqual(['gros', 'gras', 'chat']);
  });

  it('deduplicates words on upload', async () => {
    const mock = createMockResponse();
    await handleApiDictionary(JSON.stringify({ content: 'gros\ngros\ngras' }), mock.res);
    expect(mock.status()).toBe(200);

    const body = mock.json() as { count: number; words: string[] };
    expect(body.count).toBe(2);
    expect(body.words).toEqual(['gros', 'gras']);
  });
});

describe('handleApiSuggestions', () => {
  const words = ['gros', 'gras', 'chat'];

  it('returns an empty suggestions list for an empty query', async () => {
    const mock = createMockResponse();
    await handleApiSuggestions(JSON.stringify({ query: '', words, limit: 5 }), mock.res);
    expect(mock.status()).toBe(200);
    expect(mock.json()).toEqual({ suggestions: [] });
  });

  it('returns suggestions when words are provided', async () => {
    const mock = createMockResponse();
    await handleApiSuggestions(JSON.stringify({ query: 'gros', words, limit: 5 }), mock.res);
    expect(mock.status()).toBe(200);
    expect((mock.json() as { suggestions: string[] }).suggestions).toContain('gros');
  });

  it('returns 400 when words is missing', async () => {
    const mock = createMockResponse();
    await handleApiSuggestions(JSON.stringify({ query: 'gros', limit: 5 }), mock.res);
    expect(mock.status()).toBe(400);
  });

  it('returns 400 for a negative limit', async () => {
    const mock = createMockResponse();
    await handleApiSuggestions(JSON.stringify({ query: 'gros', words, limit: -1 }), mock.res);
    expect(mock.status()).toBe(400);
  });

  it('rejects NaN as an invalid limit', () => {
    expect(isValidSuggestionLimit(NaN)).toBe(false);
  });

  it('returns 400 for a non-integer limit', async () => {
    const mock = createMockResponse();
    await handleApiSuggestions(JSON.stringify({ query: 'gros', words, limit: 2.5 }), mock.res);
    expect(mock.status()).toBe(400);
  });
});
