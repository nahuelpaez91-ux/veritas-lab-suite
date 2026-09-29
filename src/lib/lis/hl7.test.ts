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
