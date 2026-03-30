/**
 * Vault Manager CLI - Command-line tool for managing encrypted credential vault
 * 
 * Commands:
 *   init               - Create new vault (prompts for passphrase)
 *   set KEY VALUE      - Store encrypted secret
 *   get KEY            - Retrieve decrypted secret
 *   list               - Show all secret keys (not values)
 *   delete KEY         - Delete a secret
 *   rotate             - Re-encrypt vault with new passphrase
 *   info               - Show vault metadata
 * 
 * Usage:
 *   npm run vault:init
 *   npm run vault:set NAVIGATOR_USERNAME user@domain.com
 *   npm run vault:get NAVIGATOR_USERNAME
 *   npm run vault:list
 */

import { Vault } from '../src/security/vault';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Prompt user for input (with optional masking for passwords).
 * @param question - Prompt text to display
 * @param hideInput - If true, masks input with asterisks (*)
 * @returns User input string
 */
function prompt(question: string, hideInput: boolean = false): Promise<string> {
  return new Promise((resolve) => {
    if (hideInput) {
      // Hide password input
      const stdin = process.stdin;
      (stdin as any).setRawMode(true);
      process.stdout.write(question);
      
      let password = '';
      stdin.on('data', function onData(char: Buffer) {
        const c = char.toString('utf-8');
        
        switch (c) {
          case '\n':
          case '\r':
          case '\u0004': // Ctrl-D
            stdin.removeListener('data', onData);
            (stdin as any).setRawMode(false);
            process.stdout.write('\n');
            resolve(password);
            break;
          case '\u0003': // Ctrl-C
            process.exit(0);
            break;
          case '\u007f': // Backspace
          case '\b':
            if (password.length > 0) {
              password = password.slice(0, -1);
              process.stdout.write('\b \b');
            }
            break;
          default:
            password += c;
            process.stdout.write('*');
            break;
        }
      });
    } else {
      rl.question(question, (answer) => {
        resolve(answer);
      });
    }
  });
}

/**
 * Get passphrase from environment variable or prompt.
 * Checks VAULT_PASSPHRASE env var first, prompts user if not set.
 * @returns Vault passphrase
 */
async function getPassphrase(): Promise<string> {
  const envPassphrase = process.env.VAULT_PASSPHRASE;
  if (envPassphrase) {
    return envPassphrase;
  }
  
  return await prompt('Enter vault passphrase: ', true);
}

/**
 * Initialize new vault.
 * Prompts for passphrase (twice for confirmation), creates .vault.enc file.
 */
async function initVault(): Promise<void> {
  console.log('🔐 Initializing new vault...');
  
  const passphrase = await prompt('Create vault passphrase (min 8 characters): ', true);
  if (passphrase.length < 8) {
    console.error('❌ Passphrase must be at least 8 characters');
    process.exit(1);
  }
  
  const confirm = await prompt('Confirm passphrase: ', true);
  if (passphrase !== confirm) {
    console.error('❌ Passphrases do not match');
    process.exit(1);
  }
  
  const vault = await Vault.initialize(passphrase);
  const info = await vault.getInfo();
  
  console.log('✅ Vault created successfully');
  console.log(`   Version: ${info.version}`);
  console.log(`   Created: ${info.createdAt}`);
  console.log('');
  console.log('💡 Set VAULT_PASSPHRASE environment variable to avoid prompts:');
  console.log('   export VAULT_PASSPHRASE="your-passphrase"');
  console.log('');
  console.log('⚠️  IMPORTANT: Remember your passphrase! It cannot be recovered.');
}

/**
 * Set a secret in vault.
 * @param key - Secret key name
 * @param value - Secret value to encrypt
 */
async function setSecret(key: string, value: string): Promise<void> {
  const passphrase = await getPassphrase();
  const vault = await Vault.initialize(passphrase);
  
  await vault.set(key, value);
  console.log(`✅ Secret "${key}" stored successfully`);
}

/**
 * Get a secret from vault.
 * @param key - Secret key name to retrieve
 */
async function getSecret(key: string): Promise<void> {
  const passphrase = await getPassphrase();
  const vault = await Vault.initialize(passphrase);
  
  const value = await vault.get(key);
  console.log(value);
}

/**
 * List all secret keys.
 * Shows key names but not secret values.
 */
async function listSecrets(): Promise<void> {
  const passphrase = await getPassphrase();
  const vault = await Vault.initialize(passphrase);
  
  const keys = await vault.list();
  
  if (keys.length === 0) {
    console.log('📭 Vault is empty');
  } else {
    console.log('🗝️  Vault secrets:');
    keys.forEach((key) => {
      console.log(`   - ${key}`);
    });
  }
}

/**
 * Delete a secret.
 * @param key - Secret key name to delete
 */
async function deleteSecret(key: string): Promise<void> {
  const passphrase = await getPassphrase();
  const vault = await Vault.initialize(passphrase);
  
  const confirm = await prompt(`Delete secret "${key}"? (yes/no): `, false);
  if (confirm.toLowerCase() !== 'yes') {
    console.log('❌ Cancelled');
    return;
  }
  
  await vault.delete(key);
  console.log(`✅ Secret "${key}" deleted`);
}

/**
 * Rotate vault passphrase.
 * Re-encrypts all secrets with new passphrase.
 */
async function rotateVault(): Promise<void> {
  console.log('🔄 Rotating vault passphrase...');
  
  const oldPassphrase = await prompt('Enter current passphrase: ', true);
  const vault = await Vault.initialize(oldPassphrase);
  
  const newPassphrase = await prompt('Enter new passphrase (min 8 characters): ', true);
  if (newPassphrase.length < 8) {
    console.error('❌ New passphrase must be at least 8 characters');
    process.exit(1);
  }
  
  const confirm = await prompt('Confirm new passphrase: ', true);
  if (newPassphrase !== confirm) {
    console.error('❌ Passphrases do not match');
    process.exit(1);
  }
  
  await vault.rotate(newPassphrase);
  console.log('✅ Vault passphrase rotated successfully');
  console.log('   All secrets re-encrypted with new key');
}

/**
 * Show vault info.
 * Displays version, creation/update dates, and secret count.
 */
async function showInfo(): Promise<void> {
  const passphrase = await getPassphrase();
  const vault = await Vault.initialize(passphrase);
  
  const info = await vault.getInfo();
  
  console.log('🔐 Vault Information:');
  console.log(`   Version: ${info.version}`);
  console.log(`   Created: ${info.createdAt}`);
  console.log(`   Updated: ${info.updatedAt}`);
  console.log(`   Secrets: ${info.secretCount}`);
}

/**
 * Main CLI entry point.
 * Parses command-line arguments and dispatches to appropriate function.
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    switch (command) {
      case 'init':
        await initVault();
        break;
      case 'set':
        if (args.length < 3) {
          console.error('❌ Usage: npm run vault:set KEY VALUE');
          process.exit(1);
        }
        await setSecret(args[1]!, args[2]!);
        break;
      case 'get':
        if (args.length < 2) {
          console.error('❌ Usage: npm run vault:get KEY');
          process.exit(1);
        }
        await getSecret(args[1]!);
        break;
      case 'list':
        await listSecrets();
        break;
      case 'delete':
        if (args.length < 2) {
          console.error('❌ Usage: npm run vault:delete KEY');
          process.exit(1);
        }
        await deleteSecret(args[1]!);
        break;
      case 'rotate':
        await rotateVault();
        break;
      case 'info':
        await showInfo();
        break;
      default:
        console.log('🔐 Vault Manager CLI');
        console.log('');
        console.log('Commands:');
        console.log('  init                - Create new vault');
        console.log('  set KEY VALUE       - Store encrypted secret');
        console.log('  get KEY             - Retrieve decrypted secret');
        console.log('  list                - Show all secret keys');
        console.log('  delete KEY          - Delete a secret');
        console.log('  rotate              - Change vault passphrase');
        console.log('  info                - Show vault metadata');
        console.log('');
        console.log('Examples:');
        console.log('  npm run vault:init');
        console.log('  npm run vault:set NAVIGATOR_USERNAME user@domain.com');
        console.log('  npm run vault:get NAVIGATOR_USERNAME');
        console.log('  npm run vault:list');
        process.exit(command ? 1 : 0);
    }
    
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error: ${(error as Error).message}`);
    rl.close();
    process.exit(1);
  }
}

main();
