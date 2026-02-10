import { randomInt } from 'crypto';

interface IGenerateCode {
  length?: number;
}

const DEFAULT_LENGTH = 6;
// Alphanumeric charset: uppercase letters and digits
const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * Generate a secure alphanumeric code with exact length.
 * Uses crypto.randomInt for unbiased selection from CHARSET.
 *
 * @param length - desired length (default 6). Must be >= 1.
 * @returns generated code (always exact `length` characters)
 */
export function generateCode({ length = DEFAULT_LENGTH }: IGenerateCode): string {
  if (length < 1) throw new RangeError('length must be >= 1');

  const chars = Array.from({ length }, () => {
    const idx = randomInt(0, CHARSET.length);
    return CHARSET[idx];
  });

  return chars.join('');
}
