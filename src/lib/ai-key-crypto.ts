/**
 * Encrypts each person's own AI key before it is stored (AES-256-GCM through Web Crypto, so it runs on the Edge
 * runtime too). The secret is KEY_ENCRYPTION_SECRET: 64 hex characters, for example from
 * `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Changing it makes every stored key
 * unreadable, so people would have to enter theirs again.
 */

const HEX_64 = /^[0-9a-fA-F]{64}$/;

export function isEncryptionConfigured(): boolean {
  return HEX_64.test(process.env.KEY_ENCRYPTION_SECRET ?? '');
}

const fromHex = (hex: string) => Uint8Array.from(hex.match(/.{2}/g)!.map((b) => parseInt(b, 16)));
const toBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const fromBase64 = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

async function importSecret(usage: 'encrypt' | 'decrypt') {
  const secret = process.env.KEY_ENCRYPTION_SECRET ?? '';
  if (!HEX_64.test(secret)) throw new Error('KEY_ENCRYPTION_SECRET is not set (64 hex characters).');
  return crypto.subtle.importKey('raw', fromHex(secret), 'AES-GCM', false, [usage]);
}

/** Returns "v1.<iv>.<ciphertext>" (base64). A fresh random IV is used every time. */
export async function encryptSecret(plain: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await importSecret('encrypt');
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plain)));
  return `v1.${toBase64(iv)}.${toBase64(cipher)}`;
}

export async function decryptSecret(stored: string): Promise<string> {
  const [version, iv, cipher] = stored.split('.');
  if (version !== 'v1' || !iv || !cipher) throw new Error('Unreadable stored key.');
  const key = await importSecret('decrypt');
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(iv) }, key, fromBase64(cipher));
  return new TextDecoder().decode(plain);
}
