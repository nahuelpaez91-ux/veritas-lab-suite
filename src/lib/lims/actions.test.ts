import { describe, expect, it } from 'vitest';
import { parseAstm } from '@/lib/lis/astm';
import { ASTM_EXAMPLE } from '@/lib/lis/examples';
import { addQcRun, importResults, recordAiDraft, recordAuthFailure, registerSample, rerunSample, signSample } from './actions';
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

  it('[CUS-URS-12] un resultado de otro paciente no se asocia a la muestra', async () => {
    const s = await imported();
    const parsed = parseAstm(ASTM_EXAMPLE).results.map((r) => (r.specimenId === ID ? { ...r, patientId: 'PAC-9999' } : r));
    await expect(importResults(s, parsed, 'astm', analyst, AT)).rejects.toMatchObject({
      code: 'patient_mismatch',
      details: [ID, 'PAC-9999'],
    });
  });

  it('[CUS-URS-13] resultados no finales (P, X) bloquean la liberación', async () => {
    const rawNotFinal = [
      'H|\\^&|||cobas-demo^1.0|||||||P|1|20260929083000',
      'P|1|PAC-0001|||Pérez^Juana',
      'O|1|M-2026-0101||^^^GLU\\^^^CHOL|R||20260929080000',
      'R|1|^^^GLU|112|mg/dL|70 to 110|H||P||||20260929081500',
      'R|2|^^^CHOL|185|mg/dL|<200|N||F||||20260929081600',
      'L|1|N',
    ].join('\r');
    const seed = await buildSeedState();
    let s = await importResults(seed, parseAstm(rawNotFinal).results, 'astm', analyst, AT);
    s = await addQcRun(
      s,
      { analyte: 'GLU', points: [{ level: 'N1', value: 95.3 }, { level: 'N2', value: 249 }], correctiveAction: 'Recalibración' },
      analyst,
      AT,
    );
    s = await signSample(s, ID, 'reviewed', analyst.id, analyst.password, AT);
    await expect(signSample(s, ID, 'approved', validator.id, validator.password, AT)).rejects.toMatchObject({
      code: 'release_blocked',
      details: expect.arrayContaining(['GLU']),
    });
  });

  it('[CUS-URS-14] los intentos de firma fallidos quedan auditados', async () => {
    let s = await imported();
    s = await recordAuthFailure(s, ID, analyst.id, AT);
    expect(s.audit.at(-1)).toMatchObject({
      actor: analyst.id,
      action: 'auth.failed',
      entity: 'sample',
      entityId: ID,
      reason: 'signature re-authentication failed',
    });
    expect(await verifyChain(s.audit)).toEqual({ valid: true });
  });
});
