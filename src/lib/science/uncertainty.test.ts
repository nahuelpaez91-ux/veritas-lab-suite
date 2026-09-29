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
