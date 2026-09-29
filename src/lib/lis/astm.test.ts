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
