export type RuleId = '1-2s' | '1-3s' | '2-2s' | 'R-4s' | '4-1s' | '10x';
export type RunStatus = 'accept' | 'warning' | 'reject';

export interface QcTarget {
  analyte: string;
  level: string;
  mean: number;
  sd: number;
}

export interface QcPoint {
  runId: string;
  runIndex: number;
  level: string;
  value: number;
}

export interface Violation {
  rule: RuleId;
  runId: string;
  levels: string[];
  severity: 'warning' | 'reject';
  scope: 'within-level' | 'across-levels';
}

interface ZPoint {
  runId: string;
  runIndex: number;
  level: string;
  z: number;
}

export function zScore(value: number, target: Pick<QcTarget, 'mean' | 'sd'>): number {
  if (!(target.sd > 0)) throw new Error('westgard: sd must be > 0');
  return (value - target.mean) / target.sd;
}

function allBeyond(zs: number[], limit: number): boolean {
  return zs.every((z) => z > limit) || zs.every((z) => z < -limit);
}

export function evaluateWestgard(points: QcPoint[], targets: QcTarget[]): Violation[] {
  for (const p of points) {
    if (!Number.isFinite(p.value)) throw new Error('westgard: non-finite control value');
  }
  const seenLevels = new Set<string>();
  for (const t of targets) {
    if (seenLevels.has(t.level)) throw new Error(`westgard: duplicate target for level ${t.level}`);
    seenLevels.add(t.level);
  }
  const targetByLevel = new Map(targets.map((t) => [t.level, t]));
  const zpoints: ZPoint[] = points.map((p) => {
    const target = targetByLevel.get(p.level);
    if (!target) throw new Error(`westgard: no target for level ${p.level}`);
    return { runId: p.runId, runIndex: p.runIndex, level: p.level, z: zScore(p.value, target) };
  });

  const out: Violation[] = [];
  const push = (v: Violation) => {
    const key = `${v.rule}|${v.runId}|${v.scope}|${v.levels.join(',')}`;
    if (!out.some((o) => `${o.rule}|${o.runId}|${o.scope}|${o.levels.join(',')}` === key)) out.push(v);
  };

  // Reglas de un solo punto
  for (const p of zpoints) {
    if (Math.abs(p.z) > 3) push({ rule: '1-3s', runId: p.runId, levels: [p.level], severity: 'reject', scope: 'within-level' });
    else if (Math.abs(p.z) > 2) push({ rule: '1-2s', runId: p.runId, levels: [p.level], severity: 'warning', scope: 'within-level' });
  }

  // Reglas consecutivas dentro de cada nivel
  const levels = [...new Set(zpoints.map((p) => p.level))];
  for (const level of levels) {
    const seq = zpoints.filter((p) => p.level === level).sort((a, b) => a.runIndex - b.runIndex);
    for (let i = 0; i < seq.length; i++) {
      const window = (n: number) => (i + 1 >= n ? seq.slice(i + 1 - n, i + 1).map((p) => p.z) : null);
      const runId = seq[i].runId;
      const w2 = window(2);
      if (w2 && allBeyond(w2, 2)) push({ rule: '2-2s', runId, levels: [level], severity: 'reject', scope: 'within-level' });
      const w4 = window(4);
      if (w4 && allBeyond(w4, 1)) push({ rule: '4-1s', runId, levels: [level], severity: 'reject', scope: 'within-level' });
      const w10 = window(10);
      if (w10 && allBeyond(w10, 0)) push({ rule: '10x', runId, levels: [level], severity: 'reject', scope: 'within-level' });
    }
  }

  // Reglas entre niveles de la misma corrida
  const runIds = [...new Set(zpoints.map((p) => p.runId))];
  for (const runId of runIds) {
    const inRun = zpoints.filter((p) => p.runId === runId);
    if (inRun.length < 2) continue;
    const above = inRun.filter((p) => p.z > 2);
    const below = inRun.filter((p) => p.z < -2);
    if (above.length >= 2) push({ rule: '2-2s', runId, levels: above.map((p) => p.level).sort(), severity: 'reject', scope: 'across-levels' });
    if (below.length >= 2) push({ rule: '2-2s', runId, levels: below.map((p) => p.level).sort(), severity: 'reject', scope: 'across-levels' });
    if (above.length >= 1 && below.length >= 1) {
      push({ rule: 'R-4s', runId, levels: [...above, ...below].map((p) => p.level).sort(), severity: 'reject', scope: 'across-levels' });
    }
  }

  // Reglas 4-1s y 10x entre niveles (entre materiales): secuencia combinada
  // ordenada por corrida y luego por nivel, deslizando la ventana sobre todos
  // los puntos z sin importar el nivel.
  const combined = [...zpoints].sort((a, b) => a.runIndex - b.runIndex || a.level.localeCompare(b.level));
  for (let i = 0; i < combined.length; i++) {
    const window = (n: number) => (i + 1 >= n ? combined.slice(i + 1 - n, i + 1) : null);
    const runId = combined[i].runId;
    const w4 = window(4);
    if (w4 && allBeyond(w4.map((p) => p.z), 1)) {
      push({
        rule: '4-1s',
        runId,
        levels: [...new Set(w4.map((p) => p.level))].sort(),
        severity: 'reject',
        scope: 'across-levels',
      });
    }
    const w10 = window(10);
    if (w10 && allBeyond(w10.map((p) => p.z), 0)) {
      push({
        rule: '10x',
        runId,
        levels: [...new Set(w10.map((p) => p.level))].sort(),
        severity: 'reject',
        scope: 'across-levels',
      });
    }
  }

  return out;
}

export function runStatus(violations: Violation[], runId: string): RunStatus {
  const mine = violations.filter((v) => v.runId === runId);
  if (mine.some((v) => v.severity === 'reject')) return 'reject';
  if (mine.length > 0) return 'warning';
  return 'accept';
}

export function sigmaMetric(teaPercent: number, biasPercent: number, cvPercent: number): number {
  if (!(cvPercent > 0)) throw new Error('sigma: cv must be > 0');
  return (teaPercent - Math.abs(biasPercent)) / cvPercent;
}
