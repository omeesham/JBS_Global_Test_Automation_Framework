/**
 * Server-side decryption for sensitive fields received from the client.
 * Matches the XOR + Base64 encryption used on the frontend.
 */

const SHARED_KEY = 'iQE-s3cure-tr@nsit-2024!';
const ENC_PREFIX = '__ENC__';

export function decryptField(encoded: string): string {
  if (!encoded || !encoded.startsWith(ENC_PREFIX)) return encoded; // not encrypted, return as-is
  const b64 = encoded.slice(ENC_PREFIX.length);
  const keyBytes = Buffer.from(SHARED_KEY);
  const encrypted = Buffer.from(b64, 'base64');
  const decrypted = Buffer.alloc(encrypted.length);
  for (let i = 0; i < encrypted.length; i++) {
    decrypted[i] = encrypted[i]! ^ keyBytes[i % keyBytes.length]!;
  }
  return decrypted.toString('utf8');
}

/** Decrypt all encrypted values in a request body object */
export function decryptBody<T extends Record<string, any>>(body: T): T {
  const result = { ...body };
  for (const key of Object.keys(result)) {
    if (typeof result[key] === 'string' && (result[key] as string).startsWith(ENC_PREFIX)) {
      (result as any)[key] = decryptField(result[key]);
    }
  }
  return result;
}

/** Mask a string for safe logging: show first 3 and last 2 chars only */
export function maskSecret(value: string): string {
  if (!value || value.length < 8) return '***';
  return value.slice(0, 3) + '***' + value.slice(-2);
}
