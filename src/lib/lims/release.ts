import type { LabState } from './model';
import { statusOfRun } from './qc';

export interface ReleaseCheck {
  ok: boolean;
  hasResults: boolean;
  blockingRuns: string[];
  missingQc: string[];
  notFinal: string[];
}

// Un resultado es liberable solo si su corrida de control existe, no está rechazada y su estado es final (F o C).
export function checkRelease(state: LabState, sampleId: string): ReleaseCheck {
  const results = state.results.filter((r) => r.sampleId === sampleId);
  const blocking = new Set<string>();
  const missing = new Set<string>();
  const notFinal = new Set<string>();
  for (const r of results) {
    const status = r.runId ? statusOfRun(state, r.runId) : null;
    if (status === null) missing.add(r.testCode);
    else if (status === 'reject') blocking.add(r.runId);
    if (r.status !== 'F' && r.status !== 'C') notFinal.add(r.testCode);
  }
  return {
    ok: results.length > 0 && blocking.size === 0 && missing.size === 0 && notFinal.size === 0,
    hasResults: results.length > 0,
    blockingRuns: [...blocking],
    missingQc: [...missing],
    notFinal: [...notFinal],
  };
}
