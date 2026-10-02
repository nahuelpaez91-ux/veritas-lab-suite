'use client';

import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
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
import { chartTick, chartTooltip, figCaption, figTag } from './chartStyle';
import type { ToolProps } from './registry';

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
        <div className={tableWrap}>
          <table className={table}>
            <thead>
              <tr>
                <th>{t.name}</th>
                <th>{t.value}</th>
                <th>{t.u}</th>
                <th>{t.dist}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.name}>
                  <td>{t.names[r.name] ?? r.name}</td>
                  <td>
                    <input aria-label={`${r.name} ${t.value}`} className={input} inputMode="decimal" value={r.value} onChange={(e) => update(i, { value: e.target.value })} />
                  </td>
                  <td>
                    <input aria-label={`${r.name} ${t.u}`} className={input} inputMode="decimal" value={r.u} onChange={(e) => update(i, { u: e.target.value })} />
                  </td>
                  <td>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!budget && (
          <p role="alert" className="text-sm text-danger">
            {t.invalid}
          </p>
        )}
      </div>

      {budget && inputs && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className={`${card} space-y-3`}>
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
                      <td className="font-mono">{r.sensitivity.toPrecision(5)}</td>
                      <td className="font-mono">{r.contribution.toPrecision(4)}</td>
                      <td className="font-mono">{r.percent.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="font-mono text-sm" data-testid="margen-result">
              {t.result}: {budget.y.toFixed(2)} mg/L · {t.uc} = {budget.uc.toFixed(3)} mg/L · {t.U} = {budget.U.toFixed(2)} mg/L
            </p>
            <figure>
              <figcaption className={figCaption}>
                <b className={figTag}>Fig. 2-a</b>
                {t.contributionsChart}
              </figcaption>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budget.rows} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <CartesianGrid stroke="var(--color-line)" strokeDasharray="1 3" />
                    <XAxis type="number" domain={[0, 100]} tick={chartTick} stroke="var(--color-line)" />
                    <YAxis type="category" dataKey="name" tick={{ ...chartTick, fontSize: 12 }} stroke="var(--color-line)" width={24} />
                    <Tooltip {...chartTooltip} cursor={{ fill: 'var(--color-bg)' }} formatter={(v) => (typeof v === 'number' ? `${v.toFixed(1)} %` : String(v))} />
                    <Bar dataKey="percent" fill="var(--color-accent)" isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </figure>
          </div>

          <div className={`${card} space-y-3`}>
            <h2 className="font-semibold">{t.mc}</h2>
            <button type="button" data-testid="run-mc" className={btnPrimary} onClick={() => setMc(monteCarlo(MODEL, inputs, 100_000, 12345))}>
              {t.runMc}
            </button>
            {mc && (
              <>
                <dl className="grid grid-cols-2 gap-2 text-sm" data-testid="mc-result">
                  <div>
                    <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-muted">{t.mcMean}</dt>
                    <dd className="font-mono">{mc.mean.toFixed(2)} mg/L</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-muted">{t.mcSd}</dt>
                    <dd className="font-mono">{mc.sd.toFixed(3)} mg/L</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-muted">{t.mcInterval}</dt>
                    <dd className="font-mono">
                      [{mc.low.toFixed(2)}; {mc.high.toFixed(2)}] mg/L
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-muted">{t.gumInterval}</dt>
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
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mc.histogram.map((h) => ({ x: ((h.x0 + h.x1) / 2).toFixed(2), count: h.count }))}>
                        <XAxis dataKey="x" tick={{ ...chartTick, fontSize: 9 }} stroke="var(--color-line)" interval={7} />
                        <YAxis hide />
                        <Tooltip {...chartTooltip} cursor={{ fill: 'var(--color-bg)' }} />
                        <Bar dataKey="count" fill="var(--color-accent)" isAnimationActive={false} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
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
          <p className="font-mono text-sm">
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
