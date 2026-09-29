# Fase 1 · Parte 2: Lógica científica (T7–T11)

> Parte del plan `2026-09-29-fase1-veritas-lab-suite.md`.
>
> Todo este código es **TypeScript puro**, sin React. Se escribe con TDD: primero el test, verlo fallar, después implementar.

---

### Task 7: Estadística básica y t de Student

**Files:**
- Create: `src/lib/science/stats.ts`
- Test: `src/lib/science/stats.test.ts`

- [ ] **Step 1: Test que falla**

`src/lib/science/stats.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { cvPercent, mean, quantile, sampleSd, tQuantile975 } from './stats';

describe('estadística', () => {
  it('[STA-URS-01] media, desvío estándar muestral (n−1) y CV %', () => {
    const xs = [2, 4, 4, 4, 5, 5, 7, 9];
    expect(mean(xs)).toBe(5);
    expect(sampleSd(xs)).toBeCloseTo(Math.sqrt(32 / 7), 12);
    expect(cvPercent(xs)).toBeCloseTo((Math.sqrt(32 / 7) / 5) * 100, 10);
    expect(() => mean([])).toThrow();
    expect(() => sampleSd([1])).toThrow();
  });

  it('[STA-URS-02] cuantil 0,975 de t de Student (tabla + interpolación en 1/gl)', () => {
    expect(tQuantile975(3)).toBeCloseTo(3.182, 3);
    expect(tQuantile975(30)).toBeCloseTo(2.042, 3);
    expect(tQuantile975(35)).toBeCloseTo(2.03, 2);
    expect(tQuantile975(1000)).toBeCloseTo(1.962, 3);
    expect(() => tQuantile975(0)).toThrow();
  });

  it('[STA-URS-03] cuantil empírico con interpolación lineal (tipo 7)', () => {
    expect(quantile([1, 2, 3, 4], 0.5)).toBe(2.5);
    expect(quantile([1, 2, 3, 4, 5], 0.25)).toBe(2);
    expect(quantile([7], 0.9)).toBe(7);
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `npx vitest run src/lib/science/stats.test.ts`
Esperado: FAIL con `Failed to resolve import "./stats"`.

- [ ] **Step 3: Implementación**

`src/lib/science/stats.ts`:

```ts
export function mean(xs: ArrayLike<number>): number {
  if (xs.length === 0) throw new Error('mean: empty array');
  let sum = 0;
  for (let i = 0; i < xs.length; i++) sum += xs[i];
  return sum / xs.length;
}

export function sampleSd(xs: ArrayLike<number>): number {
  if (xs.length < 2) throw new Error('sampleSd: at least 2 values are required');
  const m = mean(xs);
  let ss = 0;
  for (let i = 0; i < xs.length; i++) ss += (xs[i] - m) ** 2;
  return Math.sqrt(ss / (xs.length - 1));
}

export function cvPercent(xs: ArrayLike<number>): number {
  return (sampleSd(xs) / mean(xs)) * 100;
}

// Cuantil 0,975 de la t de Student (bilateral 95 %), tabla estándar.
const T975: [number, number][] = [
  [1, 12.706], [2, 4.303], [3, 3.182], [4, 2.776], [5, 2.571], [6, 2.447], [7, 2.365], [8, 2.306],
  [9, 2.262], [10, 2.228], [11, 2.201], [12, 2.179], [13, 2.16], [14, 2.145], [15, 2.131], [16, 2.12],
  [17, 2.11], [18, 2.101], [19, 2.093], [20, 2.086], [21, 2.08], [22, 2.074], [23, 2.069], [24, 2.064],
  [25, 2.06], [26, 2.056], [27, 2.052], [28, 2.048], [29, 2.045], [30, 2.042], [40, 2.021], [60, 2.0],
  [120, 1.98],
];

export function tQuantile975(df: number): number {
  if (!Number.isInteger(df) || df < 1) throw new Error('tQuantile975: df must be a positive integer');
  const exact = T975.find(([d]) => d === df);
  if (exact) return exact[1];
  if (df > 120) return 1.96 + (1.98 - 1.96) * (120 / df);
  const upper = T975.findIndex(([d]) => d > df);
  const [dA, tA] = T975[upper - 1];
  const [dB, tB] = T975[upper];
  const frac = (1 / df - 1 / dA) / (1 / dB - 1 / dA);
  return tA + (tB - tA) * frac;
}

// Cuantil empírico, interpolación lineal (Hyndman & Fan tipo 7). `sorted` debe venir ordenado ascendente.
export function quantile(sorted: ArrayLike<number>, p: number): number {
  if (sorted.length === 0) throw new Error('quantile: empty array');
  if (p < 0 || p > 1) throw new Error('quantile: p must be in [0, 1]');
  const h = (sorted.length - 1) * p;
  const lo = Math.floor(h);
  const hi = Math.min(lo + 1, sorted.length - 1);
  return sorted[lo] + (h - lo) * (sorted[hi] - sorted[lo]);
}
```

- [ ] **Step 4: Verificar que pasa**

Run: `npx vitest run src/lib/science/stats.test.ts`
Esperado: `3 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/science/stats.ts src/lib/science/stats.test.ts
git commit -m "feat: estadística básica y cuantiles t de Student

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: Multirreglas de Westgard y métrica Sigma

**Files:**
- Create: `src/lib/science/westgard.ts`
- Test: `src/lib/science/westgard.test.ts`

- [ ] **Step 1: Test que falla**

`src/lib/science/westgard.test.ts`:

```ts
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
});
```

- [ ] **Step 2: Verificar que falla**

Run: `npx vitest run src/lib/science/westgard.test.ts`
Esperado: FAIL, módulo inexistente.

- [ ] **Step 3: Implementación**

`src/lib/science/westgard.ts`:

```ts
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
```

- [ ] **Step 4: Verificar que pasa**

Run: `npx vitest run src/lib/science/westgard.test.ts`
Esperado: `10 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/science/westgard.ts src/lib/science/westgard.test.ts
git commit -m "feat: multirreglas de Westgard y métrica Sigma con un test por regla

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: Curvas de calibración verificadas contra NIST StRD

**Files:**
- Create: `src/lib/science/calibration.ts`, `src/lib/science/fixtures/Norris.dat` (descargado del NIST)
- Test: `src/lib/science/calibration.test.ts`

- [ ] **Step 1: Descargar el dataset certificado Norris**

```bash
mkdir -p src/lib/science/fixtures
curl -fsSL -o src/lib/science/fixtures/Norris.dat https://www.itl.nist.gov/div898/strd/lls/data/LINKS/DATA/Norris.dat
head -c 400 src/lib/science/fixtures/Norris.dat
```

Esperado: el archivo empieza con `NIST/ITL StRD` y `Dataset Name:  Norris`.

El archivo trae los valores certificados y 36 pares `y x` después de la línea `Data:       y          x`. Abrirlo y confirmar que contiene líneas que empiezan con `    B0`, `    B1`, `Standard Deviation` (después de `Residual`) y `R-Squared`. El parser del test depende de esas líneas; si difieren, ajustar las regex de `readStrd` a lo que muestra el archivo.

- [ ] **Step 2: Test que falla**

`src/lib/science/calibration.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { detectionLimits, fitCalibration, inversePredict } from './calibration';

function readStrd(path: string) {
  const text = readFileSync(path, 'utf8');
  const num = (re: RegExp) => {
    const m = text.match(re);
    if (!m) throw new Error(`StRD: ${re} not found`);
    return Number(m[1]);
  };
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((l) => /^\s*Data:\s+y\s+x\s*$/.test(l));
  if (start < 0) throw new Error('StRD: data header not found');
  const x: number[] = [];
  const y: number[] = [];
  for (const l of lines.slice(start + 1)) {
    const parts = l.trim().split(/\s+/).map(Number);
    if (parts.length === 2 && parts.every(Number.isFinite)) {
      y.push(parts[0]);
      x.push(parts[1]);
    }
  }
  return {
    b0: num(/^\s*B0\s+(\S+)/m),
    b1: num(/^\s*B1\s+(\S+)/m),
    residualSd: num(/^Standard Deviation\s+(\S+)/m),
    r2: num(/^R-Squared\s+(\S+)/m),
    x,
    y,
  };
}

const rel = (a: number, b: number) => Math.abs(a - b) / Math.abs(b);

// Ejemplo resuelto a mano (ver "La ciencia detrás" del módulo Curva)
const X5 = [0, 1, 2, 3, 4];
const Y5 = [0.1, 2.1, 3.9, 6.1, 7.9];

describe('calibración', () => {
  it('[CAL-URS-01] reproduce los valores certificados de NIST StRD Norris', () => {
    const s = readStrd('src/lib/science/fixtures/Norris.dat');
    expect(s.x).toHaveLength(36);
    const fit = fitCalibration(s.x, s.y);
    expect(rel(fit.slope, s.b1)).toBeLessThan(1e-9);
    expect(rel(fit.intercept, s.b0)).toBeLessThan(1e-9);
    expect(rel(fit.syx, s.residualSd)).toBeLessThan(1e-9);
    expect(Math.abs(fit.r2 - s.r2)).toBeLessThan(1e-9);
  });

  it('[CAL-URS-02] pendiente, ordenada, R² y s y/x del ejemplo resuelto', () => {
    const fit = fitCalibration(X5, Y5);
    expect(fit.slope).toBeCloseTo(1.96, 10);
    expect(fit.intercept).toBeCloseTo(0.1, 10);
    expect(fit.syx).toBeCloseTo(0.1032795559, 9);
    expect(fit.r2).toBeCloseTo(0.999167707, 8);
    // "+ 0" normaliza −0 a 0 (toEqual distingue ambos)
    expect(fit.residuals.map((r) => Number(r.toFixed(10)) + 0)).toEqual([0, 0.04, -0.12, 0.12, -0.04]);
  });

  it('[CAL-URS-03] LOD = 3,3·s/b y LOQ = 10·s/b (ICH Q2)', () => {
    const { lod, loq } = detectionLimits(fitCalibration(X5, Y5));
    expect(lod).toBeCloseTo(0.173889, 5);
    expect(loq).toBeCloseTo(0.526937, 5);
  });

  it('[CAL-URS-04] predicción inversa con desvío e IC 95 % y aviso fuera de rango', () => {
    const fit = fitCalibration(X5, Y5);
    const p = inversePredict(fit, 5);
    expect(p.x0).toBeCloseTo(2.5, 10);
    expect(p.sx0).toBeCloseTo(0.058321, 5);
    expect(p.ci95?.[1]).toBeCloseTo(2.5 + 3.182 * 0.0583212, 3);
    expect(p.outOfRange).toBe(false);
    expect(inversePredict(fit, 20).outOfRange).toBe(true);
  });

  it('[CAL-URS-05] regresión ponderada 1/x² recupera una recta exacta y exige x > 0', () => {
    const x = [1, 2, 4, 8];
    const y = x.map((v) => 2 * v + 1);
    const fit = fitCalibration(x, y, '1/x2');
    expect(fit.slope).toBeCloseTo(2, 10);
    expect(fit.intercept).toBeCloseTo(1, 10);
    expect(fit.r2).toBeCloseTo(1, 10);
    expect(inversePredict(fit, 5).sx0).toBeNull();
    expect(() => fitCalibration([0, 1, 2], [1, 2, 3], '1/x')).toThrow();
  });

  it('[CAL-URS-06] valida la entrada: longitudes, mínimo 3 puntos, x no constantes', () => {
    expect(() => fitCalibration([1, 2, 3], [1, 2])).toThrow();
    expect(() => fitCalibration([1, 2], [1, 2])).toThrow();
    expect(() => fitCalibration([2, 2, 2], [1, 2, 3])).toThrow();
    expect(() => fitCalibration([1, 2, Number.NaN], [1, 2, 3])).toThrow();
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `npx vitest run src/lib/science/calibration.test.ts`
Esperado: FAIL, módulo inexistente.

- [ ] **Step 4: Implementación**

`src/lib/science/calibration.ts`:

```ts
import { tQuantile975 } from './stats';

export type Weighting = 'none' | '1/x' | '1/x2';

export interface CalibrationFit {
  n: number;
  weighting: Weighting;
  slope: number;
  intercept: number;
  r2: number;
  syx: number;
  seSlope: number;
  seIntercept: number;
  xMean: number;
  yMean: number;
  sxx: number;
  x: number[];
  y: number[];
  fitted: number[];
  residuals: number[];
}

function weightsFor(x: number[], weighting: Weighting): number[] {
  if (weighting === 'none') return x.map(() => 1);
  if (x.some((v) => v <= 0)) throw new Error('calibration: weighting requires x > 0');
  const raw = x.map((v) => (weighting === '1/x' ? 1 / v : 1 / (v * v)));
  const sum = raw.reduce((a, b) => a + b, 0);
  // Normalizados para que Σw = n (así s y/x conserva unidades de la señal)
  return raw.map((w) => (w * x.length) / sum);
}

export function fitCalibration(x: number[], y: number[], weighting: Weighting = 'none'): CalibrationFit {
  if (x.length !== y.length) throw new Error('calibration: x and y must have the same length');
  if (x.length < 3) throw new Error('calibration: at least 3 points are required');
  if ([...x, ...y].some((v) => !Number.isFinite(v))) throw new Error('calibration: non-finite value');

  const n = x.length;
  const w = weightsFor(x, weighting);
  const sw = w.reduce((a, b) => a + b, 0);
  const xMean = w.reduce((a, wi, i) => a + wi * x[i], 0) / sw;
  const yMean = w.reduce((a, wi, i) => a + wi * y[i], 0) / sw;

  let sxx = 0;
  let sxy = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - xMean;
    const dy = y[i] - yMean;
    sxx += w[i] * dx * dx;
    sxy += w[i] * dx * dy;
    syy += w[i] * dy * dy;
  }
  if (sxx === 0) throw new Error('calibration: x values must not all be equal');

  const slope = sxy / sxx;
  const intercept = yMean - slope * xMean;
  const fitted = x.map((xi) => intercept + slope * xi);
  const residuals = y.map((yi, i) => yi - fitted[i]);
  const ssRes = residuals.reduce((a, r, i) => a + w[i] * r * r, 0);
  const syx = Math.sqrt(ssRes / (n - 2));
  const r2 = syy === 0 ? 1 : 1 - ssRes / syy;

  return {
    n,
    weighting,
    slope,
    intercept,
    r2,
    syx,
    seSlope: syx / Math.sqrt(sxx),
    seIntercept: syx * Math.sqrt(1 / sw + (xMean * xMean) / sxx),
    xMean,
    yMean,
    sxx,
    x: [...x],
    y: [...y],
    fitted,
    residuals,
  };
}

export function detectionLimits(fit: CalibrationFit): { lod: number; loq: number } {
  if (fit.slope === 0) throw new Error('calibration: slope is zero');
  const b = Math.abs(fit.slope);
  return { lod: (3.3 * fit.syx) / b, loq: (10 * fit.syx) / b };
}

export interface InversePrediction {
  x0: number;
  sx0: number | null;
  ci95: [number, number] | null;
  outOfRange: boolean;
}

// Miller & Miller: s x0 para regresión sin ponderar. En ponderada no se informa IC.
export function inversePredict(fit: CalibrationFit, y0: number, replicates = 1): InversePrediction {
  if (!Number.isInteger(replicates) || replicates < 1) throw new Error('calibration: replicates must be ≥ 1');
  const x0 = (y0 - fit.intercept) / fit.slope;
  const outOfRange = x0 < Math.min(...fit.x) || x0 > Math.max(...fit.x);
  if (fit.weighting !== 'none') return { x0, sx0: null, ci95: null, outOfRange };
  const b = fit.slope;
  const sx0 =
    (fit.syx / Math.abs(b)) * Math.sqrt(1 / replicates + 1 / fit.n + (y0 - fit.yMean) ** 2 / (b * b * fit.sxx));
  const t = tQuantile975(fit.n - 2);
  return { x0, sx0, ci95: [x0 - t * sx0, x0 + t * sx0], outOfRange };
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `npx vitest run src/lib/science/calibration.test.ts`
Esperado: `6 passed`.

Si falla solo `[CAL-URS-01]` con "not found", el formato del archivo NIST difiere: ajustar las regex de `readStrd` a las líneas reales del archivo, sin tocar las tolerancias.

- [ ] **Step 6: Commit**

```bash
git add src/lib/science/calibration.ts src/lib/science/calibration.test.ts src/lib/science/fixtures/Norris.dat
git commit -m "feat: calibración ponderada, LOD/LOQ y predicción inversa verificadas con NIST Norris

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 10: Incertidumbre GUM y Monte Carlo (EURACHEM A1)

**Files:**
- Create: `src/lib/science/random.ts`, `src/lib/science/uncertainty.ts`
- Test: `src/lib/science/uncertainty.test.ts`

- [ ] **Step 1: Test que falla**

`src/lib/science/uncertainty.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { mean, sampleSd } from './stats';
import { mulberry32, normal } from './random';
import { gumBudget, monteCarlo, typeA, typeB, type InputQuantity, type MeasurementModel } from './uncertainty';

// EURACHEM/CITAC QUAM, ejemplo A1: preparación de un patrón de calibración de cadmio
const cadmium: MeasurementModel = (v) => (1000 * v.m * v.P) / v.V;
const inputs: InputQuantity[] = [
  { name: 'm', value: 100.28, u: 0.05, distribution: 'normal' },
  { name: 'P', value: 0.9999, u: 0.000058, distribution: 'rectangular' },
  { name: 'V', value: 100.0, u: 0.07, distribution: 'triangular' },
];

describe('incertidumbre', () => {
  it('[UNC-URS-01] tipo A: u = s/√n', () => {
    const r = typeA([10.1, 10.3, 9.9, 10.0, 10.2]);
    expect(r.mean).toBeCloseTo(10.1, 12);
    expect(r.u).toBeCloseTo(0.0707107, 6);
    expect(() => typeA([1])).toThrow();
  });

  it('[UNC-URS-02] tipo B: rectangular a/√3, triangular a/√6, desde U/k', () => {
    expect(typeB.rectangular(0.1)).toBeCloseTo(0.0577350, 6);
    expect(typeB.triangular(0.1)).toBeCloseTo(0.0408248, 6);
    expect(typeB.fromExpanded(0.2, 2)).toBe(0.1);
  });

  it('[UNC-URS-03] presupuesto GUM reproduce EURACHEM A1 (c = 1002,7 mg/L; u = 0,86)', () => {
    const b = gumBudget(cadmium, inputs);
    expect(b.y).toBeCloseTo(1002.69972, 4);
    expect(b.uc).toBeCloseTo(0.8637, 3);
    expect(b.U).toBeCloseTo(1.7274, 3);
    const byName = Object.fromEntries(b.rows.map((r) => [r.name, r]));
    expect(byName.m.sensitivity).toBeCloseTo(9.999, 6);
    expect(byName.V.sensitivity).toBeCloseTo(-10.0269972, 5);
    expect(byName.V.percent).toBeCloseTo(66.0, 0);
    expect(b.rows.reduce((a, r) => a + r.percent, 0)).toBeCloseTo(100, 8);
  });

  it('[UNC-URS-04] Monte Carlo (GUM S1) coincide con la GUM en un modelo casi lineal', () => {
    const mc = monteCarlo(cadmium, inputs, 200_000, 42);
    expect(Math.abs(mc.mean - 1002.69972)).toBeLessThan(0.01);
    expect(Math.abs(mc.sd - 0.8637)).toBeLessThan(0.01);
    expect(mc.high - mc.low).toBeGreaterThan(3.2);
    expect(mc.high - mc.low).toBeLessThan(3.6);
    expect(mc.histogram.reduce((a, h) => a + h.count, 0)).toBe(200_000);
  });

  it('[UNC-URS-05] generador pseudoaleatorio reproducible y normal estándar correcta', () => {
    const a = mulberry32(7);
    const b = mulberry32(7);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
    const rng = mulberry32(123);
    const zs = Array.from({ length: 200_000 }, () => normal(rng));
    expect(Math.abs(mean(zs))).toBeLessThan(0.01);
    expect(Math.abs(sampleSd(zs) - 1)).toBeLessThan(0.01);
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `npx vitest run src/lib/science/uncertainty.test.ts`
Esperado: FAIL, módulos inexistentes.

- [ ] **Step 3: Generador reproducible**

`src/lib/science/random.ts`:

```ts
// Mulberry32: PRNG rápido y reproducible (misma semilla → misma secuencia).
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Normal estándar por Box–Muller.
export function normal(rng: () => number): number {
  let u = 0;
  while (u === 0) u = rng();
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
```

- [ ] **Step 4: Implementación de incertidumbre**

`src/lib/science/uncertainty.ts`:

```ts
import { mulberry32, normal } from './random';
import { mean, quantile, sampleSd } from './stats';

export type Distribution = 'normal' | 'rectangular' | 'triangular';

export interface InputQuantity {
  name: string;
  value: number;
  u: number; // incertidumbre estándar
  distribution: Distribution;
}

export type MeasurementModel = (values: Record<string, number>) => number;

export function typeA(values: number[]): { mean: number; u: number; n: number } {
  if (values.length < 2) throw new Error('typeA: at least 2 replicates are required');
  return { mean: mean(values), u: sampleSd(values) / Math.sqrt(values.length), n: values.length };
}

export const typeB = {
  rectangular: (halfWidth: number) => halfWidth / Math.sqrt(3),
  triangular: (halfWidth: number) => halfWidth / Math.sqrt(6),
  fromExpanded: (expanded: number, k: number) => expanded / k,
};

export interface BudgetRow {
  name: string;
  value: number;
  u: number;
  sensitivity: number;
  contribution: number;
  percent: number;
}

export interface Budget {
  y: number;
  uc: number;
  k: number;
  U: number;
  rows: BudgetRow[];
}

function valuesOf(inputs: InputQuantity[]): Record<string, number> {
  return Object.fromEntries(inputs.map((q) => [q.name, q.value]));
}

// GUM (JCGM 100): entradas no correlacionadas, sensibilidades por diferencia central.
export function gumBudget(model: MeasurementModel, inputs: InputQuantity[], k = 2): Budget {
  if (inputs.length === 0) throw new Error('gum: no inputs');
  if (inputs.some((q) => !Number.isFinite(q.value) || !(q.u >= 0))) throw new Error('gum: invalid input');
  const base = valuesOf(inputs);
  const y = model(base);
  const partial = inputs.map((q) => {
    const h = q.u > 0 ? q.u * 1e-3 : Math.max(Math.abs(q.value) * 1e-6, 1e-12);
    const up = model({ ...base, [q.name]: q.value + h });
    const down = model({ ...base, [q.name]: q.value - h });
    const sensitivity = (up - down) / (2 * h);
    return { name: q.name, value: q.value, u: q.u, sensitivity, contribution: Math.abs(sensitivity) * q.u };
  });
  const uc = Math.sqrt(partial.reduce((a, r) => a + r.contribution ** 2, 0));
  const rows = partial.map((r) => ({ ...r, percent: uc === 0 ? 0 : (100 * r.contribution ** 2) / (uc * uc) }));
  return { y, uc, k, U: k * uc, rows };
}

export function sampleInput(q: InputQuantity, rng: () => number): number {
  switch (q.distribution) {
    case 'normal':
      return q.value + q.u * normal(rng);
    case 'rectangular': {
      const a = q.u * Math.sqrt(3);
      return q.value + (2 * rng() - 1) * a;
    }
    case 'triangular': {
      const a = q.u * Math.sqrt(6);
      return q.value + (rng() + rng() - 1) * a;
    }
  }
}

export interface MonteCarloResult {
  draws: number;
  mean: number;
  sd: number;
  low: number;
  high: number;
  histogram: { x0: number; x1: number; count: number }[];
}

// GUM Suplemento 1 (JCGM 101): propagación de distribuciones por Monte Carlo.
export function monteCarlo(
  model: MeasurementModel,
  inputs: InputQuantity[],
  draws = 100_000,
  seed = 12345,
  bins = 40,
): MonteCarloResult {
  if (draws < 1000) throw new Error('monteCarlo: use at least 1000 draws');
  const rng = mulberry32(seed);
  const ys = new Float64Array(draws);
  const v = valuesOf(inputs);
  for (let i = 0; i < draws; i++) {
    for (const q of inputs) v[q.name] = sampleInput(q, rng);
    ys[i] = model(v);
  }
  ys.sort();
  const min = ys[0];
  const max = ys[ys.length - 1];
  const width = (max - min) / bins || 1;
  const histogram = Array.from({ length: bins }, (_, b) => ({ x0: min + b * width, x1: min + (b + 1) * width, count: 0 }));
  for (let i = 0; i < ys.length; i++) {
    const b = Math.min(bins - 1, Math.floor((ys[i] - min) / width));
    histogram[b].count++;
  }
  return {
    draws,
    mean: mean(ys),
    sd: sampleSd(ys),
    low: quantile(ys, 0.025),
    high: quantile(ys, 0.975),
    histogram,
  };
}
```

`Float64Array.prototype.sort()` ordena numéricamente sin necesidad de comparador.

- [ ] **Step 5: Verificar que pasa**

Run: `npx vitest run src/lib/science/uncertainty.test.ts`
Esperado: `5 passed`.

- [ ] **Step 6: Commit**

```bash
git add src/lib/science/random.ts src/lib/science/uncertainty.ts src/lib/science/uncertainty.test.ts
git commit -m "feat: incertidumbre GUM y Monte Carlo verificadas con EURACHEM A1

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 11: Exportación CSV y descargas

**Files:**
- Create: `src/lib/export/csv.ts`
- Test: `src/lib/export/csv.test.ts`

- [ ] **Step 1: Test que falla**

`src/lib/export/csv.test.ts`:

```ts
import { expect, it } from 'vitest';
import { toCsv } from './csv';

it('[EXP-URS-01] CSV con escape de comillas, comas, saltos de línea y celdas vacías', () => {
  const csv = toCsv(['id', 'nota', 'valor'], [
    ['M-1', 'dice "hola", ok', 1.5],
    ['M-2', 'línea\nnueva', null],
  ]);
  expect(csv).toBe('id,nota,valor\r\nM-1,"dice ""hola"", ok",1.5\r\nM-2,"línea\nnueva",\r\n');
});
```

- [ ] **Step 2: Verificar que falla**

Run: `npx vitest run src/lib/export/csv.test.ts`
Esperado: FAIL.

- [ ] **Step 3: Implementación**

`src/lib/export/csv.ts`:

```ts
export type Cell = string | number | null | undefined;

function escapeCell(cell: Cell): string {
  if (cell === null || cell === undefined) return '';
  const s = String(cell);
  return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(headers: string[], rows: Cell[][]): string {
  return [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n') + '\r\n';
}

export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// BOM UTF-8 para que Excel respete los acentos.
export function downloadText(filename: string, text: string, mime = 'text/csv;charset=utf-8'): void {
  downloadBlob(filename, new Blob(['﻿' + text], { type: mime }));
}
```

- [ ] **Step 4: Verificar que pasa y commit**

Run: `npx vitest run src/lib/export/csv.test.ts`
Esperado: `1 passed`.

```bash
git add src/lib/export
git commit -m "feat: exportación CSV compatible con Excel

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```
