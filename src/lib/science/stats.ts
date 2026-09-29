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
