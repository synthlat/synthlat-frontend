import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; 
const IV_LENGTH = 16;
const PREFIX = 'v1';

function getKey() {
  if (!ENCRYPTION_KEY) throw new Error('ENCRYPTION_KEY not set');
  // Use SHA-256 to ensure the key is exactly 32 bytes long
  return createHash('sha256').update(String(ENCRYPTION_KEY)).digest();
}

export function encrypt(text) {
  if (!text) return null;

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const tag = cipher.getAuthTag();
  return `${PREFIX}:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(text) {
  if (!text) return null;

  const parts = String(text).split(':');

  // New format: v1:iv:tag:cipher
  if (parts.length === 4 && parts[0] === PREFIX) {
    const iv = Buffer.from(parts[1], 'hex');
    const tag = Buffer.from(parts[2], 'hex');
    const encryptedText = Buffer.from(parts[3], 'hex');
    const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  // Legacy format (CBC): iv:cipher
  if (parts.length === 2) {
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = Buffer.from(parts[1], 'hex');
    const legacyDecipher = createDecipheriv('aes-256-cbc', getKey(), iv);
    let decrypted = legacyDecipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, legacyDecipher.final()]);
    return decrypted.toString();
  }

  throw new Error('Invalid encrypted payload format');
}
