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
    // Nota: en el archivo real descargado del NIST, "Standard Deviation" y "R-Squared"
    // vienen indentados (no al principio absoluto de línea) y el encabezado de la
    // tabla también contiene la frase "Standard Deviation" sin número a continuación
    // (le sigue un salto de línea). Se ajustan las regex: `\s*` inicial para tolerar la
    // indentación, y `[ \t]+` en vez de `\s+` antes del valor para no cruzar líneas y
    // así no confundir el encabezado con la línea de datos. Tolerancias sin tocar.
    residualSd: num(/^\s*Standard Deviation[ \t]+(\S+)/m),
    r2: num(/^\s*R-Squared[ \t]+(\S+)/m),
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
