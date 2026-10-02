import { describe, expect, it } from 'vitest';
import { evaluateWestgard, runStatus, sigmaMetric, zScore, type QcPoint, type QcTarget } from './westgard';

const targets: QcTarget[] = [
  { analyte: 'GLU', level: 'N1', mean: 100, sd: 2 },
  { analyte: 'GLU', level: 'N2', mean: 250, sd: 5 },
];

// Cada fila es una corrida: [z del nivel N1, z del nivel N2]
function pointsFromZ(rows: [number, number][]): QcPoint[] {
  return rows.flatMap(([z1, z2], i) => [
    { runId: `R${i + 1}`, runIndex: i + 1, level: 'N1', value: 100 + z1 * 2 },
    { runId: `R${i + 1}`, runIndex: i + 1, level: 'N2', value: 250 + z2 * 5 },
  ]);
}

function rulesAt(points: QcPoint[], runId: string): string[] {
  return evaluateWestgard(points, targets)
    .filter((v) => v.runId === runId)
    .map((v) => v.rule)
    .sort();
}

describe('Westgard', () => {
  it('[QC-URS-01] calcula z = (x − media) / DE y rechaza DE ≤ 0', () => {
    expect(zScore(104, { mean: 100, sd: 2 })).toBe(2);
    expect(() => zScore(1, { mean: 0, sd: 0 })).toThrow();
  });

  it('[QC-URS-02] 1-2s solo genera advertencia, no rechazo', () => {
    const pts = pointsFromZ([[0.5, -0.3], [2.5, 0.2]]);
    expect(rulesAt(pts, 'R2')).toEqual(['1-2s']);
    expect(runStatus(evaluateWestgard(pts, targets), 'R2')).toBe('warning');
  });

  it('[QC-URS-03] 1-3s rechaza la corrida', () => {
    const pts = pointsFromZ([[0, 0], [-3.2, 0.1]]);
    expect(rulesAt(pts, 'R2')).toEqual(['1-3s']);
    expect(runStatus(evaluateWestgard(pts, targets), 'R2')).toBe('reject');
  });

  it('[QC-URS-04] 2-2s dentro de un nivel en corridas consecutivas', () => {
    const pts = pointsFromZ([[2.3, 0], [2.1, 0.4]]);
    expect(rulesAt(pts, 'R2')).toEqual(['1-2s', '2-2s']);
    const v = evaluateWestgard(pts, targets).find((x) => x.rule === '2-2s');
    expect(v?.scope).toBe('within-level');
    expect(runStatus(evaluateWestgard(pts, targets), 'R2')).toBe('reject');
  });

  it('[QC-URS-05] 2-2s entre niveles de la misma corrida', () => {
    const pts = pointsFromZ([[0, 0], [2.4, 2.2]]);
    expect(rulesAt(pts, 'R2')).toEqual(['1-2s', '1-2s', '2-2s']);
    const v = evaluateWestgard(pts, targets).find((x) => x.rule === '2-2s');
    expect(v?.scope).toBe('across-levels');
    expect(v?.levels).toEqual(['N1', 'N2']);
  });

  it('[QC-URS-06] R-4s cuando un nivel supera +2 DE y otro −2 DE en la misma corrida', () => {
    const pts = pointsFromZ([[0, 0], [2.5, -2.1]]);
    expect(rulesAt(pts, 'R2')).toEqual(['1-2s', '1-2s', 'R-4s']);
    expect(runStatus(evaluateWestgard(pts, targets), 'R2')).toBe('reject');
  });

  it('[QC-URS-07] 4-1s: cuatro resultados consecutivos del mismo lado de 1 DE', () => {
    const pts = pointsFromZ([[1.2, 0], [1.5, -0.2], [1.1, 0.3], [1.3, 0.1]]);
    expect(rulesAt(pts, 'R3')).toEqual([]);
    expect(rulesAt(pts, 'R4')).toEqual(['4-1s']);
  });

  it('[QC-URS-08] 10x: diez resultados consecutivos del mismo lado de la media', () => {
    const rows: [number, number][] = Array.from({ length: 10 }, (_, i) => [0.5, i % 2 === 0 ? 0.3 : -0.3]);
    const pts = pointsFromZ(rows);
    expect(rulesAt(pts, 'R9')).toEqual([]);
    expect(rulesAt(pts, 'R10')).toEqual(['10x']);
  });

  it('[QC-URS-09] datos dentro de control → corrida aceptada', () => {
    const pts = pointsFromZ([[0.3, -0.5], [-0.8, 0.9], [1.1, -1.2]]);
    expect(evaluateWestgard(pts, targets)).toEqual([]);
    expect(runStatus([], 'R3')).toBe('accept');
  });

  it('[QC-URS-10] métrica Sigma = (TEa − |sesgo|) / CV', () => {
    expect(sigmaMetric(10, -1, 1.5)).toBeCloseTo(6, 10);
    expect(() => sigmaMetric(10, 1, 0)).toThrow();
  });

  it('[QC-URS-12] valores no finitos y objetivos duplicados se rechazan', () => {
    const pts = pointsFromZ([[0, 0]]);
    pts[0].value = Number.NaN;
    expect(() => evaluateWestgard(pts, targets)).toThrow('westgard: non-finite control value');

    const dupTargets: QcTarget[] = [...targets, { analyte: 'GLU', level: 'N1', mean: 101, sd: 2 }];
    expect(() => evaluateWestgard(pointsFromZ([[0, 0]]), dupTargets)).toThrow(
      'westgard: duplicate target for level N1',
    );
  });

  it('[QC-URS-13] 4-1s y 10x entre niveles (entre materiales)', () => {
    const pts = pointsFromZ([[1.2, 1.3], [1.1, 1.5]]);
    const violations = evaluateWestgard(pts, targets);
    const acrossR2 = violations.filter((v) => v.runId === 'R2' && v.scope === 'across-levels');
    expect(acrossR2.map((v) => v.rule)).toContain('4-1s');

    const rows: [number, number][] = Array.from({ length: 5 }, () => [0.5, 0.5]);
    const pts2 = pointsFromZ(rows);
    const violations2 = evaluateWestgard(pts2, targets);
    const acrossR5 = violations2.filter((v) => v.runId === 'R5' && v.scope === 'across-levels');
    expect(acrossR5.map((v) => v.rule)).toContain('10x');
    const acrossR4 = violations2.filter((v) => v.runId === 'R4' && v.scope === 'across-levels');
    expect(acrossR4.map((v) => v.rule)).not.toContain('10x');
  });
});
