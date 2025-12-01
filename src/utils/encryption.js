// Simple encryption/decryption using the user's ID as the key
// This ensures only the user who drew can decrypt their recipient

function stringToBytes(str) {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i);
  }
  return bytes;
}

function bytesToString(bytes) {
  return String.fromCharCode.apply(null, bytes);
}

function xorEncrypt(text, key) {
  const textBytes = stringToBytes(text);
  const keyBytes = stringToBytes(key);
  const encrypted = new Uint8Array(textBytes.length);

  for (let i = 0; i < textBytes.length; i++) {
    encrypted[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
  }

  return btoa(bytesToString(encrypted));
}

function xorDecrypt(encryptedText, key) {
  const encryptedBytes = stringToBytes(atob(encryptedText));
  const keyBytes = stringToBytes(key);
  const decrypted = new Uint8Array(encryptedBytes.length);

  for (let i = 0; i < encryptedBytes.length; i++) {
    decrypted[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
  }

  return bytesToString(decrypted);
}

export function encryptRecipient(recipientId, giverId) {
  const key = `bunot2x-${giverId}-secret-key`;
  return xorEncrypt(recipientId, key);
}

export function decryptRecipient(encryptedRecipientId, giverId) {
  const key = `bunot2x-${giverId}-secret-key`;
  return xorDecrypt(encryptedRecipientId, key);
}

// Create a one-way hash for tracking taken recipients without revealing who they are
export function hashRecipient(recipientId) {
  let hash = 0;
  const str = `bunot2x-hash-${recipientId}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}
