import { describe, expect, it } from 'vitest';
import { parseAstm } from '@/lib/lis/astm';
import { ASTM_EXAMPLE } from '@/lib/lis/examples';
import { addQcRun, importResults, rerunSample, signSample } from './actions';
import { buildReportData } from './report';
import { buildSeedState } from './seed';
import { findUser } from './users';

const analyst = findUser('u-analista')!;
const validator = findUser('u-validador')!;
const AT = '2026-09-29T09:00:00';
const ID = 'M-2026-0101';

describe('informe', () => {
  it('[INF-URS-01] solo se genera para muestras liberadas, con firmas de la revisión vigente y estado QC', async () => {
    let s = await importResults(await buildSeedState(), parseAstm(ASTM_EXAMPLE).results, 'astm', analyst, AT);
    expect(() => buildReportData(s, ID, AT)).toThrow();
    s = await addQcRun(s, { analyte: 'GLU', points: [{ level: 'N1', value: 95.5 }, { level: 'N2', value: 251 }], correctiveAction: 'Recalibración' }, analyst, AT);
    s = await rerunSample(s, ID, 'Repetición', analyst, AT);
    s = await signSample(s, ID, 'reviewed', analyst.id, analyst.password, AT);
    s = await signSample(s, ID, 'approved', validator.id, validator.password, AT);
    const data = buildReportData(s, ID, AT);
    expect(data.revision).toBe(2);
    expect(data.results.map((r) => [r.testCode, r.runId, r.runStatus])).toEqual([
      ['GLU', 'GLU-R022', 'accept'],
      ['CHOL', 'CHOL-R021', 'accept'],
    ]);
    expect(data.signatures.map((g) => g.meaning)).toEqual(['reviewed', 'approved']);
    expect(data.recordHash).toMatch(/^[0-9a-f]{64}$/);
    expect(data.auditHead).toBe(s.audit.at(-1)?.hash);
  });
});
