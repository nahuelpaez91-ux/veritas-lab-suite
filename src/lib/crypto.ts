// JSON determinista: claves ordenadas y sin `undefined`. Mismo objeto → mismo texto → mismo hash.
// Solo admite objetos planos, arreglos y primitivos finitos: así el hash no depende de una clase
// o de un valor (NaN/Infinity) que JSON.stringify serializaría de forma ambigua o con pérdida.
export function canonicalJson(value: unknown): string {
  if (typeof value === 'number' && !Number.isFinite(value)) {
    throw new Error('canonicalJson: only plain objects, arrays and primitives');
  }
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return `[${value.map((v) => canonicalJson(v === undefined ? null : v)).join(',')}]`;
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) {
    throw new Error('canonicalJson: only plain objects, arrays and primitives');
  }
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(',')}}`;
}

// Web Crypto: disponible en navegadores modernos y en Node ≥ 20.
export async function sha256Hex(text: string): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}
