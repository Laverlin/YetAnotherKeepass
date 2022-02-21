import { Argon2Type, Argon2Version } from 'kdbxweb/dist/types/crypto/crypto-engine';
import argon2 from 'argon2';

/**
 * Argon2 hash implementation
 * @param password
 * @param salt
 * @param memory
 * @param iterations
 * @param length
 * @param parallelism
 * @param type
 * @param version
 * @returns Uint8Array Buffer
 */
export async function argon2Hash(
  password: ArrayBuffer,
  salt: ArrayBuffer,
  memory: number,
  iterations: number,
  length: number,
  parallelism: number,
  type: Argon2Type,
  version: Argon2Version
): Promise<ArrayBuffer> {
  const hash = await argon2.hash(Buffer.from(password), {
    salt: Buffer.from(salt),
    memoryCost: memory,
    timeCost: iterations,
    parallelism,
    type,
    version,
    hashLength: length,
    raw: true,
  });
  return new Uint8Array(hash.buffer);
}
