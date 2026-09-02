import { describe, expect, it } from 'vitest';
import { getSuggestions } from '../src/get-suggestions.ts';
import {
  INVALID_QUERY_FORMAT_MESSAGE,
  isValidQueryInput,
} from '../src/validator.ts';

describe('validator', () => {
  const wordList = ['gros', 'gras', 'chat'];

  it('accepts lowercase alphanumeric queries', () => {
    expect(isValidQueryInput('gros')).toBe(true);
    expect(isValidQueryInput('chat123')).toBe(true);
    expect(getSuggestions('gros', wordList, 2)).toEqual(['gros', 'gras']);
  });

  it('accepts digit-only and mixed alphanumeric queries', () => {
    expect(isValidQueryInput('123')).toBe(true);
    expect(isValidQueryInput('test0')).toBe(true);
    expect(getSuggestions('123', ['123', '124', 'abc'], 2)).toEqual(['123', '124']);
  });

  it('rejects control characters in the query', () => {
    expect(isValidQueryInput('a\tb')).toBe(false);
    expect(isValidQueryInput('a\nb')).toBe(false);
    expect(() => getSuggestions('a\tb', wordList, 2)).toThrow(INVALID_QUERY_FORMAT_MESSAGE);
    expect(() => getSuggestions('a\nb', wordList, 2)).toThrow(INVALID_QUERY_FORMAT_MESSAGE);
  });

  it('rejects uppercase letters', () => {
    expect(isValidQueryInput('GROS')).toBe(false);
    expect(() => getSuggestions('GROS', wordList, 2)).toThrow(
      INVALID_QUERY_FORMAT_MESSAGE,
    );
  });

  it('rejects spaces and surrounding whitespace', () => {
    expect(isValidQueryInput(' chat')).toBe(false);
    expect(isValidQueryInput('chat ')).toBe(false);
    expect(isValidQueryInput('foo bar')).toBe(false);
    expect(() => getSuggestions(' chat', wordList, 3)).toThrow(
      INVALID_QUERY_FORMAT_MESSAGE,
    );
  });

  it('rejects non-alphanumeric characters', () => {
    expect(isValidQueryInput('chat!')).toBe(false);
    expect(isValidQueryInput('café')).toBe(false);
    expect(() => getSuggestions('chat!', wordList, 3)).toThrow(
      INVALID_QUERY_FORMAT_MESSAGE,
    );
  });

  it('rejects an empty query', () => {
    expect(isValidQueryInput('')).toBe(false);
    expect(() => getSuggestions('', wordList, 3)).toThrow(
      INVALID_QUERY_FORMAT_MESSAGE,
    );
  });
});
