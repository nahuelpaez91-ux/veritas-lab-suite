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
  let expectedSeq = 1;
  const matchedStarts = new Set<number>();
  for (const m of raw.matchAll(FRAME_RE)) {
    frameNo++;
    matchedStarts.add(m.index);
    const [, fn, body, end, checksum] = m;
    const actualSeq = Number(fn);
    if (actualSeq !== expectedSeq) {
      issues.push({ line: frameNo, severity: 'warning', code: 'frame_sequence', detail: `${fn} ≠ ${expectedSeq}` });
    }
    expectedSeq = (actualSeq + 1) % 8;
    const expectedChecksum = astmChecksum(fn + body + end);
    if (expectedChecksum !== checksum.toUpperCase()) {
      issues.push({ line: frameNo, severity: 'error', code: 'bad_checksum', detail: `${checksum} ≠ ${expectedChecksum}` });
    } else {
      text += body; // ETB: el registro continúa en la trama siguiente; ETX: el cuerpo ya termina en CR
    }
  }
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === '\x02' && !matchedStarts.has(i)) {
      issues.push({ line: frameNo, severity: 'error', code: 'bad_frame' });
    }
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
        const testCode = (f[2] ?? '').split(component)[3] ?? '';
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
