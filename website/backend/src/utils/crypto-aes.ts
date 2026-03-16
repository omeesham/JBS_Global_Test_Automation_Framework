/**
 * AES-256-GCM encryption for sensitive data at rest (API keys, secrets).
 * Uses Node.js built-in crypto — zero external dependencies.
 *
 * Requires ENCRYPTION_SECRET env var (32-byte hex string = 64 hex chars).
 * In dev mode, falls back to a deterministic key (NOT secure for production).
 */
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;    // GCM standard
const TAG_LENGTH = 16;   // GCM auth tag
const ENCODING = 'base64' as const;

function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET;
  if (secret && secret.length === 64) {
    return Buffer.from(secret, 'hex');
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('ENCRYPTION_SECRET must be a 64-char hex string in production. Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  }

  // Dev fallback — deterministic key (NOT secure, only for local dev)
  console.warn('[crypto-aes] Using insecure dev key. Set ENCRYPTION_SECRET for production.');
  return Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');
}

/**
 * Encrypt a plaintext string for storage at rest.
 * Returns: base64(iv + ciphertext + authTag)
 */
export function encryptAtRest(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  // Pack: iv (12) + ciphertext (variable) + tag (16)
  const packed = Buffer.concat([iv, encrypted, tag]);
  return packed.toString(ENCODING);
}

/**
 * Decrypt a value previously encrypted with encryptAtRest().
 */
export function decryptAtRest(encoded: string): string {
  const key = getKey();
  const packed = Buffer.from(encoded, ENCODING);

  if (packed.length < IV_LENGTH + TAG_LENGTH + 1) {
    throw new Error('Invalid encrypted data: too short');
  }

  const iv = packed.subarray(0, IV_LENGTH);
  const tag = packed.subarray(packed.length - TAG_LENGTH);
  const ciphertext = packed.subarray(IV_LENGTH, packed.length - TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

/**
 * Generate a display hint for an API key: "sk-ant-...xY"
 */
export function apiKeyHint(apiKey: string): string {
  if (!apiKey || apiKey.length < 10) return '***';
  return apiKey.slice(0, 6) + '...' + apiKey.slice(-2);
}
