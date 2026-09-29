import { evaluateWestgard, runStatus, type QcPoint, type QcTarget, type RunStatus, type Violation } from '@/lib/science/westgard';
import type { LabState, QcRun } from './model';

export function analytesOf(state: LabState): string[] {
  return [...new Set(state.qcTargets.map((t) => t.analyte))];
}

export function targetsFor(state: LabState, analyte: string): QcTarget[] {
  return state.qcTargets.filter((t) => t.analyte === analyte);
}

export function runsFor(state: LabState, analyte: string): QcRun[] {
  return state.qcRuns.filter((r) => r.analyte === analyte).sort((a, b) => a.index - b.index);
}

export function latestRun(state: LabState, analyte: string): QcRun | undefined {
  const runs = runsFor(state, analyte);
  return runs[runs.length - 1];
}

export function qcPointsFor(state: LabState, analyte: string): QcPoint[] {
  return runsFor(state, analyte).flatMap((r) =>
    r.points.map((p) => ({ runId: r.id, runIndex: r.index, level: p.level, value: p.value })),
  );
}

export function violationsFor(state: LabState, analyte: string): Violation[] {
  return evaluateWestgard(qcPointsFor(state, analyte), targetsFor(state, analyte));
}

export function statusOfRun(state: LabState, runId: string): RunStatus | null {
  const run = state.qcRuns.find((r) => r.id === runId);
  if (!run) return null;
  return runStatus(violationsFor(state, run.analyte), runId);
}
