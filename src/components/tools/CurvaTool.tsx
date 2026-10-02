'use client';

import { useMemo, useState } from 'react';
import { CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts';
import { btnSecondary, card, input, label } from '@/components/ui/styles';
import { downloadText, toCsv } from '@/lib/export/csv';
import { detectionLimits, fitCalibration, inversePredict, type Weighting } from '@/lib/science/calibration';
import type { ToolProps } from './registry';

// Ejemplo sintético: absorbancia vs concentración (mg/L)
const DEFAULT_DATA = '0, 0.002\n2, 0.101\n4, 0.198\n6, 0.304\n8, 0.399\n10, 0.502';

function parsePairs(text: string): { x: number[]; y: number[] } | null {
  const x: number[] = [];
  const y: number[] = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.split(/[\s,;]+/).map(Number);
    if (parts.length !== 2 || !parts.every(Number.isFinite)) return null;
    x.push(parts[0]);
    y.push(parts[1]);
  }
  return x.length > 0 ? { x, y } : null;
}

const fmt = (v: number) => (Math.abs(v) >= 1000 || (Math.abs(v) < 0.001 && v !== 0) ? v.toExponential(3) : v.toPrecision(5));

export function CurvaTool({ dict }: ToolProps) {
  const t = dict.tools.curva;
  const [text, setText] = useState(DEFAULT_DATA);
  const [weighting, setWeighting] = useState<Weighting>('none');
  const [y0, setY0] = useState('0.25');
  const [replicates, setReplicates] = useState('1');

  const result = useMemo(() => {
    const pairs = parsePairs(text);
    if (!pairs) return null;
    try {
      const fit = fitCalibration(pairs.x, pairs.y, weighting);
      return { fit, limits: detectionLimits(fit) }; // limits = null en regresión ponderada
    } catch {
      return null;
    }
  }, [text, weighting]);

  const y0n = Number(y0.replace(',', '.'));
  const m = Number(replicates.replace(',', '.'));
  const prediction =
    result && Number.isFinite(y0n) && Number.isInteger(m) && m >= 1 ? inversePredict(result.fit, y0n, m) : null;

  const chartData = result
    ? result.fit.x.map((x, i) => ({ x, y: result.fit.y[i], fit: result.fit.fitted[i], r: result.fit.residuals[i] })).sort((a, b) => a.x - b.x)
    : [];

  function exportCsv() {
    if (!result) return;
    downloadText(
      'calibracion.csv',
      toCsv(['x', 'y', 'y_ajustada', 'residuo'], chartData.map((d) => [d.x, d.y, d.fit, d.r])),
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className={`${card} space-y-3`}>
          <label className={label}>
            {t.data}
            <textarea
              data-testid="curva-data"
              className={`${input} mt-1 font-mono`}
              rows={9}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </label>
          <p className="text-xs text-muted">{t.exampleNote}</p>
          <label className={label}>
            {t.weighting}
            <select className={`${input} mt-1`} value={weighting} onChange={(e) => setWeighting(e.target.value as Weighting)}>
              {(Object.keys(t.weights) as Weighting[]).map((w) => (
                <option key={w} value={w}>
                  {t.weights[w]}
                </option>
              ))}
            </select>
          </label>
          {!result && (
            <p role="alert" className="text-sm text-danger">
              {t.parseError}
            </p>
          )}
          {result && (
            <dl className="grid grid-cols-2 gap-2 text-sm" data-testid="curva-results">
              {[
                [t.slope, `${fmt(result.fit.slope)} ± ${fmt(result.fit.seSlope)}`],
                [t.intercept, `${fmt(result.fit.intercept)} ± ${fmt(result.fit.seIntercept)}`],
                [t.r2, result.fit.r2.toFixed(6)],
                [t.syx, fmt(result.fit.syx)],
                [t.lod, result.limits ? `${fmt(result.limits.lod)} ${t.xUnits}` : t.lodWeighted],
                [t.loq, result.limits ? `${fmt(result.limits.loq)} ${t.xUnits}` : t.lodWeighted],
              ].map(([k, v]) => (
                <div key={k} className="rounded-md border border-line p-2">
                  <dt className="text-xs text-muted">{k}</dt>
                  <dd className="font-mono">{v}</dd>
                </div>
              ))}
            </dl>
          )}
          <button type="button" className={btnSecondary} onClick={exportCsv} disabled={!result}>
            {t.export}
          </button>
        </div>

        <div className={`${card} space-y-4`}>
          <figure>
            <figcaption className="mb-2 text-sm font-semibold">{t.chart}</figcaption>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 8, right: 16, bottom: 4, left: -8 }}>
                  <CartesianGrid stroke="var(--color-line)" strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="x" tick={{ fontSize: 10 }} stroke="var(--color-muted)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="var(--color-muted)" />
                  <Tooltip />
                  <Line dataKey="fit" name={t.fit} stroke="var(--color-accent)" dot={false} isAnimationActive={false} />
                  <Scatter dataKey="y" name={t.points} fill="var(--color-ink)" isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </figure>
          <figure>
            <figcaption className="mb-2 text-sm font-semibold">{t.residuals}</figcaption>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 8, right: 16, bottom: 4, left: -8 }}>
                  <CartesianGrid stroke="var(--color-line)" strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="x" tick={{ fontSize: 10 }} stroke="var(--color-muted)" />
                  <YAxis type="number" dataKey="r" tick={{ fontSize: 10 }} stroke="var(--color-muted)" />
                  <ReferenceLine y={0} stroke="var(--color-muted)" />
                  <Tooltip />
                  <Scatter data={chartData} fill="var(--color-warn)" isAnimationActive={false} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </figure>
        </div>
      </div>

      <div className={`${card} space-y-3`}>
        <h2 className="font-semibold">{t.inverse}</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          <label className={label}>
            {t.y0}
            <input data-testid="curva-y0" className={`${input} mt-1`} inputMode="decimal" value={y0} onChange={(e) => setY0(e.target.value)} />
          </label>
          <label className={label}>
            {t.replicates}
            <input className={`${input} mt-1`} inputMode="numeric" value={replicates} onChange={(e) => setReplicates(e.target.value)} />
          </label>
          {prediction && (
            <div className="text-sm sm:col-span-2" data-testid="curva-x0">
              <p>
                <span className="text-muted">{t.x0}: </span>
                <span className="font-mono font-semibold">
                  {fmt(prediction.x0)} {t.xUnits}
                </span>
              </p>
              {prediction.sx0 !== null && prediction.ci95 ? (
                <p className="font-mono text-xs">
                  {t.sx0} = {fmt(prediction.sx0)} · {t.ci}: [{fmt(prediction.ci95[0])}; {fmt(prediction.ci95[1])}]
                </p>
              ) : (
                <p className="text-xs text-muted">{t.ciWeighted}</p>
              )}
              {prediction.outOfRange && <p className="text-xs font-semibold text-warn">{t.outOfRange}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
