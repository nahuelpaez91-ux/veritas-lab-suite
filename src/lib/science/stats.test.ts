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
