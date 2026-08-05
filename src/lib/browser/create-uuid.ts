type UuidCrypto = {
  getRandomValues?: (values: Uint8Array) => Uint8Array;
  randomUUID?: () => string;
};

/**
 * Creates a RFC 4122 UUID v4 without requiring support for crypto.randomUUID.
 * Some supported workstations expose getRandomValues but not randomUUID.
 */
export function createUuidV4(browserCrypto: UuidCrypto | undefined = globalThis.crypto): string {
  if (typeof browserCrypto?.randomUUID === 'function') return browserCrypto.randomUUID();

  const bytes = new Uint8Array(16);
  const fillRandomValues = browserCrypto?.getRandomValues;
  try {
    if (fillRandomValues) fillRandomValues.call(browserCrypto, bytes);
    else throw new Error('Secure random values are unavailable.');
  } catch {
    for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
