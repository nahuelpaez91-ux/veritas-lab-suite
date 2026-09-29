# Fase 1 · Parte 3: Integración LIS y núcleo LIMS (T12–T20)

> Parte del plan `2026-09-29-fase1-veritas-lab-suite.md`. TDD en todas las tareas de lógica.

---

### Task 12: Hash SHA-256 y JSON canónico

**Files:**
- Create: `src/lib/crypto.ts`
- Test: `src/lib/crypto.test.ts`

- [ ] **Step 1: Test que falla**

`src/lib/crypto.test.ts`:

```ts
import { expect, it } from 'vitest';
import { canonicalJson, sha256Hex } from './crypto';

it('[CRY-URS-01] SHA-256 estándar y JSON canónico con claves ordenadas', async () => {
  expect(await sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  expect(canonicalJson({ b: 1, a: { d: [1, { f: 2, e: 3 }], c: 'x' }, z: undefined })).toBe(
    '{"a":{"c":"x","d":[1,{"e":3,"f":2}]},"b":1}',
  );
});
```

- [ ] **Step 2: Verificar que falla**

Run: `npx vitest run src/lib/crypto.test.ts`
Esperado: FAIL.

- [ ] **Step 3: Implementación**

`src/lib/crypto.ts`:

```ts
// JSON determinista: claves ordenadas y sin `undefined`. Mismo objeto → mismo texto → mismo hash.
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return `[${value.map((v) => canonicalJson(v === undefined ? null : v)).join(',')}]`;
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
```

- [ ] **Step 4: Verificar que pasa y commit**

Run: `npx vitest run src/lib/crypto.test.ts`
Esperado: `1 passed`.

```bash
git add src/lib/crypto.ts src/lib/crypto.test.ts
git commit -m "feat: SHA-256 y JSON canónico

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 13: Parser ASTM E1394 con verificación de checksum

**Files:**
- Create: `src/lib/lis/types.ts`, `src/lib/lis/common.ts`, `src/lib/lis/loinc.ts`, `src/lib/lis/examples.ts`, `src/lib/lis/astm.ts`
- Test: `src/lib/lis/astm.test.ts`

- [ ] **Step 1: Tipos, utilidades, LOINC y mensajes de ejemplo**

`src/lib/lis/types.ts`:

```ts
export interface ParsedResult {
  specimenId: string;
  patientId: string;
  patientName: string;
  testCode: string;
  loinc: string | null;
  rawValue: string;
  value: number | null;
  units: string;
  referenceRange: string;
  flag: string;
  status: string;
  completedAt: string | null;
}

export type ParseIssueCode =
  | 'missing_header'
  | 'no_specimen'
  | 'result_before_order'
  | 'no_test_code'
  | 'non_numeric'
  | 'unknown_record'
  | 'bad_checksum'
  | 'not_oru'
  | 'missing_msh';

export interface ParseIssue {
  line: number;
  severity: 'error' | 'warning';
  code: ParseIssueCode;
  detail?: string;
}

export interface ParseOutcome {
  format: 'astm' | 'hl7';
  sender: string;
  results: ParsedResult[];
  issues: ParseIssue[];
}
```

`src/lib/lis/common.ts`:

```ts
// "20260929081500" → "2026-09-29T08:15:00" (hora local del equipo, sin zona)
export function parseTimestamp(raw: string): string | null {
  const m = raw.trim().match(/^(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?/);
  if (!m) return null;
  const [, y, mo, d, h = '00', mi = '00', s = '00'] = m;
  return `${y}-${mo}-${d}T${h}:${mi}:${s}`;
}

// Solo números simples; valores como "<5" o ">500" se conservan como texto (valor crudo).
export function parseNumeric(raw: string): number | null {
  const t = raw.trim();
  if (!/^[-+]?\d+([.,]\d+)?$/.test(t)) return null;
  return Number(t.replace(',', '.'));
}
```

`src/lib/lis/loinc.ts`:

```ts
export const LOINC_TABLE = [
  { code: 'GLU', loinc: '2345-7', es: 'Glucosa [masa/volumen] en suero o plasma', en: 'Glucose [Mass/volume] in Serum or Plasma' },
  { code: 'CHOL', loinc: '2093-3', es: 'Colesterol [masa/volumen] en suero o plasma', en: 'Cholesterol [Mass/volume] in Serum or Plasma' },
  { code: 'CREA', loinc: '2160-0', es: 'Creatinina [masa/volumen] en suero o plasma', en: 'Creatinine [Mass/volume] in Serum or Plasma' },
  { code: 'UREA', loinc: '3094-0', es: 'Nitrógeno ureico [masa/volumen] en suero o plasma', en: 'Urea nitrogen [Mass/volume] in Serum or Plasma' },
  { code: 'TRIG', loinc: '2571-8', es: 'Triglicéridos [masa/volumen] en suero o plasma', en: 'Triglyceride [Mass/volume] in Serum or Plasma' },
  { code: 'HGB', loinc: '718-7', es: 'Hemoglobina [masa/volumen] en sangre', en: 'Hemoglobin [Mass/volume] in Blood' },
] as const;

export function loincFor(code: string): string | null {
  return LOINC_TABLE.find((r) => r.code === code)?.loinc ?? null;
}

export function localCodeForLoinc(loinc: string): string | null {
  return LOINC_TABLE.find((r) => r.loinc === loinc)?.code ?? null;
}
```

`src/lib/lis/examples.ts`:

```ts
// Mensajes de ejemplo (datos ficticios) con la estructura de ASTM E1394 / LIS2-A2 y HL7 v2.5.1 ORU^R01.
export const ASTM_EXAMPLE = [
  'H|\\^&|||cobas-demo^1.0|||||||P|1|20260929083000',
  'P|1|PAC-0001|||Pérez^Juana',
  'O|1|M-2026-0101||^^^GLU\\^^^CHOL|R||20260929080000',
  'R|1|^^^GLU|112|mg/dL|70 to 110|H||F||||20260929081500',
  'R|2|^^^CHOL|185|mg/dL|<200|N||F||||20260929081600',
  'P|2|PAC-0002|||Soria^Carlos',
  'O|1|M-2026-0102||^^^GLU\\^^^CHOL|R||20260929080500',
  'R|1|^^^GLU|94|mg/dL|70 to 110|N||F||||20260929082000',
  'R|2|^^^CHOL|232|mg/dL|<200|H||F||||20260929082100',
  'L|1|N',
].join('\r');

export const HL7_EXAMPLE = [
  'MSH|^~\\&|ANALIZADOR|LAB|VERITAS|LAB|20260929083000||ORU^R01|MSG0001|P|2.5.1',
  'PID|1||PAC-0003^^^LAB||Luna^Rosa',
  'OBR|1||M-2026-0103|24331-1^Lipid panel^LN',
  'OBX|1|NM|2093-3^Cholesterol^LN||210|mg/dL|<200|H|||F|||20260929084000',
  'OBX|2|NM|2345-7^Glucose^LN||88|mg/dL|70-110|N|||F|||20260929084100',
].join('\r');
```

- [ ] **Step 2: Test que falla**

`src/lib/lis/astm.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { astmChecksum, parseAstm } from './astm';
import { ASTM_EXAMPLE } from './examples';

function frame(n: number, record: string): string {
  const body = `${n % 8}${record}\r\x03`;
  return `\x02${body}${astmChecksum(body)}\r\n`;
}

describe('ASTM E1394', () => {
  it('[ENL-URS-01] interpreta registros H, P, O, R y L del ejemplo', () => {
    const out = parseAstm(ASTM_EXAMPLE);
    expect(out.format).toBe('astm');
    expect(out.sender).toBe('cobas-demo 1.0');
    expect(out.issues).toEqual([]);
    expect(out.results).toHaveLength(4);
    expect(out.results[0]).toEqual({
      specimenId: 'M-2026-0101',
      patientId: 'PAC-0001',
      patientName: 'Pérez, Juana',
      testCode: 'GLU',
      loinc: '2345-7',
      rawValue: '112',
      value: 112,
      units: 'mg/dL',
      referenceRange: '70 to 110',
      flag: 'H',
      status: 'F',
      completedAt: '2026-09-29T08:15:00',
    });
    expect(out.results[3]).toMatchObject({ specimenId: 'M-2026-0102', testCode: 'CHOL', value: 232, flag: 'H' });
  });

  it('[ENL-URS-02] checksum LIS1-A: suma de bytes módulo 256 en hexadecimal', () => {
    // 1(49)+H(72)+|(124)+\(92)+^(94)+&(38)+CR(13)+ETX(3) = 485 → 485 mod 256 = 229 = E5
    expect(astmChecksum('1H|\\^&\r\x03')).toBe('E5');
  });

  it('[ENL-URS-03] quita tramas STX/ETX, valida checksums y detecta tramas corruptas', () => {
    const framed = '\x05' + ASTM_EXAMPLE.split('\r').map((rec, i) => frame(i + 1, rec)).join('') + '\x04';
    const out = parseAstm(framed);
    expect(out.issues).toEqual([]);
    expect(out.results).toHaveLength(4);
    const corrupt = parseAstm('\x021H|\\^&\r\x0300\r\n');
    expect(corrupt.issues.map((i) => i.code)).toContain('bad_checksum');
  });

  it('[ENL-URS-04] reporta errores de estructura y conserva valores no numéricos', () => {
    const noOrder = parseAstm(['H|\\^&', 'P|1|PAC-9', 'R|1|^^^GLU|90|mg/dL', 'L|1'].join('\r'));
    expect(noOrder.issues.map((i) => i.code)).toContain('result_before_order');
    const noHeader = parseAstm(['P|1|PAC-9', 'O|1|M-9', 'R|1|^^^GLU|<5|mg/dL'].join('\r'));
    expect(noHeader.issues.map((i) => i.code)).toEqual(expect.arrayContaining(['missing_header', 'non_numeric']));
    expect(noHeader.results[0]).toMatchObject({ rawValue: '<5', value: null });
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `npx vitest run src/lib/lis/astm.test.ts`
Esperado: FAIL.

- [ ] **Step 4: Implementación**

`src/lib/lis/astm.ts`:

```ts
import { parseNumeric, parseTimestamp } from './common';
import { loincFor } from './loinc';
import type { ParseIssue, ParseOutcome, ParsedResult } from './types';

const FRAME_RE = /\x02([0-7])([\s\S]*?)(\x03|\x17)([0-9A-Fa-f]{2})\r?\n?/g;

// LIS1-A / ASTM E1381: suma de los bytes desde el número de trama hasta ETX/ETB inclusive, módulo 256.
export function astmChecksum(frameContent: string): string {
  let sum = 0;
  for (const ch of frameContent) sum = (sum + ch.charCodeAt(0)) % 256;
  return sum.toString(16).toUpperCase().padStart(2, '0');
}

function stripFrames(raw: string): { text: string; issues: ParseIssue[] } {
  if (!raw.includes('\x02')) return { text: raw, issues: [] };
  const issues: ParseIssue[] = [];
  let text = '';
  let frameNo = 0;
  for (const m of raw.matchAll(FRAME_RE)) {
    frameNo++;
    const [, fn, body, end, checksum] = m;
    const expected = astmChecksum(fn + body + end);
    if (expected !== checksum.toUpperCase()) {
      issues.push({ line: frameNo, severity: 'error', code: 'bad_checksum', detail: `${checksum} ≠ ${expected}` });
    }
    text += body; // ETB: el registro continúa en la trama siguiente; ETX: el cuerpo ya termina en CR
  }
  return { text, issues };
}

export function parseAstm(raw: string): ParseOutcome {
  const { text, issues } = stripFrames(raw);
  const lines = text
    .split(/\r\n|\r|\n/)
    .map((l) => l.replace(/[\x04\x05\x06]/g, ''))
    .filter((l) => l.trim() !== '');

  const results: ParsedResult[] = [];
  let field = '|';
  let component = '^';
  let sender = '';
  let patientId = '';
  let patientName = '';
  let specimenId = '';

  if (!lines.some((l) => l.startsWith('H'))) issues.push({ line: 1, severity: 'error', code: 'missing_header' });

  lines.forEach((line, idx) => {
    const lineNo = idx + 1;
    if (line[0] === 'H') {
      // Los delimitadores se declaran en el propio encabezado: H|\^&
      field = line[1] ?? '|';
      component = line[3] ?? '^';
      sender = (line.split(field)[4] ?? '').split(component).filter(Boolean).join(' ');
      return;
    }
    const f = line.split(field);
    switch (f[0]) {
      case 'P':
        patientId = f[2] || f[3] || '';
        patientName = (f[5] ?? '').split(component).filter(Boolean).join(', ');
        specimenId = '';
        break;
      case 'O':
        specimenId = f[2] ?? '';
        if (!specimenId) issues.push({ line: lineNo, severity: 'error', code: 'no_specimen' });
        break;
      case 'R': {
        if (!specimenId) {
          issues.push({ line: lineNo, severity: 'error', code: 'result_before_order' });
          break;
        }
        const testCode = (f[2] ?? '').split(component).filter(Boolean).pop() ?? '';
        if (!testCode) issues.push({ line: lineNo, severity: 'warning', code: 'no_test_code' });
        const rawValue = f[3] ?? '';
        const value = parseNumeric(rawValue);
        if (value === null) issues.push({ line: lineNo, severity: 'warning', code: 'non_numeric', detail: rawValue });
        results.push({
          specimenId,
          patientId,
          patientName,
          testCode,
          loinc: loincFor(testCode),
          rawValue,
          value,
          units: f[4] ?? '',
          referenceRange: f[5] ?? '',
          flag: f[6] ?? '',
          status: f[8] ?? '',
          completedAt: parseTimestamp(f[12] ?? ''),
        });
        break;
      }
      case 'C':
      case 'M':
      case 'Q':
      case 'L':
        break;
      default:
        issues.push({ line: lineNo, severity: 'warning', code: 'unknown_record', detail: f[0] });
    }
  });

  return { format: 'astm', sender, results, issues };
}
```

- [ ] **Step 5: Verificar que pasa y commit**

Run: `npx vitest run src/lib/lis/astm.test.ts`
Esperado: `4 passed`.

```bash
git add src/lib/lis
git commit -m "feat: parser ASTM E1394 con tramas, checksum y mapeo LOINC

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 14: Parser HL7 v2 ORU^R01 y detección de formato

**Files:**
- Create: `src/lib/lis/hl7.ts`, `src/lib/lis/parse.ts`
- Test: `src/lib/lis/hl7.test.ts`

- [ ] **Step 1: Test que falla**

`src/lib/lis/hl7.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { HL7_EXAMPLE, ASTM_EXAMPLE } from './examples';
import { parseHl7 } from './hl7';
import { parseMessage } from './parse';

describe('HL7 v2', () => {
  it('[ENL-URS-05] interpreta MSH, PID, OBR y OBX; mapea LOINC a código local', () => {
    const out = parseHl7(HL7_EXAMPLE);
    expect(out.sender).toBe('ANALIZADOR');
    expect(out.issues).toEqual([]);
    expect(out.results).toHaveLength(2);
    expect(out.results[0]).toEqual({
      specimenId: 'M-2026-0103',
      patientId: 'PAC-0003',
      patientName: 'Luna, Rosa',
      testCode: 'CHOL',
      loinc: '2093-3',
      rawValue: '210',
      value: 210,
      units: 'mg/dL',
      referenceRange: '<200',
      flag: 'H',
      status: 'F',
      completedAt: '2026-09-29T08:40:00',
    });
    expect(out.results[1]).toMatchObject({ testCode: 'GLU', value: 88 });
  });

  it('[ENL-URS-06] valida el tipo de mensaje y detecta el formato automáticamente', () => {
    expect(parseHl7('PID|1||X').issues.map((i) => i.code)).toEqual(['missing_msh']);
    const adt = parseHl7('MSH|^~\\&|A|B|C|D|20260101||ADT^A01|1|P|2.5.1');
    expect(adt.issues.map((i) => i.code)).toEqual(['not_oru']);
    expect(parseMessage(HL7_EXAMPLE).format).toBe('hl7');
    expect(parseMessage(ASTM_EXAMPLE).format).toBe('astm');
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `npx vitest run src/lib/lis/hl7.test.ts`
Esperado: FAIL.

- [ ] **Step 3: Implementación**

`src/lib/lis/hl7.ts`:

```ts
import { parseNumeric, parseTimestamp } from './common';
import { loincFor, localCodeForLoinc } from './loinc';
import type { ParseIssue, ParseOutcome, ParsedResult } from './types';

export function parseHl7(raw: string): ParseOutcome {
  const segments = raw.split(/\r\n|\r|\n/).filter((s) => s.trim() !== '');
  const issues: ParseIssue[] = [];
  const results: ParsedResult[] = [];

  if (!segments[0]?.startsWith('MSH')) {
    issues.push({ line: 1, severity: 'error', code: 'missing_msh' });
    return { format: 'hl7', sender: '', results, issues };
  }

  const fieldSep = segments[0][3];
  const msh = segments[0].split(fieldSep);
  const component = (msh[1] ?? '^~\\&')[0] ?? '^';
  const sender = (msh[2] ?? '').split(component)[0];
  const messageType = (msh[8] ?? '').split(component).slice(0, 2).join('^');
  if (messageType !== 'ORU^R01') issues.push({ line: 1, severity: 'warning', code: 'not_oru', detail: messageType });

  let patientId = '';
  let patientName = '';
  let specimenId = '';

  segments.forEach((segment, idx) => {
    const lineNo = idx + 1;
    const f = segment.split(fieldSep);
    switch (f[0]) {
      case 'PID':
        patientId = (f[3] ?? '').split(component)[0];
        patientName = (f[5] ?? '').split(component).filter(Boolean).join(', ');
        break;
      case 'OBR':
        specimenId = (f[3] || f[2] || '').split(component)[0];
        if (!specimenId) issues.push({ line: lineNo, severity: 'error', code: 'no_specimen' });
        break;
      case 'OBX': {
        if (!specimenId) {
          issues.push({ line: lineNo, severity: 'error', code: 'result_before_order' });
          break;
        }
        const [code = '', , system = ''] = (f[3] ?? '').split(component);
        const isLoinc = system === 'LN';
        const testCode = isLoinc ? (localCodeForLoinc(code) ?? code) : code;
        if (!testCode) issues.push({ line: lineNo, severity: 'warning', code: 'no_test_code' });
        const rawValue = f[5] ?? '';
        const value = parseNumeric(rawValue);
        if (value === null) issues.push({ line: lineNo, severity: 'warning', code: 'non_numeric', detail: rawValue });
        results.push({
          specimenId,
          patientId,
          patientName,
          testCode,
          loinc: isLoinc ? code : loincFor(code),
          rawValue,
          value,
          units: (f[6] ?? '').split(component)[0],
          referenceRange: f[7] ?? '',
          flag: f[8] ?? '',
          status: f[11] ?? '',
          completedAt: parseTimestamp(f[14] ?? ''),
        });
        break;
      }
      default:
        break; // MSH ya procesado; ORC, NTE, etc. no se usan en esta demo
    }
  });

  return { format: 'hl7', sender, results, issues };
}
```

`src/lib/lis/parse.ts`:

```ts
import { parseAstm } from './astm';
import { parseHl7 } from './hl7';
import type { ParseOutcome } from './types';

export function parseMessage(raw: string): ParseOutcome {
  return raw.trimStart().startsWith('MSH') ? parseHl7(raw) : parseAstm(raw);
}
```

- [ ] **Step 4: Verificar que pasa y commit**

Run: `npx vitest run src/lib/lis`
Esperado: `6 passed`.

```bash
git add src/lib/lis
git commit -m "feat: parser HL7 v2 ORU^R01 y detección automática de formato

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 15: Audit trail encadenado por hash

**Files:**
- Create: `src/lib/lims/audit.ts`
- Test: `src/lib/lims/audit.test.ts`

- [ ] **Step 1: Test que falla**

`src/lib/lims/audit.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { appendAudit, GENESIS_HASH, verifyChain, type AuditEntry } from './audit';

async function threeEntries(): Promise<AuditEntry[]> {
  let log: AuditEntry[] = [];
  log = await appendAudit(log, { at: '2026-09-29T08:00:00', actor: 'u1', action: 'sample.registered', entity: 'sample', entityId: 'M-1', after: { status: 'received' } });
  log = await appendAudit(log, { at: '2026-09-29T08:05:00', actor: 'u1', action: 'result.imported', entity: 'result', entityId: 'M-1:GLU', after: { value: 112 } });
  log = await appendAudit(log, { at: '2026-09-29T08:10:00', actor: 'u2', action: 'signature.reviewed', entity: 'sample', entityId: 'M-1', reason: 'ok' });
  return log;
}

describe('audit trail', () => {
  it('[CUS-URS-01] cada registro guarda el hash del anterior (cadena desde el génesis)', async () => {
    const log = await threeEntries();
    expect(log.map((e) => e.seq)).toEqual([1, 2, 3]);
    expect(log[0].prevHash).toBe(GENESIS_HASH);
    expect(log[1].prevHash).toBe(log[0].hash);
    expect(log[2].prevHash).toBe(log[1].hash);
    expect(await verifyChain(log)).toEqual({ valid: true });
  });

  it('[CUS-URS-02] detecta la alteración de un registro', async () => {
    const log = await threeEntries();
    const tampered = log.map((e) => (e.seq === 2 ? { ...e, after: { value: 99 } } : e));
    expect(await verifyChain(tampered)).toEqual({ valid: false, brokenAt: 2 });
  });

  it('[CUS-URS-03] detecta el borrado de un registro', async () => {
    const log = await threeEntries();
    expect(await verifyChain([log[0], log[2]])).toEqual({ valid: false, brokenAt: 3 });
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `npx vitest run src/lib/lims/audit.test.ts`
Esperado: FAIL.

- [ ] **Step 3: Implementación**

`src/lib/lims/audit.ts`:

```ts
import { canonicalJson, sha256Hex } from '@/lib/crypto';

export interface AuditInput {
  at: string;
  actor: string;
  action: string;
  entity: string;
  entityId: string;
  reason?: string;
  before?: unknown;
  after?: unknown;
}

export interface AuditEntry extends AuditInput {
  seq: number;
  prevHash: string;
  hash: string;
}

export const GENESIS_HASH = '0'.repeat(64);

function hashOf(entry: Omit<AuditEntry, 'hash'>): Promise<string> {
  return sha256Hex(canonicalJson(entry));
}

// Solo-agregado: devuelve un log nuevo con el registro encadenado al final.
export async function appendAudit(log: AuditEntry[], input: AuditInput): Promise<AuditEntry[]> {
  const last = log[log.length - 1];
  const base = { ...input, seq: (last?.seq ?? 0) + 1, prevHash: last?.hash ?? GENESIS_HASH };
  return [...log, { ...base, hash: await hashOf(base) }];
}

export type ChainCheck = { valid: true } | { valid: false; brokenAt: number };

export async function verifyChain(log: AuditEntry[]): Promise<ChainCheck> {
  let prev = GENESIS_HASH;
  for (const entry of log) {
    const { hash, ...rest } = entry;
    if (entry.prevHash !== prev || (await hashOf(rest)) !== hash) return { valid: false, brokenAt: entry.seq };
    prev = hash;
  }
  return { valid: true };
}
```

- [ ] **Step 4: Verificar que pasa y commit**

Run: `npx vitest run src/lib/lims/audit.test.ts`
Esperado: `3 passed`.

```bash
git add src/lib/lims/audit.ts src/lib/lims/audit.test.ts
git commit -m "feat: audit trail solo-agregado encadenado por SHA-256

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 16: Modelo LIMS, usuarios de demo, consultas de QC y regla de liberación

**Files:**
- Create: `src/lib/lims/model.ts`, `src/lib/lims/users.ts`, `src/lib/lims/qc.ts`, `src/lib/lims/release.ts`

La lógica de estas funciones se prueba en T17 y T18 con los datos semilla.

- [ ] **Step 1: Modelo de datos y errores de dominio**

`src/lib/lims/model.ts`:

```ts
import type { QcTarget } from '@/lib/science/westgard';
import type { AuditEntry } from './audit';

export type Role = 'analyst' | 'validator' | 'admin';
export type SampleStatus = 'received' | 'in_analysis' | 'reviewed' | 'released' | 'rejected';
export type SignatureMeaning = 'reviewed' | 'approved';

export interface Sample {
  id: string;
  patientId: string;
  patientName: string;
  matrix: string;
  status: SampleStatus;
  receivedAt: string;
  revision: number;
}

export interface ResultRow {
  id: string; // `${sampleId}:${testCode}`
  sampleId: string;
  testCode: string;
  loinc: string | null;
  value: number | null;
  rawValue: string;
  units: string;
  referenceRange: string;
  flag: string;
  runId: string; // '' si no hay corrida de control para el analito
  source: 'astm' | 'hl7' | 'manual';
  completedAt: string | null;
}

export interface QcRun {
  id: string;
  analyte: string;
  index: number;
  at: string;
  points: { level: string; value: number }[];
  correctiveAction?: string;
  createdBy: string;
}

export interface Signature {
  sampleId: string;
  revision: number;
  userId: string;
  userName: string;
  role: Role;
  meaning: SignatureMeaning;
  at: string;
  recordHash: string;
}

export interface LabState {
  version: 1;
  samples: Sample[];
  results: ResultRow[];
  qcRuns: QcRun[];
  qcTargets: QcTarget[];
  signatures: Signature[];
  audit: AuditEntry[];
}

export type LabErrorCode =
  | 'bad_password'
  | 'forbidden_role'
  | 'invalid_transition'
  | 'same_person'
  | 'release_blocked'
  | 'sample_not_found'
  | 'no_accepted_run'
  | 'no_results'
  | 'duplicate_sample'
  | 'invalid_run'
  | 'reason_required'
  | 'invalid_sample';

export class LabError extends Error {
  readonly code: LabErrorCode;
  readonly details: string[];

  constructor(code: LabErrorCode, details: string[] = []) {
    super(code);
    this.name = 'LabError';
    this.code = code;
    this.details = details;
  }
}
```

- [ ] **Step 2: Usuarios de demo**

`src/lib/lims/users.ts`:

```ts
import type { Role } from './model';

export interface DemoUser {
  id: string;
  name: string;
  role: Role;
  password: string;
}

// Contraseñas visibles a propósito: es una demo pública y la barra de demo las muestra.
// En producción: proveedor de identidad (SSO) y contraseñas con hash; ver supabase/migrations/0002_rls.sql.
export const DEMO_USERS: DemoUser[] = [
  { id: 'u-analista', name: 'M. Gómez', role: 'analyst', password: 'analista123' },
  { id: 'u-validador', name: 'L. Herrera', role: 'validator', password: 'validador123' },
  { id: 'u-admin', name: 'A. N. Páez', role: 'admin', password: 'admin123' },
];

export function findUser(id: string): DemoUser | undefined {
  return DEMO_USERS.find((u) => u.id === id);
}
```

- [ ] **Step 3: Consultas de control de calidad**

`src/lib/lims/qc.ts`:

```ts
import { evaluateWestgard, runStatus, type QcPoint, type QcTarget, type RunStatus, type Violation } from '@/lib/science/westgard';
import type { LabState, QcRun } from './model';

export function analytesOf(state: LabState): string[] {
  return [...new Set(state.qcTargets.map((t) => t.analyte))];
}

export function targetsFor(state: LabState, analyte: string): QcTarget[] {
  return state.qcTargets.filter((t) => t.analyte === analyte);
}

export function runsFor(state: LabState, analyte: string): QcRun[] {
  return state.qcRuns.filter((r) => r.analyte === analyte).sort((a, b) => a.index - b.index);
}

export function latestRun(state: LabState, analyte: string): QcRun | undefined {
  const runs = runsFor(state, analyte);
  return runs[runs.length - 1];
}

export function qcPointsFor(state: LabState, analyte: string): QcPoint[] {
  return runsFor(state, analyte).flatMap((r) =>
    r.points.map((p) => ({ runId: r.id, runIndex: r.index, level: p.level, value: p.value })),
  );
}

export function violationsFor(state: LabState, analyte: string): Violation[] {
  return evaluateWestgard(qcPointsFor(state, analyte), targetsFor(state, analyte));
}

export function statusOfRun(state: LabState, runId: string): RunStatus | null {
  const run = state.qcRuns.find((r) => r.id === runId);
  if (!run) return null;
  return runStatus(violationsFor(state, run.analyte), runId);
}
```

- [ ] **Step 4: Regla de liberación**

`src/lib/lims/release.ts`:

```ts
import type { LabState } from './model';
import { statusOfRun } from './qc';

export interface ReleaseCheck {
  ok: boolean;
  hasResults: boolean;
  blockingRuns: string[];
  missingQc: string[];
}

// Un resultado es liberable solo si su corrida de control existe y no está rechazada.
export function checkRelease(state: LabState, sampleId: string): ReleaseCheck {
  const results = state.results.filter((r) => r.sampleId === sampleId);
  const blocking = new Set<string>();
  const missing = new Set<string>();
  for (const r of results) {
    const status = r.runId ? statusOfRun(state, r.runId) : null;
    if (status === null) missing.add(r.testCode);
    else if (status === 'reject') blocking.add(r.runId);
  }
  return {
    ok: results.length > 0 && blocking.size === 0 && missing.size === 0,
    hasResults: results.length > 0,
    blockingRuns: [...blocking],
    missingQc: [...missing],
  };
}
```

- [ ] **Step 5: Verificar tipos y commit**

Run: `npx tsc --noEmit`
Esperado: sin errores.

```bash
git add src/lib/lims
git commit -m "feat: modelo LIMS, usuarios de demo, consultas QC y regla de liberación

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 17: Datos semilla (historial de control de calidad)

**Files:**
- Create: `src/lib/lims/seed.ts`
- Test: `src/lib/lims/seed.test.ts`

- [ ] **Step 1: Test que falla**

`src/lib/lims/seed.test.ts`:

```ts
import { expect, it } from 'vitest';
import { statusOfRun, violationsFor } from './qc';
import { buildSeedState } from './seed';

it('[QC-URS-11] semilla: 20 corridas en control; GLU-R021 rechazada por 2-2s; CHOL-R021 aceptada', async () => {
  const s = await buildSeedState();
  expect(s.qcRuns).toHaveLength(42);
  for (const analyte of ['GLU', 'CHOL']) {
    expect(violationsFor(s, analyte).filter((v) => v.runId !== `${analyte}-R021`)).toEqual([]);
  }
  expect(statusOfRun(s, 'GLU-R021')).toBe('reject');
  expect(violationsFor(s, 'GLU').map((v) => v.rule).sort()).toEqual(['1-2s', '1-2s', '2-2s']);
  expect(statusOfRun(s, 'CHOL-R021')).toBe('accept');
  expect(s.audit).toHaveLength(1);
  expect(s.samples).toEqual([]);
});
```

- [ ] **Step 2: Verificar que falla**

Run: `npx vitest run src/lib/lims/seed.test.ts`
Esperado: FAIL.

- [ ] **Step 3: Implementación**

`src/lib/lims/seed.ts`:

```ts
import type { QcTarget } from '@/lib/science/westgard';
import { appendAudit } from './audit';
import type { LabState, QcRun } from './model';

// Puntajes z diseñados para 20 corridas en control (sin violar ninguna regla de Westgard).
const Z_A = [0.3, -0.8, 1.1, -0.4, 0.6, -1.2, 0.2, 0.9, -0.5, -0.1, 1.4, -0.9, 0.4, -0.3, 0.7, -1.0, 0.1, 0.5, -0.6, 0.8];
const Z_B = [-0.2, 0.7, -1.1, 0.4, -0.6, 0.9, -0.3, 0.2, 1.2, -0.8, 0.5, -0.4, -1.3, 0.6, 0.1, -0.7, 0.9, -0.2, 0.3, -0.5];

export const SEED_TARGETS: QcTarget[] = [
  { analyte: 'GLU', level: 'N1', mean: 95, sd: 2.5 },
  { analyte: 'GLU', level: 'N2', mean: 250, sd: 6 },
  { analyte: 'CHOL', level: 'N1', mean: 150, sd: 4 },
  { analyte: 'CHOL', level: 'N2', mean: 240, sd: 6 },
];

const round2 = (v: number) => Math.round(v * 100) / 100;

function runsOf(analyte: string, zN1: number[], zN2: number[], today: [number, number]): QcRun[] {
  const t1 = SEED_TARGETS.find((t) => t.analyte === analyte && t.level === 'N1');
  const t2 = SEED_TARGETS.find((t) => t.analyte === analyte && t.level === 'N2');
  if (!t1 || !t2) throw new Error(`seed: missing targets for ${analyte}`);
  const rows: [number, number][] = [...zN1.map((z, i): [number, number] => [z, zN2[i]]), today];
  return rows.map(([a, b], i) => {
    const index = i + 1;
    const day = String(index === rows.length ? 29 : index).padStart(2, '0');
    return {
      id: `${analyte}-R${String(index).padStart(3, '0')}`,
      analyte,
      index,
      at: `2026-09-${day}T07:30:00`,
      points: [
        { level: 'N1', value: round2(t1.mean + a * t1.sd) },
        { level: 'N2', value: round2(t2.mean + b * t2.sd) },
      ],
      createdBy: 'u-analista',
    };
  });
}

// La corrida de hoy de glucosa (R021) sale +2,4 DE y +2,33 DE: 2-2s entre niveles → rechazo.
export async function buildSeedState(at = '2026-09-29T07:00:00'): Promise<LabState> {
  const qcRuns = [...runsOf('GLU', Z_A, Z_B, [2.4, 2.3334]), ...runsOf('CHOL', Z_B, Z_A, [0.5, -0.4])];
  const audit = await appendAudit([], {
    at,
    actor: 'system',
    action: 'seed.loaded',
    entity: 'system',
    entityId: 'seed',
    after: { qcRuns: qcRuns.length, qcTargets: SEED_TARGETS.length },
  });
  return { version: 1, samples: [], results: [], qcRuns, qcTargets: SEED_TARGETS, signatures: [], audit };
}
```

- [ ] **Step 4: Verificar que pasa y commit**

Run: `npx vitest run src/lib/lims/seed.test.ts`
Esperado: `1 passed`.

```bash
git add src/lib/lims/seed.ts src/lib/lims/seed.test.ts
git commit -m "feat: datos semilla de control de calidad con corrida rechazada de ejemplo

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 18: Acciones del LIMS (importar, corridas, repetir, firmar, IA)

**Files:**
- Create: `src/lib/lims/actions.ts`
- Test: `src/lib/lims/actions.test.ts`

- [ ] **Step 1: Test que falla**

`src/lib/lims/actions.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { parseAstm } from '@/lib/lis/astm';
import { ASTM_EXAMPLE } from '@/lib/lis/examples';
import { addQcRun, importResults, recordAiDraft, registerSample, rerunSample, signSample } from './actions';
import { verifyChain } from './audit';
import type { LabState } from './model';
import { buildSeedState } from './seed';
import { findUser } from './users';

const analyst = findUser('u-analista')!;
const validator = findUser('u-validador')!;
const AT = '2026-09-29T09:00:00';
const ID = 'M-2026-0101';

async function imported(): Promise<LabState> {
  const seed = await buildSeedState();
  return importResults(seed, parseAstm(ASTM_EXAMPLE).results, 'astm', analyst, AT);
}

describe('acciones LIMS', () => {
  it('[CUS-URS-04] importar resultados registra muestras, asigna la última corrida y audita', async () => {
    const s = await imported();
    expect(s.samples.map((x) => x.id)).toEqual(['M-2026-0101', 'M-2026-0102']);
    expect(s.samples[0]).toMatchObject({ status: 'in_analysis', revision: 1 });
    expect(s.results.find((r) => r.id === `${ID}:GLU`)).toMatchObject({ runId: 'GLU-R021', value: 112, rawValue: '112' });
    expect(await verifyChain(s.audit)).toEqual({ valid: true });
    await expect(
      registerSample(s, { id: ID, patientId: 'X', patientName: 'X', matrix: 'suero' }, analyst, AT),
    ).rejects.toMatchObject({ code: 'duplicate_sample' });
  });

  it('[CUS-URS-05] la firma exige re-autenticación', async () => {
    const s = await imported();
    await expect(signSample(s, ID, 'reviewed', analyst.id, 'mala', AT)).rejects.toMatchObject({ code: 'bad_password' });
  });

  it('[CUS-URS-06] solo el rol validador puede aprobar', async () => {
    let s = await imported();
    s = await signSample(s, ID, 'reviewed', analyst.id, analyst.password, AT);
    await expect(signSample(s, ID, 'approved', analyst.id, analyst.password, AT)).rejects.toMatchObject({
      code: 'forbidden_role',
    });
  });

  it('[CUS-URS-07] segregación de funciones: quien revisó no aprueba la misma revisión', async () => {
    let s = await imported();
    s = await signSample(s, ID, 'reviewed', validator.id, validator.password, AT);
    await expect(signSample(s, ID, 'approved', validator.id, validator.password, AT)).rejects.toMatchObject({
      code: 'same_person',
    });
  });

  it('[CUS-URS-08] la liberación se bloquea si la corrida de control está rechazada', async () => {
    let s = await imported();
    s = await signSample(s, ID, 'reviewed', analyst.id, analyst.password, AT);
    await expect(signSample(s, ID, 'approved', validator.id, validator.password, AT)).rejects.toMatchObject({
      code: 'release_blocked',
      details: ['GLU-R021'],
    });
  });

  it('[CUS-URS-09] flujo completo: acción correctiva, repetición, revisión y aprobación', async () => {
    let s = await imported();
    s = await addQcRun(
      s,
      { analyte: 'GLU', points: [{ level: 'N1', value: 95.5 }, { level: 'N2', value: 251 }], correctiveAction: 'Recalibración' },
      analyst,
      AT,
    );
    expect(s.qcRuns.at(-1)?.id).toBe('GLU-R022');
    s = await rerunSample(s, ID, 'Repetición tras recalibración', analyst, AT);
    const sample = () => s.samples.find((x) => x.id === ID)!;
    expect(sample()).toMatchObject({ status: 'in_analysis', revision: 2 });
    expect(s.results.find((r) => r.id === `${ID}:GLU`)?.runId).toBe('GLU-R022');
    expect(s.results.find((r) => r.id === `${ID}:CHOL`)?.runId).toBe('CHOL-R021');
    s = await signSample(s, ID, 'reviewed', analyst.id, analyst.password, AT);
    s = await signSample(s, ID, 'approved', validator.id, validator.password, AT);
    expect(sample().status).toBe('released');
    expect(s.signatures.filter((g) => g.revision === 2).map((g) => g.meaning)).toEqual(['reviewed', 'approved']);
    expect(await verifyChain(s.audit)).toEqual({ valid: true });
  });

  it('[CUS-URS-10] tras una corrida rechazada, la siguiente exige acción correctiva; valores inválidos se rechazan', async () => {
    const s = await imported();
    await expect(
      addQcRun(s, { analyte: 'GLU', points: [{ level: 'N1', value: 95 }, { level: 'N2', value: 250 }] }, analyst, AT),
    ).rejects.toMatchObject({ code: 'reason_required' });
    await expect(
      addQcRun(
        s,
        { analyte: 'GLU', points: [{ level: 'N1', value: Number.NaN }, { level: 'N2', value: 250 }], correctiveAction: 'x' },
        analyst,
        AT,
      ),
    ).rejects.toMatchObject({ code: 'invalid_run' });
  });

  it('[CUS-URS-11] la firma queda ligada al contenido; la IA solo se registra como borrador aprobado', async () => {
    let s = await imported();
    s = await signSample(s, ID, 'reviewed', analyst.id, analyst.password, AT);
    expect(s.signatures[0].recordHash).toMatch(/^[0-9a-f]{64}$/);
    s = await recordAiDraft(
      s,
      { task: 'explain_violation', model: 'offline-rules', promptHash: 'a'.repeat(64), outputHash: 'b'.repeat(64), entity: 'qc_run', entityId: 'GLU-R021' },
      validator,
      AT,
    );
    expect(s.audit.at(-1)).toMatchObject({ action: 'ai.draft_approved', actor: 'u-validador', entityId: 'GLU-R021' });
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `npx vitest run src/lib/lims/actions.test.ts`
Esperado: FAIL.

- [ ] **Step 3: Implementación**

`src/lib/lims/actions.ts`:

```ts
import { canonicalJson, sha256Hex } from '@/lib/crypto';
import type { ParsedResult } from '@/lib/lis/types';
import { appendAudit } from './audit';
import { LabError, type LabState, type ResultRow, type Sample, type SampleStatus, type Signature, type SignatureMeaning } from './model';
import { latestRun, runsFor, statusOfRun, targetsFor } from './qc';
import { checkRelease } from './release';
import { findUser, type DemoUser } from './users';

function getSample(state: LabState, id: string): Sample {
  const sample = state.samples.find((s) => s.id === id);
  if (!sample) throw new LabError('sample_not_found', [id]);
  return sample;
}

async function transition(
  state: LabState,
  sample: Sample,
  to: SampleStatus,
  actor: DemoUser,
  at: string,
  reason: string,
  bumpRevision = false,
): Promise<LabState> {
  const updated: Sample = { ...sample, status: to, revision: bumpRevision ? sample.revision + 1 : sample.revision };
  return {
    ...state,
    samples: state.samples.map((s) => (s.id === sample.id ? updated : s)),
    audit: await appendAudit(state.audit, {
      at,
      actor: actor.id,
      action: 'sample.status',
      entity: 'sample',
      entityId: sample.id,
      reason,
      before: { status: sample.status, revision: sample.revision },
      after: { status: updated.status, revision: updated.revision },
    }),
  };
}

export async function registerSample(
  state: LabState,
  input: { id: string; patientId: string; patientName: string; matrix: string },
  actor: DemoUser,
  at: string,
): Promise<LabState> {
  const id = input.id.trim();
  if (!id || !input.patientId.trim() || !input.patientName.trim()) throw new LabError('invalid_sample');
  if (state.samples.some((s) => s.id === id)) throw new LabError('duplicate_sample', [id]);
  const sample: Sample = { ...input, id, status: 'received', receivedAt: at, revision: 1 };
  return {
    ...state,
    samples: [...state.samples, sample],
    audit: await appendAudit(state.audit, { at, actor: actor.id, action: 'sample.registered', entity: 'sample', entityId: id, after: sample }),
  };
}

export async function importResults(
  state: LabState,
  parsed: ParsedResult[],
  source: 'astm' | 'hl7',
  actor: DemoUser,
  at: string,
): Promise<LabState> {
  let next = state;
  for (const p of parsed) {
    if (!next.samples.some((s) => s.id === p.specimenId)) {
      next = await registerSample(
        next,
        { id: p.specimenId, patientId: p.patientId || '—', patientName: p.patientName || '—', matrix: 'suero' },
        actor,
        at,
      );
    }
    const sample = getSample(next, p.specimenId);
    if (sample.status === 'released' || sample.status === 'rejected') throw new LabError('invalid_transition', [sample.id]);

    const row: ResultRow = {
      id: `${p.specimenId}:${p.testCode}`,
      sampleId: p.specimenId,
      testCode: p.testCode,
      loinc: p.loinc,
      value: p.value,
      rawValue: p.rawValue,
      units: p.units,
      referenceRange: p.referenceRange,
      flag: p.flag,
      runId: latestRun(next, p.testCode)?.id ?? '',
      source,
      completedAt: p.completedAt,
    };
    const before = next.results.find((r) => r.id === row.id);
    next = {
      ...next,
      results: before ? next.results.map((r) => (r.id === row.id ? row : r)) : [...next.results, row],
      audit: await appendAudit(next.audit, {
        at,
        actor: actor.id,
        action: before ? 'result.updated' : 'result.imported',
        entity: 'result',
        entityId: row.id,
        before,
        after: row,
      }),
    };

    const current = getSample(next, p.specimenId);
    if (current.status === 'received') next = await transition(next, current, 'in_analysis', actor, at, `results imported (${source})`);
    else if (current.status === 'reviewed') next = await transition(next, current, 'in_analysis', actor, at, 'results changed after review', true);
  }
  return next;
}

export async function addQcRun(
  state: LabState,
  input: { analyte: string; points: { level: string; value: number }[]; correctiveAction?: string },
  actor: DemoUser,
  at: string,
): Promise<LabState> {
  const targets = targetsFor(state, input.analyte);
  const valid =
    targets.length > 0 &&
    input.points.length === targets.length &&
    input.points.every((p) => Number.isFinite(p.value) && targets.some((t) => t.level === p.level));
  if (!valid) throw new LabError('invalid_run');

  const previous = runsFor(state, input.analyte);
  const last = previous[previous.length - 1];
  const corrective = input.correctiveAction?.trim() || undefined;
  if (last && statusOfRun(state, last.id) === 'reject' && !corrective) throw new LabError('reason_required', [last.id]);

  const index = (last?.index ?? 0) + 1;
  const run = {
    id: `${input.analyte}-R${String(index).padStart(3, '0')}`,
    analyte: input.analyte,
    index,
    at,
    points: input.points,
    correctiveAction: corrective,
    createdBy: actor.id,
  };
  return {
    ...state,
    qcRuns: [...state.qcRuns, run],
    audit: await appendAudit(state.audit, { at, actor: actor.id, action: 'qc.run_added', entity: 'qc_run', entityId: run.id, reason: corrective, after: run }),
  };
}

// Reasigna los resultados cuya corrida está rechazada (o no existe) a la última corrida aceptada del analito.
// En la demo se conservan los valores: representa una repetición con igual resultado.
export async function rerunSample(state: LabState, sampleId: string, reason: string, actor: DemoUser, at: string): Promise<LabState> {
  if (!reason.trim()) throw new LabError('reason_required');
  const sample = getSample(state, sampleId);
  if (sample.status === 'released' || sample.status === 'rejected') throw new LabError('invalid_transition', [sample.status]);

  let next = state;
  for (const r of next.results.filter((x) => x.sampleId === sampleId)) {
    const current = r.runId ? statusOfRun(next, r.runId) : null;
    if (current !== null && current !== 'reject') continue;
    const run = latestRun(next, r.testCode);
    const runState = run ? statusOfRun(next, run.id) : null;
    if (!run || runState === null || runState === 'reject') throw new LabError('no_accepted_run', [r.testCode]);
    const updated = { ...r, runId: run.id };
    next = {
      ...next,
      results: next.results.map((x) => (x.id === r.id ? updated : x)),
      audit: await appendAudit(next.audit, {
        at,
        actor: actor.id,
        action: 'result.rerun',
        entity: 'result',
        entityId: r.id,
        reason,
        before: { runId: r.runId },
        after: { runId: run.id },
      }),
    };
  }
  return transition(next, getSample(next, sampleId), 'in_analysis', actor, at, reason, true);
}

export async function signSample(
  state: LabState,
  sampleId: string,
  meaning: SignatureMeaning,
  userId: string,
  password: string,
  at: string,
): Promise<LabState> {
  const user = findUser(userId);
  if (!user || user.password !== password) throw new LabError('bad_password');
  const sample = getSample(state, sampleId);
  const results = state.results.filter((r) => r.sampleId === sampleId);
  if (results.length === 0) throw new LabError('no_results', [sampleId]);

  if (meaning === 'reviewed') {
    if (user.role !== 'analyst' && user.role !== 'validator') throw new LabError('forbidden_role');
    if (sample.status !== 'in_analysis') throw new LabError('invalid_transition', [sample.status]);
  } else {
    if (user.role !== 'validator') throw new LabError('forbidden_role');
    if (sample.status !== 'reviewed') throw new LabError('invalid_transition', [sample.status]);
    const reviewer = state.signatures.find(
      (g) => g.sampleId === sampleId && g.revision === sample.revision && g.meaning === 'reviewed',
    );
    if (reviewer?.userId === user.id) throw new LabError('same_person');
    const check = checkRelease(state, sampleId);
    if (!check.ok) throw new LabError('release_blocked', [...check.blockingRuns, ...check.missingQc]);
  }

  const recordHash = await sha256Hex(canonicalJson({ sample: { id: sample.id, revision: sample.revision }, results }));
  const signature: Signature = {
    sampleId,
    revision: sample.revision,
    userId: user.id,
    userName: user.name,
    role: user.role,
    meaning,
    at,
    recordHash,
  };
  const next: LabState = {
    ...state,
    signatures: [...state.signatures, signature],
    audit: await appendAudit(state.audit, { at, actor: user.id, action: `signature.${meaning}`, entity: 'sample', entityId: sampleId, after: signature }),
  };
  return transition(next, sample, meaning === 'reviewed' ? 'reviewed' : 'released', user, at, `signature ${meaning}`);
}

export async function recordAiDraft(
  state: LabState,
  input: { task: string; model: string; promptHash: string; outputHash: string; entity: string; entityId: string },
  actor: DemoUser,
  at: string,
): Promise<LabState> {
  return {
    ...state,
    audit: await appendAudit(state.audit, {
      at,
      actor: actor.id,
      action: 'ai.draft_approved',
      entity: input.entity,
      entityId: input.entityId,
      after: { task: input.task, model: input.model, promptHash: input.promptHash, outputHash: input.outputHash },
    }),
  };
}
```

- [ ] **Step 4: Verificar que pasa**

Run: `npx vitest run src/lib/lims`
Esperado: todos pasan (`audit` 3, `seed` 1, `actions` 8).

- [ ] **Step 5: Commit**

```bash
git add src/lib/lims/actions.ts src/lib/lims/actions.test.ts
git commit -m "feat: acciones LIMS con firma electrónica, segregación de funciones y bloqueo por QC

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 19: Store del navegador, barra de demo y componentes de laboratorio

**Files:**
- Create: `src/lib/lims/storage.ts`, `src/components/lab/LabStoreProvider.tsx`, `src/components/lab/DemoBar.tsx`, `src/components/lab/StatusChip.tsx`
- Modify: `src/app/[lang]/layout.tsx`, `src/components/module/ModuleShell.tsx`

- [ ] **Step 1: Persistencia local tolerante a fallos**

`src/lib/lims/storage.ts`:

```ts
import type { LabState } from './model';

const STATE_KEY = 'veritas-lab-state-v1';
const USER_KEY = 'veritas-lab-user';

// localStorage puede no existir o fallar (modo privado, previews): la demo sigue en memoria.
export function loadState(): LabState | null {
  try {
    const raw = window.localStorage.getItem(STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LabState;
    return parsed.version === 1 ? parsed : null;
  } catch {
    return null;
  }
}

export function saveState(state: LabState): void {
  try {
    window.localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    // sin almacenamiento disponible
  }
}

export function clearState(): void {
  try {
    window.localStorage.removeItem(STATE_KEY);
  } catch {
    // sin almacenamiento disponible
  }
}

export function loadUserId(): string | null {
  try {
    return window.localStorage.getItem(USER_KEY);
  } catch {
    return null;
  }
}

export function saveUserId(id: string): void {
  try {
    window.localStorage.setItem(USER_KEY, id);
  } catch {
    // sin almacenamiento disponible
  }
}
```

- [ ] **Step 2: Provider del laboratorio**

`src/components/lab/LabStoreProvider.tsx`:

```tsx
'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import { LabError, type LabState } from '@/lib/lims/model';
import { buildSeedState } from '@/lib/lims/seed';
import { clearState, loadState, loadUserId, saveState, saveUserId } from '@/lib/lims/storage';
import { DEMO_USERS, findUser, type DemoUser } from '@/lib/lims/users';

type Action = (state: LabState, user: DemoUser, at: string) => Promise<LabState>;
export type RunResult = { ok: true } | { ok: false; error: LabError };

interface LabStore {
  state: LabState | null;
  user: DemoUser;
  setUserId: (id: string) => void;
  run: (action: Action) => Promise<RunResult>;
  reset: () => Promise<void>;
}

const LabContext = createContext<LabStore | null>(null);

// Fecha/hora UTC sin milisegundos, p. ej. "2026-09-29T12:34:56"
export function nowIso(): string {
  return new Date().toISOString().slice(0, 19);
}

export function formatLabError(dict: Dictionary, error: LabError): string {
  const base = dict.errors[error.code];
  return error.details.length > 0 ? `${base}: ${error.details.join(', ')}` : base;
}

export function LabStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LabState | null>(null);
  const [userId, setUserIdState] = useState<string>(DEMO_USERS[0].id);
  const stateRef = useRef<LabState | null>(null);
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const loaded = loadState() ?? (await buildSeedState());
      if (cancelled) return;
      stateRef.current = loaded;
      saveState(loaded);
      setState(loaded);
      const storedUser = loadUserId();
      if (storedUser && findUser(storedUser)) setUserIdState(storedUser);
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  const user = findUser(userId) ?? DEMO_USERS[0];

  const setUserId = useCallback((id: string) => {
    if (!findUser(id)) return;
    setUserIdState(id);
    saveUserId(id);
  }, []);

  // Las acciones se encolan para que dos clics rápidos no pisen el estado.
  const run = useCallback(
    (action: Action): Promise<RunResult> => {
      const task = queue.current.then(async (): Promise<RunResult> => {
        const current = stateRef.current;
        if (!current) return { ok: false, error: new LabError('invalid_transition') };
        try {
          const next = await action(current, user, nowIso());
          stateRef.current = next;
          saveState(next);
          setState(next);
          return { ok: true };
        } catch (error) {
          if (error instanceof LabError) return { ok: false, error };
          throw error;
        }
      });
      queue.current = task.catch(() => undefined);
      return task;
    },
    [user],
  );

  const reset = useCallback(async () => {
    clearState();
    const fresh = await buildSeedState();
    stateRef.current = fresh;
    saveState(fresh);
    setState(fresh);
  }, []);

  const value = useMemo(() => ({ state, user, setUserId, run, reset }), [state, user, setUserId, run, reset]);
  return <LabContext.Provider value={value}>{children}</LabContext.Provider>;
}

export function useLab(): LabStore {
  const ctx = useContext(LabContext);
  if (!ctx) throw new Error('useLab must be used inside LabStoreProvider');
  return ctx;
}
```

- [ ] **Step 3: Barra de demo (usuario, contraseña visible, reinicio)**

`src/components/lab/DemoBar.tsx`:

```tsx
'use client';

import { useState } from 'react';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import { DEMO_USERS } from '@/lib/lims/users';
import { btnSecondary } from '@/components/ui/styles';
import { useLab } from './LabStoreProvider';

export function DemoBar({ dict }: { dict: Dictionary }) {
  const { user, setUserId, reset } = useLab();
  const [confirming, setConfirming] = useState(false);
  return (
    <div
      data-testid="demo-bar"
      className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-warn/40 bg-warn/10 px-4 py-2 text-xs"
    >
      <span className="font-mono font-semibold tracking-widest text-warn">{dict.demoBar.env} · A. N. Páez</span>
      <label className="flex flex-wrap items-center gap-2">
        <span>{dict.demoBar.user}</span>
        <select
          data-testid="user-switcher"
          value={user.id}
          onChange={(e) => setUserId(e.target.value)}
          className="rounded border border-line bg-surface px-2 py-1"
        >
          {DEMO_USERS.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} — {dict.roles[u.role]}
            </option>
          ))}
        </select>
        <span className="text-muted">
          {dict.demoBar.passwordHint}: <code className="font-mono">{user.password}</code>
        </span>
      </label>
      {confirming ? (
        <span className="flex flex-wrap items-center gap-2">
          <span>{dict.demoBar.resetConfirm}</span>
          <button
            type="button"
            className={btnSecondary}
            onClick={async () => {
              await reset();
              setConfirming(false);
            }}
          >
            {dict.demoBar.yes}
          </button>
          <button type="button" className={btnSecondary} onClick={() => setConfirming(false)}>
            {dict.demoBar.no}
          </button>
        </span>
      ) : (
        <button type="button" data-testid="reset-data" className={btnSecondary} onClick={() => setConfirming(true)}>
          {dict.demoBar.reset}
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Chip de estado reutilizable**

`src/components/lab/StatusChip.tsx`:

```tsx
import type { ReactNode } from 'react';

const tones = {
  ok: 'border-ok/40 bg-ok/10 text-ok',
  warn: 'border-warn/40 bg-warn/10 text-warn',
  danger: 'border-danger/40 bg-danger/10 text-danger',
  neutral: 'border-line bg-bg text-muted',
} as const;

export type ChipTone = keyof typeof tones;

export function StatusChip({ tone, children, testId }: { tone: ChipTone; children: ReactNode; testId?: string }) {
  return (
    <span data-testid={testId} className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function runTone(status: 'accept' | 'warning' | 'reject' | null): ChipTone {
  if (status === 'accept') return 'ok';
  if (status === 'warning') return 'warn';
  if (status === 'reject') return 'danger';
  return 'neutral';
}
```

- [ ] **Step 5: Montar el provider en el layout y la barra en el shell**

En `src/app/[lang]/layout.tsx`:
- Agregar `import { LabStoreProvider } from '@/components/lab/LabStoreProvider';`
- Envolver el contenido del `<body>` así:

```tsx
      <body className="min-h-screen antialiased">
        <LabStoreProvider>
          <SiteHeader lang={lang} dict={dict} />
          <main>{children}</main>
          <SiteFooter dict={dict} />
        </LabStoreProvider>
      </body>
```

En `src/components/module/ModuleShell.tsx`:
- Agregar `import { DemoBar } from '@/components/lab/DemoBar';`
- Como primer hijo del `<div className="mx-auto max-w-6xl px-4 pb-8">`, insertar:

```tsx
      <DemoBar dict={dict} />
```

- [ ] **Step 6: Verificar y commit**

Run: `npx tsc --noEmit && npm run lint && npm run build:next`
Esperado: sin errores.

Si el lint marca `react-hooks/set-state-in-effect` en el provider, mover las llamadas `setState`/`setUserIdState` dentro de `init()` después de un `await Promise.resolve();` inicial. Así corren fuera del cuerpo síncrono del efecto.

```bash
git add -A
git commit -m "feat: store del laboratorio en el navegador y barra de demo con usuarios

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 20: Esquema Postgres con audit trail append-only (probado con PGlite)

**Files:**
- Create: `supabase/migrations/0001_schema.sql`, `supabase/migrations/0002_rls.sql`
- Test: `src/lib/db/schema.test.ts`

El esquema documenta cómo sería el backend real. **No se conecta a ningún servicio:** se prueba con PGlite (Postgres en WASM) dentro de Vitest.

- [ ] **Step 1: Test que falla**

`src/lib/db/schema.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeEach, describe, expect, it } from 'vitest';

const schema = readFileSync('supabase/migrations/0001_schema.sql', 'utf8');
let db: PGlite;

async function log(actor: string, action: string) {
  await db.query(
    `insert into audit_log (actor, action, entity, entity_id, payload) values ($1, $2, 'sample', 'M-1', $3)`,
    [actor, action, JSON.stringify({ action })],
  );
}

beforeEach(async () => {
  db = new PGlite();
  await db.exec(schema);
});

describe('esquema Postgres', () => {
  it('[DB-URS-01] el audit trail se encadena por SHA-256 dentro de la base', async () => {
    await log('u1', 'a');
    await log('u2', 'b');
    await log('u1', 'c');
    const { rows } = await db.query<{ prev_hash: string; hash: string }>('select prev_hash, hash from audit_log order by seq');
    expect(rows).toHaveLength(3);
    expect(rows[0].prev_hash).toBe('0'.repeat(64));
    expect(rows[1].prev_hash).toBe(rows[0].hash);
    expect(rows[2].prev_hash).toBe(rows[1].hash);
    expect(rows[0].hash).toMatch(/^[0-9a-f]{64}$/);
    const check = await db.query<{ broken: unknown }>('select audit_log_verify() as broken');
    expect(check.rows[0].broken).toBeNull();
  });

  it('[DB-URS-02] UPDATE, DELETE y TRUNCATE sobre el audit trail están prohibidos', async () => {
    await log('u1', 'a');
    await expect(db.exec(`update audit_log set actor = 'x'`)).rejects.toThrow(/append-only/);
    await expect(db.exec('delete from audit_log')).rejects.toThrow(/append-only/);
    await expect(db.exec('truncate audit_log')).rejects.toThrow(/append-only/);
  });

  it('[DB-URS-03] la verificación detecta una alteración hecha desactivando los triggers', async () => {
    await log('u1', 'a');
    await log('u2', 'b');
    await log('u1', 'c');
    await db.exec(`
      alter table audit_log disable trigger audit_log_no_update;
      update audit_log set actor = 'intruso' where seq = 2;
      alter table audit_log enable trigger audit_log_no_update;
    `);
    const check = await db.query<{ broken: unknown }>('select audit_log_verify() as broken');
    expect(Number(check.rows[0].broken)).toBe(2);
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `npx vitest run src/lib/db/schema.test.ts`
Esperado: FAIL con `ENOENT ... 0001_schema.sql`.

- [ ] **Step 3: Migración del esquema**

`supabase/migrations/0001_schema.sql`:

```sql
-- Veritas Lab Suite · esquema de referencia (Postgres ≥ 11, compatible con Supabase)
-- Diseñado considerando 21 CFR Part 11 §11.10(e) (audit trail) y ALCOA+. Demo: no validado.

create table if not exists samples (
  id           text primary key,
  patient_id   text not null,
  patient_name text not null,
  matrix       text not null,
  status       text not null check (status in ('received', 'in_analysis', 'reviewed', 'released', 'rejected')),
  revision     integer not null default 1,
  received_at  timestamptz not null default now()
);

create table if not exists qc_runs (
  id                text primary key,
  analyte           text not null,
  run_index         integer not null,
  run_at            timestamptz not null default now(),
  corrective_action text,
  created_by        text not null,
  unique (analyte, run_index)
);

create table if not exists qc_points (
  run_id text not null references qc_runs (id),
  level  text not null,
  value  double precision not null,
  primary key (run_id, level)
);

create table if not exists results (
  id              text primary key,
  sample_id       text not null references samples (id),
  test_code       text not null,
  loinc           text,
  value           double precision,
  raw_value       text not null,
  units           text not null,
  reference_range text not null default '',
  flag            text not null default '',
  run_id          text references qc_runs (id),
  source          text not null check (source in ('astm', 'hl7', 'manual')),
  completed_at    timestamptz
);

create table if not exists signatures (
  id          bigserial primary key,
  sample_id   text not null references samples (id),
  revision    integer not null,
  user_id     text not null,
  role        text not null,
  meaning     text not null check (meaning in ('reviewed', 'approved')),
  signed_at   timestamptz not null default now(),
  record_hash text not null
);

create table if not exists audit_log (
  seq        bigserial primary key,
  created_at timestamptz not null default now(),
  actor      text not null,
  action     text not null,
  entity     text not null,
  entity_id  text not null,
  payload    jsonb,
  prev_hash  text not null default '',
  hash       text not null default ''
);

-- Encadena cada registro con el anterior (hash SHA-256 nativo de Postgres).
create or replace function audit_log_row_hash(r audit_log) returns text
language sql stable as $$
  select encode(sha256(convert_to(
    r.prev_hash || '|' || r.seq::text || '|' || r.created_at::text || '|' || r.actor || '|' ||
    r.action || '|' || r.entity || '|' || r.entity_id || '|' || coalesce(r.payload::text, ''),
    'UTF8')), 'hex')
$$;

create or replace function audit_log_chain() returns trigger
language plpgsql as $$
declare
  last_hash text;
begin
  perform pg_advisory_xact_lock(424242); -- serializa inserciones concurrentes
  select hash into last_hash from audit_log order by seq desc limit 1;
  new.prev_hash := coalesce(last_hash, repeat('0', 64));
  new.hash := audit_log_row_hash(new);
  return new;
end
$$;

drop trigger if exists audit_log_chain on audit_log;
create trigger audit_log_chain before insert on audit_log
  for each row execute function audit_log_chain();

-- Solo-agregado: nada se modifica ni se borra.
create or replace function audit_log_immutable() returns trigger
language plpgsql as $$
begin
  raise exception 'audit_log es append-only: % no permitido', tg_op;
end
$$;

drop trigger if exists audit_log_no_update on audit_log;
create trigger audit_log_no_update before update or delete on audit_log
  for each row execute function audit_log_immutable();

drop trigger if exists audit_log_no_truncate on audit_log;
create trigger audit_log_no_truncate before truncate on audit_log
  for each statement execute function audit_log_immutable();

-- Devuelve el seq del primer registro alterado, o NULL si la cadena está íntegra.
create or replace function audit_log_verify() returns bigint
language plpgsql as $$
declare
  r audit_log;
  expected_prev text := repeat('0', 64);
begin
  for r in select * from audit_log order by seq loop
    if r.prev_hash <> expected_prev or audit_log_row_hash(r) <> r.hash then
      return r.seq;
    end if;
    expected_prev := r.hash;
  end loop;
  return null;
end
$$;
```

- [ ] **Step 4: Políticas RLS (solo documentación, específicas de Supabase)**

`supabase/migrations/0002_rls.sql`:

```sql
-- Solo para un proyecto Supabase (usa auth.jwt()). No se ejecuta en los tests con PGlite.
-- Rol del usuario en app_metadata.role: 'analyst' | 'validator' | 'admin'.

alter table samples    enable row level security;
alter table results    enable row level security;
alter table qc_runs    enable row level security;
alter table qc_points  enable row level security;
alter table signatures enable row level security;
alter table audit_log  enable row level security;

create policy "lectura para usuarios autenticados" on samples    for select to authenticated using (true);
create policy "lectura para usuarios autenticados" on results    for select to authenticated using (true);
create policy "lectura para usuarios autenticados" on qc_runs    for select to authenticated using (true);
create policy "lectura para usuarios autenticados" on qc_points  for select to authenticated using (true);
create policy "lectura para usuarios autenticados" on signatures for select to authenticated using (true);
create policy "lectura para usuarios autenticados" on audit_log  for select to authenticated using (true);

create policy "registro de muestras por personal del laboratorio" on samples for insert to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('analyst', 'validator', 'admin'));

-- Solo el validador puede dejar una muestra en estado 'released'.
create policy "solo validador libera" on samples for update to authenticated
  using (true)
  with check (status <> 'released' or (auth.jwt() -> 'app_metadata' ->> 'role') = 'validator');

-- La firma es del propio usuario; 'approved' solo para validadores.
create policy "firma propia y por rol" on signatures for insert to authenticated
  with check (
    user_id = auth.uid()::text
    and (meaning = 'reviewed' or (auth.jwt() -> 'app_metadata' ->> 'role') = 'validator')
  );

-- El audit trail solo acepta inserciones a nombre del propio usuario; no hay políticas de update/delete.
create policy "auditoría a nombre propio" on audit_log for insert to authenticated
  with check (actor = auth.uid()::text);
```

- [ ] **Step 5: Verificar que pasa y commit**

Run: `npx vitest run src/lib/db/schema.test.ts`
Esperado: `3 passed`.

```bash
git add supabase src/lib/db
git commit -m "feat: esquema Postgres con audit trail append-only encadenado, probado con PGlite

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```
