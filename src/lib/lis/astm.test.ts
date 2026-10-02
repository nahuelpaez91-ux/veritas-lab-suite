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

  it('[ENL-URS-07] tramas con checksum inválido se descartan y se controla la secuencia', () => {
    const goodGlu = 'R|1|^^^GLU|90|mg/dL|70 to 110|N||F||||20260929081500';
    const goodChol = 'R|2|^^^CHOL|180|mg/dL|<200|N||F||||20260929081600';
    const corruptGlu = frame(4, goodGlu).replace(/[0-9A-F]{2}\r\n$/, '00\r\n');
    const raw = [
      frame(1, 'H|\\^&'),
      frame(2, 'P|1|PAC-9|||A^B'),
      frame(3, 'O|1|M-9||^^^GLU\\^^^CHOL'),
      corruptGlu,
      frame(1, goodChol), // número de trama fuera de secuencia (se esperaba 5)
    ].join('');
    const out = parseAstm(raw);
    expect(out.issues.map((i) => i.code)).toEqual(expect.arrayContaining(['bad_checksum', 'frame_sequence']));
    expect(out.results.map((r) => r.testCode)).toEqual(['CHOL']);
  });

  it('[ENL-URS-08] el código de prueba es el componente 4 de R.3', () => {
    const raw = ['H|\\^&', 'P|1|PAC-1|||A^B', 'O|1|M-1||^^^GLU', 'R|1|^^^GLU^1|100|mg/dL|70 to 110|N||F||||20260929081500'].join(
      '\r',
    );
    const out = parseAstm(raw);
    expect(out.results[0]).toMatchObject({ testCode: 'GLU', loinc: '2345-7' });
  });
});
