import { expect, it } from 'vitest';
import { canonicalJson, sha256Hex } from './crypto';

it('[CRY-URS-01] SHA-256 estándar y JSON canónico con claves ordenadas', async () => {
  expect(await sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  expect(canonicalJson({ b: 1, a: { d: [1, { f: 2, e: 3 }], c: 'x' }, z: undefined })).toBe(
    '{"a":{"c":"x","d":[1,{"e":3,"f":2}]},"b":1}',
  );
});

it('[CRY-URS-02] JSON canónico rechaza objetos no planos y números no finitos', () => {
  expect(() => canonicalJson(new Date())).toThrow('canonicalJson: only plain objects, arrays and primitives');
  expect(() => canonicalJson(Number.NaN)).toThrow('canonicalJson: only plain objects, arrays and primitives');
  expect(() => canonicalJson({ a: new Date() })).toThrow('canonicalJson: only plain objects, arrays and primitives');
  expect(() => canonicalJson([Number.POSITIVE_INFINITY])).toThrow(
    'canonicalJson: only plain objects, arrays and primitives',
  );
});
