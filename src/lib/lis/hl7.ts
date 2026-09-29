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
