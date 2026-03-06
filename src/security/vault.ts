/**
 * @agent-doc
 * PURPOSE: Encrypted credential vault using AES-256-GCM encryption. Stores sensitive test credentials (passwords, API keys, MFA secrets) in encrypted format. Master key derived from passphrase via PBKDF2 with 100,000 iterations.
 * OWNER: human-only
 * IMPACT: critical - All test credentials depend on this. Breaking encryption breaks all authenticated tests. Security vulnerability if encryption weakened.
 * DEPENDS-ON: Node.js crypto, fs, path
 * USED-BY: CredentialLoader, global-setup.ts
 * RULES: NEVER weaken encryption. NEVER log passphrases. NEVER commit .vault.enc to git. Keep PBKDF2 iterations >= 100,000. Only human-controlled credential management.
 */

/**
 * Encrypted credential vault using AES-256-GCM encryption.
 * Stores sensitive test credentials (passwords, API keys, MFA secrets) in encrypted format.
 * Master key derived from passphrase via PBKDF2 with 100,000 iterations for security.
 * Each secret gets unique IV (initialization vector) for additional protection.
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// Vault data file stored at project root config/secrets/.vault.enc
// Uses process.cwd() so path resolves correctly from both src/ and dist/
const VAULT_FILE = path.join(process.cwd(), 'config', 'secrets', '.vault.enc');
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;  // 128 bits
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_DIGEST = 'sha512';

interface VaultData {
  version: string;
  createdAt: string;
  updatedAt: string;
  secrets: Record<string, EncryptedSecret>;
}

interface EncryptedSecret {
  data: string;        // Base64-encoded encrypted data
  iv: string;          // Base64-encoded IV
  authTag: string;     // Base64-encoded authentication tag
  createdAt: string;
  updatedAt: string;
}

export class Vault {
  private masterKey: Buffer;
  private vaultData: VaultData;

  /**
   * Private constructor - use Vault.initialize() to create instance
   */
  private constructor(masterKey: Buffer, vaultData: VaultData) {
    this.masterKey = masterKey;
    this.vaultData = vaultData;
  }

  /**
   * Initialize vault with passphrase.
   * Creates new vault if .vault.enc doesn't exist, loads existing vault otherwise.
   * Master key derived from passphrase via PBKDF2 with 100,000 iterations.
   * @param passphrase - Master passphrase for vault encryption (min 8 characters)
   * @returns Initialized Vault instance
   * @throws Error if passphrase too short or vault decryption fails
   */
  static async initialize(passphrase: string): Promise<Vault> {
    if (!passphrase || passphrase.length < 8) {
      throw new Error('Passphrase must be at least 8 characters');
    }

    const masterKey = await Vault.deriveKey(passphrase);

    if (fs.existsSync(VAULT_FILE)) {
      // Load existing vault
      const encrypted = fs.readFileSync(VAULT_FILE, 'utf-8');
      const vaultData = await Vault.decryptVault(encrypted, masterKey);
      return new Vault(masterKey, vaultData);
    } else {
      // Create new vault
      const vaultData: VaultData = {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        secrets: {},
      };
      const vault = new Vault(masterKey, vaultData);
      await vault.save();
      return vault;
    }
  }

  /**
   * Derive encryption key from passphrase using PBKDF2.
   * Uses 100,000 iterations with sha512 for strong key derivation.
   * @param passphrase - User-provided passphrase
   * @returns 256-bit encryption key
   * @private
   */
  private static async deriveKey(passphrase: string): Promise<Buffer> {
    const salt = Buffer.from('navigator4-vault-salt-v1'); // Static salt (acceptable for single-user vault)
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(passphrase, salt, PBKDF2_ITERATIONS, KEY_LENGTH, PBKDF2_DIGEST, (err, key) => {
        if (err) reject(err);
        else resolve(key);
      });
    });
  }

  /**
   * Decrypt vault file.
   * @param encrypted - Encrypted vault content (iv:authTag:data format)
   * @param masterKey - Master encryption key
   * @returns Decrypted vault data
   * @throws Error if decryption fails or passphrase is incorrect
   * @private
   */
  private static async decryptVault(encrypted: string, masterKey: Buffer): Promise<VaultData> {
    try {
      const parts = encrypted.split(':');
      if (parts.length !== 3) throw new Error('Invalid vault format');

      const iv = Buffer.from(parts[0]!, 'base64');
      const authTag = Buffer.from(parts[1]!, 'base64');
      const data = Buffer.from(parts[2]!, 'base64');

      const decipher = crypto.createDecipheriv(ALGORITHM, masterKey, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(data);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      return JSON.parse(decrypted.toString('utf-8'));
    } catch (error) {
      throw new Error('Failed to decrypt vault. Check passphrase.');
    }
  }

  /**
   * Encrypt and save vault to file.
   * Generates new IV for each save operation.
   * @private
   */
  private async save(): Promise<void> {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.masterKey, iv);

    this.vaultData.updatedAt = new Date().toISOString();
    const json = JSON.stringify(this.vaultData);

    let encrypted = cipher.update(json, 'utf-8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    const authTag = cipher.getAuthTag();

    const output = `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;

    // Create directory if it doesn't exist
    const dir = path.dirname(VAULT_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(VAULT_FILE, output, 'utf-8');
  }

  /**
   * Get decrypted secret value.
   * @param key - Secret key name (e.g., 'NAVIGATOR_USERNAME', 'NAVIGATOR_PASSWORD')
   * @returns Decrypted secret value
   * @throws Error if secret not found
   */
  async get(key: string): Promise<string> {
    const secret = this.vaultData.secrets[key];
    if (!secret) {
      throw new Error(`Secret not found: ${key}`);
    }

    const iv = Buffer.from(secret.iv, 'base64');
    const authTag = Buffer.from(secret.authTag, 'base64');
    const data = Buffer.from(secret.data, 'base64');

    const decipher = crypto.createDecipheriv(ALGORITHM, this.masterKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(data);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf-8');
  }

  /**
   * Store encrypted secret.
   * Each secret gets unique IV and auth tag for security.
   * @param key - Secret key name (e.g., 'NAVIGATOR_PASSWORD', 'API_KEY')
   * @param value - Secret value to encrypt
   */
  async set(key: string, value: string): Promise<void> {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.masterKey, iv);

    let encrypted = cipher.update(value, 'utf-8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    const authTag = cipher.getAuthTag();

    this.vaultData.secrets[key] = {
      data: encrypted.toString('base64'),
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.save();
  }

  /**
   * List all secret keys (not values).
   * Use this to see what's in the vault without exposing sensitive data.
   * @returns Array of secret key names
   */
  async list(): Promise<string[]> {
    return Object.keys(this.vaultData.secrets);
  }

  /**
   * Check if secret exists.
   * @param key - Secret key name
   * @returns True if secret exists in vault
   */
  async has(key: string): Promise<boolean> {
    return key in this.vaultData.secrets;
  }

  /**
   * Delete a secret.
   * @param key - Secret key name to delete
   * @throws Error if secret not found
   */
  async delete(key: string): Promise<void> {
    if (!(key in this.vaultData.secrets)) {
      throw new Error(`Secret not found: ${key}`);
    }
    delete this.vaultData.secrets[key];
    await this.save();
  }

  /**
   * Rotate vault with new passphrase.
   * Re-encrypts all secrets with new master key derived from new passphrase.
   * Use this to change vault passphrase without losing secrets.
   * @param newPassphrase - New master passphrase (min 8 characters)
   * @throws Error if new passphrase too short
   */
  async rotate(newPassphrase: string): Promise<void> {
    if (!newPassphrase || newPassphrase.length < 8) {
      throw new Error('New passphrase must be at least 8 characters');
    }

    // Decrypt all secrets with old key
    const decryptedSecrets: Record<string, string> = {};
    for (const key of await this.list()) {
      decryptedSecrets[key] = await this.get(key);
    }

    // Generate new master key
    this.masterKey = await Vault.deriveKey(newPassphrase);

    // Re-encrypt all secrets with new key
    this.vaultData.secrets = {};
    for (const [key, value] of Object.entries(decryptedSecrets)) {
      await this.set(key, value);
    }

    await this.save();
  }

  /**
   * Get vault info (without exposing secrets).
   * @returns Vault metadata: version, creation date, update date, secret count
   */
  async getInfo(): Promise<{ version: string; createdAt: string; updatedAt: string; secretCount: number }> {
    return {
      version: this.vaultData.version,
      createdAt: this.vaultData.createdAt,
      updatedAt: this.vaultData.updatedAt,
      secretCount: Object.keys(this.vaultData.secrets).length,
    };
  }
}
