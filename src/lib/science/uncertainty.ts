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
    default:
      throw new Error(`sampleInput: unknown distribution ${q.distribution as string}`);
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
  if (inputs.some((q) => !Number.isFinite(q.value) || !(q.u >= 0))) throw new Error('monteCarlo: invalid input');
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
