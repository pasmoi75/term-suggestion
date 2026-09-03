export const INVALID_QUERY_FORMAT_MESSAGE =
  'Ce n\'est pas le format attendu : le mot doit être en minuscules et ne contenir que des caractères alphanumériques ([a-z0-9]).';

const QUERY_FORMAT_REGEX = /^[a-z0-9]+$/;

/** Shared by query validation and dictionary entry filtering during search. */
export function isValidQueryInput(word: string): boolean {
  return QUERY_FORMAT_REGEX.test(word);
}

export function assertValidQueryInput(word: string): void {
  if (!isValidQueryInput(word)) {
    throw new Error(INVALID_QUERY_FORMAT_MESSAGE);
  }
}
