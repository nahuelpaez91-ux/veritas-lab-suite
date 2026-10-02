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
  if (syy === 0) throw new Error('calibration: y values must not all be equal');

  const slope = sxy / sxx;
  const intercept = yMean - slope * xMean;
  const fitted = x.map((xi) => intercept + slope * xi);
  const residuals = y.map((yi, i) => yi - fitted[i]);
  const ssRes = residuals.reduce((a, r, i) => a + w[i] * r * r, 0);
  const syx = Math.sqrt(ssRes / (n - 2));
  const r2 = 1 - ssRes / syy;

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

// ICH Q2: LOD = 3,3·σ/S, LOQ = 10·σ/S, con σ estimado como s y/x. Esa estimación
// de σ (la dispersión de la señal del blanco) solo es válida para regresiones
// sin ponderar: en una regresión ponderada, s y/x no representa la DE del blanco.
export function detectionLimits(fit: CalibrationFit): { lod: number; loq: number } | null {
  if (fit.weighting !== 'none') return null;
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
  if (fit.slope === 0) throw new Error('calibration: slope is zero');
  const x0 = (y0 - fit.intercept) / fit.slope;
  const outOfRange = x0 < Math.min(...fit.x) || x0 > Math.max(...fit.x);
  if (fit.weighting !== 'none') return { x0, sx0: null, ci95: null, outOfRange };
  const b = fit.slope;
  const sx0 =
    (fit.syx / Math.abs(b)) * Math.sqrt(1 / replicates + 1 / fit.n + (y0 - fit.yMean) ** 2 / (b * b * fit.sxx));
  const t = tQuantile975(fit.n - 2);
  return { x0, sx0, ci95: [x0 - t * sx0, x0 + t * sx0], outOfRange };
}
