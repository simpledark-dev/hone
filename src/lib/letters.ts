export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
export const VOWELS = ['A', 'E', 'I', 'O', 'U'];

export function isVowel(letter: string): boolean {
  return VOWELS.includes(letter.toUpperCase());
}

/**
 * Letter pools for the listening exercise, ordered by how easy the spoken
 * names are to tell apart. Spoken letter names cluster into rhyme sets
 * ("B C D E G P T V Z", "A J K", "M N", "F S X"); the easy pool avoids
 * putting members of the same set together.
 */
export const POOL_DISTINCT = ['A', 'H', 'I', 'K', 'L', 'O', 'Q', 'R', 'S', 'U', 'W', 'Y'];
export const POOL_MEDIUM = [...POOL_DISTINCT, 'E', 'F', 'J', 'M', 'X', 'Z'];
export const POOL_FULL = ALPHABET;
