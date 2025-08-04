import { ENV } from './env';
import { Keypair } from '@solana/web3.js';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import bs58 from 'bs58';

/**
 * Detects the format of a Solana keypair string and returns a Keypair instance
 * Supports: JSON array, Base58 private key, seed phrase, and hex formats
 */
export function loadKeypairFromString(keyString: string): Keypair {
  const trimmed = keyString.trim();

  // Try JSON array format first (most common)
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const keyArray = JSON.parse(trimmed);
      if (Array.isArray(keyArray) && keyArray.length === 64) {
        return Keypair.fromSecretKey(new Uint8Array(keyArray));
      }
    } catch (error) {
      // Continue to next format
    }
  }

  // Try seed phrase format (12 or 24 words)
  const words = trimmed.split(' ').filter((word) => word.length > 0);
  if (
    (words.length === 12 || words.length === 24) &&
    bip39.validateMnemonic(trimmed)
  ) {
    try {
      const seed = bip39.mnemonicToSeedSync(trimmed);
      const derivedSeed = derivePath(
        "m/44'/501'/0'/0'",
        seed.toString('hex')
      ).key;
      return Keypair.fromSeed(derivedSeed);
    } catch (error: any) {
      throw new Error(
        `Failed to create keypair from seed phrase: ${error?.message}`
      );
    }
  }

  // Try Base58 format (single string, typically 87-88 characters)
  if (
    trimmed.length >= 80 &&
    trimmed.length <= 90 &&
    /^[1-9A-HJ-NP-Za-km-z]+$/.test(trimmed)
  ) {
    try {
      const decoded = bs58.decode(trimmed);
      if (decoded.length === 64) {
        return Keypair.fromSecretKey(decoded);
      } else if (decoded.length === 32) {
        return Keypair.fromSeed(decoded);
      }
    } catch (error) {
      // Continue to next format
    }
  }

  // Try hex format (64 or 128 characters)
  if (/^[0-9a-fA-F]+$/.test(trimmed)) {
    try {
      if (trimmed.length === 64) {
        // 32 bytes = seed
        const bytes = Buffer.from(trimmed, 'hex');
        return Keypair.fromSeed(bytes);
      } else if (trimmed.length === 128) {
        // 64 bytes = full secret key
        const bytes = Buffer.from(trimmed, 'hex');
        return Keypair.fromSecretKey(bytes);
      }
    } catch (error) {
      // Continue to next format
    }
  }

  // Try comma-separated numbers (alternative JSON format)
  if (trimmed.includes(',') && !trimmed.includes('[')) {
    try {
      const numbers = trimmed.split(',').map((s) => parseInt(s.trim()));
      if (numbers.length === 64 && numbers.every((n) => n >= 0 && n <= 255)) {
        return Keypair.fromSecretKey(new Uint8Array(numbers));
      }
    } catch (error) {
      // Continue to error
    }
  }

  throw new Error(`Unable to detect keypair format. Supported formats:
    - JSON array: [123,45,67,...]
    - Base58 private key: 3QqJ7s8KxC2BvF9G...
    - Seed phrase: "word1 word2 word3..."
    - Hex string: a1b2c3d4e5f6...
    - Comma-separated: 123,45,67,...`);
}

/**
 * Loads a keypair from the SOLANA_PRIVATE_KEY environment variable
 */
export function loadKeypairFromEnv(): Keypair {
  const keyString = ENV.SOLANA_PRIVATE_KEY;

  if (!keyString) {
    throw new Error(`Environment variable SOLANA_PRIVATE_KEY is not set`);
  }

  return loadKeypairFromString(keyString);
}
