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
