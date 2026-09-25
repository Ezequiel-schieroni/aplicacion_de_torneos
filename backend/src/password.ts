import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const keyLength = 64;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, keyLength).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedValue: string) {
  const [salt, storedHash] = storedValue.split(':');
  if (!salt || !storedHash) {
    return false;
  }
  const computedHash = scryptSync(password, salt, keyLength);
  const expectedHash = Buffer.from(storedHash, 'hex');
  return expectedHash.length === computedHash.length && timingSafeEqual(computedHash, expectedHash);
}
