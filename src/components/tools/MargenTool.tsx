'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { btnPrimary, card, input, label, table, tableWrap } from '@/components/ui/styles';
import {
  gumBudget,
  monteCarlo,
  typeA,
  type Distribution,
  type InputQuantity,
  type MeasurementModel,
  type MonteCarloResult,
} from '@/lib/science/uncertainty';
import { figCaption, figTag } from './chartStyle';
import { ChartPlaceholder, WhenVisible } from './Placeholders';
import type { ToolProps } from './registry';

// Recharts viaja solo con esta herramienta (next/dynamic, sin SSR); el marcador conserva la altura.
const ContributionsChart = dynamic(() => import('./MargenCharts').then((m) => m.ContributionsChart), {
  ssr: false,
  loading: () => <ChartPlaceholder className="h-48" />,
});
const HistogramChart = dynamic(() => import('./MargenCharts').then((m) => m.HistogramChart), {
  ssr: false,
  loading: () => <ChartPlaceholder className="h-48" />,
});

// Rejilla de magnitudes de entrada: en móvil cada magnitud se apila (2 columnas, campos rotulados); desde sm, 4 columnas.
const gridCols =
  'grid grid-cols-2 items-end gap-x-3 gap-y-2 sm:grid-cols-[minmax(4.5rem,1fr)_minmax(5.5rem,1fr)_minmax(5.5rem,1fr)_minmax(8rem,1.2fr)] sm:items-center';
const fieldLabel = 'mb-0.5 block font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-muted sm:sr-only';
const dtClass = 'font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-muted';

const MODEL: MeasurementModel = (v) => (1000 * v.m * v.P) / v.V;

type Row = { name: string; value: string; u: string; distribution: Distribution };
const DEFAULT_ROWS: Row[] = [
  { name: 'm', value: '100.28', u: '0.05', distribution: 'normal' },
  { name: 'P', value: '0.9999', u: '0.000058', distribution: 'rectangular' },
  { name: 'V', value: '100.0', u: '0.07', distribution: 'triangular' },
];
const DISTRIBUTIONS: Distribution[] = ['normal', 'rectangular', 'triangular'];

function toInputs(rows: Row[]): InputQuantity[] | null {
  const inputs = rows.map((r) => ({
    name: r.name,
    value: Number(r.value.replace(',', '.')),
    u: Number(r.u.replace(',', '.')),
    distribution: r.distribution,
  }));
  return inputs.every((q) => Number.isFinite(q.value) && Number.isFinite(q.u) && q.u >= 0) ? inputs : null;
}

export function MargenTool({ dict }: ToolProps) {
  const t = dict.tools.margen;
  const [rows, setRows] = useState<Row[]>(DEFAULT_ROWS);
  const [mc, setMc] = useState<MonteCarloResult | null>(null);
  const [replicates, setReplicates] = useState('10.1\n10.3\n9.9\n10.0\n10.2');

  const inputs = useMemo(() => toInputs(rows), [rows]);
  const budget = useMemo(() => (inputs ? gumBudget(MODEL, inputs) : null), [inputs]);

  const typeAResult = useMemo(() => {
    const values = replicates
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => Number(l.replace(',', '.')));
    if (values.length < 2 || !values.every(Number.isFinite)) return null;
    return typeA(values);
  }, [replicates]);

  function update(index: number, patch: Partial<Row>) {
    setRows(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
    setMc(null);
  }

  return (
    <div className="space-y-6">
      <div className={`${card} space-y-3`}>
        <h2 className="font-semibold">{t.model}</h2>
        <p className="font-mono text-sm">{t.modelFormula}</p>
        <h3 className="text-sm font-semibold">{t.inputs}</h3>
        <div>
          <div
            aria-hidden="true"
            className={`${gridCols} hidden border-b border-ink pb-1.5 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-muted sm:grid`}
          >
            <span>{t.name}</span>
            <span>{t.value}</span>
            <span>{t.u}</span>
            <span>{t.dist}</span>
          </div>
          {rows.map((r, i) => (
            <div key={r.name} role="group" aria-label={t.names[r.name] ?? r.name} className={`${gridCols} border-b border-line py-2.5 sm:py-1.5`}>
              <p className="col-span-2 text-sm font-semibold sm:col-span-1 sm:font-normal">{t.names[r.name] ?? r.name}</p>
              <label className="min-w-0">
                <span className={fieldLabel}>{t.value}</span>
                <input
                  aria-label={`${r.name} ${t.value}`}
                  className={`${input} font-mono`}
                  inputMode="decimal"
                  value={r.value}
                  onChange={(e) => update(i, { value: e.target.value })}
                />
              </label>
              <label className="min-w-0">
                <span className={fieldLabel}>{t.u}</span>
                <input
                  aria-label={`${r.name} ${t.u}`}
                  className={`${input} font-mono`}
                  inputMode="decimal"
                  value={r.u}
                  onChange={(e) => update(i, { u: e.target.value })}
                />
              </label>
              <label className="col-span-2 min-w-0 sm:col-span-1">
                <span className={fieldLabel}>{t.dist}</span>
                <select
                  aria-label={`${r.name} ${t.dist}`}
                  className={input}
                  value={r.distribution}
                  onChange={(e) => update(i, { distribution: e.target.value as Distribution })}
                >
                  {DISTRIBUTIONS.map((d) => (
                    <option key={d} value={d}>
                      {t.dists[d]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ))}
        </div>
        {!budget && (
          <p role="alert" className="text-sm text-danger">
            {t.invalid}
          </p>
        )}
      </div>

      {budget && inputs && (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
          <div className={`${card} min-w-0 space-y-3`}>
            <h2 className="font-semibold">{t.budget}</h2>
            <div className={tableWrap}>
              <table className={table}>
                <thead>
                  <tr>
                    <th>{t.name}</th>
                    <th>{t.sensitivity}</th>
                    <th>{t.contribution}</th>
                    <th>{t.percent}</th>
                  </tr>
                </thead>
                <tbody>
                  {budget.rows.map((r) => (
                    <tr key={r.name}>
                      <td className="font-mono">{r.name}</td>
                      <td className="whitespace-nowrap font-mono">{r.sensitivity.toPrecision(5)}</td>
                      <td className="whitespace-nowrap font-mono">{r.contribution.toPrecision(4)}</td>
                      <td className="whitespace-nowrap font-mono">{r.percent.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="font-mono text-sm leading-relaxed" data-testid="margen-result">
              <span className="whitespace-nowrap">
                {t.result}: {budget.y.toFixed(2)}&nbsp;mg/L
              </span>{' '}
              ·{' '}
              <span className="whitespace-nowrap">
                {t.uc} = {budget.uc.toFixed(3)}&nbsp;mg/L
              </span>{' '}
              ·{' '}
              <span className="whitespace-nowrap">
                {t.U} = {budget.U.toFixed(2)}&nbsp;mg/L
              </span>
            </p>
            <figure>
              <figcaption className={figCaption}>
                <b className={figTag}>Fig. 2-a</b>
                {t.contributionsChart}
              </figcaption>
              <WhenVisible placeholder={<ChartPlaceholder className="h-48" />}>
                <ContributionsChart data={budget.rows} />
              </WhenVisible>
            </figure>
          </div>

          <div className={`${card} min-w-0 space-y-3`}>
            <h2 className="font-semibold">{t.mc}</h2>
            <button type="button" data-testid="run-mc" className={btnPrimary} onClick={() => setMc(monteCarlo(MODEL, inputs, 100_000, 12345))}>
              {t.runMc}
            </button>
            {mc && (
              <>
                <dl className="grid grid-cols-1 gap-2 text-sm min-[26rem]:grid-cols-2" data-testid="mc-result">
                  <div>
                    <dt className={dtClass}>{t.mcMean}</dt>
                    <dd className="font-mono">{mc.mean.toFixed(2)} mg/L</dd>
                  </div>
                  <div>
                    <dt className={dtClass}>{t.mcSd}</dt>
                    <dd className="font-mono">{mc.sd.toFixed(3)} mg/L</dd>
                  </div>
                  <div>
                    <dt className={dtClass}>{t.mcInterval}</dt>
                    <dd className="font-mono">
                      [{mc.low.toFixed(2)}; {mc.high.toFixed(2)}] mg/L
                    </dd>
                  </div>
                  <div>
                    <dt className={dtClass}>{t.gumInterval}</dt>
                    <dd className="font-mono">
                      [{(budget.y - budget.U).toFixed(2)}; {(budget.y + budget.U).toFixed(2)}] mg/L
                    </dd>
                  </div>
                </dl>
                <figure>
                  <figcaption className={figCaption}>
                    <b className={figTag}>Fig. 2-b</b>
                    {t.histogram}
                  </figcaption>
                  <HistogramChart data={mc.histogram.map((h) => ({ x: ((h.x0 + h.x1) / 2).toFixed(2), count: h.count }))} />
                </figure>
              </>
            )}
          </div>
        </div>
      )}

      <div className={`${card} space-y-2`}>
        <h2 className="font-semibold">{t.typeA}</h2>
        <label className={label}>
          {t.typeAHelp}
          <textarea className={`${input} mt-1 font-mono`} rows={5} value={replicates} onChange={(e) => setReplicates(e.target.value)} />
        </label>
        {typeAResult && (
          <p className="break-words font-mono text-sm">
            {t.typeAResult
              .replace('{n}', String(typeAResult.n))
              .replace('{mean}', typeAResult.mean.toPrecision(6))
              .replace('{u}', typeAResult.u.toPrecision(4))}
          </p>
        )}
      </div>
    </div>
  );
}
