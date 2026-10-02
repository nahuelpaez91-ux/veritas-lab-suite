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
    if (p.patientId && sample.patientId !== '—' && p.patientId !== sample.patientId) {
      throw new LabError('patient_mismatch', [sample.id, p.patientId]);
    }

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
      status: p.status,
      runId: latestRun(next, p.testCode)?.id ?? '',
      source,
      completedAt: p.completedAt,
    };
    const before = next.results.find((r) => r.id === row.id);
    const correction = Boolean(before) && row.status === 'C';
    next = {
      ...next,
      results: before ? next.results.map((r) => (r.id === row.id ? row : r)) : [...next.results, row],
      audit: await appendAudit(next.audit, {
        at,
        actor: actor.id,
        action: before ? 'result.updated' : 'result.imported',
        entity: 'result',
        entityId: row.id,
        reason: correction ? 'result corrected' : undefined,
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
    points: input.points.map((p) => ({ ...p })),
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
        before: { runId: r.runId, value: r.value, rawValue: r.rawValue, completedAt: r.completedAt },
        after: { runId: run.id, value: updated.value, rawValue: updated.rawValue, completedAt: updated.completedAt },
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
    if (!check.ok) throw new LabError('release_blocked', [...check.blockingRuns, ...check.missingQc, ...check.notFinal]);
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
    audit: await appendAudit(state.audit, { at, actor: user.id, action: `signature.${meaning}`, entity: 'sample', entityId: sampleId, after: { ...signature } }),
  };
  return transition(next, sample, meaning === 'reviewed' ? 'reviewed' : 'released', user, at, `signature ${meaning}`);
}

export async function recordAuthFailure(state: LabState, sampleId: string, userId: string, at: string): Promise<LabState> {
  return {
    ...state,
    audit: await appendAudit(state.audit, {
      at,
      actor: userId,
      action: 'auth.failed',
      entity: 'sample',
      entityId: sampleId,
      reason: 'signature re-authentication failed',
    }),
  };
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
