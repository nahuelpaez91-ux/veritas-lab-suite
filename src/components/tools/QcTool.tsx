'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { formatLabError, useLab } from '@/components/lab/LabStoreProvider';
import { runTone, StatusChip } from '@/components/lab/StatusChip';
import { Term } from '@/components/module/Term';
import { btnPrimary, btnSecondary, card, input, label, table, tableWrap } from '@/components/ui/styles';
import { downloadText, toCsv } from '@/lib/export/csv';
import { addQcRun } from '@/lib/lims/actions';
import { analytesOf, runsFor, targetsFor, violationsFor } from '@/lib/lims/qc';
import { runStatus, sigmaMetric, zScore } from '@/lib/science/westgard';
import { LeveyJenningsChart, type LjDatum } from './LeveyJenningsChart';
import type { ToolProps } from './registry';

export function QcTool({ dict }: ToolProps) {
  const t = dict.tools.qc;
  const { state, run } = useLab();
  const [analyte, setAnalyte] = useState('GLU');
  const [values, setValues] = useState<Record<string, string>>({});
  const [corrective, setCorrective] = useState('');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [tea, setTea] = useState('10');
  const [bias, setBias] = useState('1');

  const view = useMemo(() => {
    if (!state) return null;
    const targets = targetsFor(state, analyte);
    const runs = runsFor(state, analyte);
    const violations = violationsFor(state, analyte);
    const chart: LjDatum[] = runs.map((r) => {
      const d: LjDatum = { run: r.id.slice(analyte.length + 1) };
      for (const p of r.points) {
        const target = targets.find((x) => x.level === p.level);
        if (target) d[p.level] = Math.max(-4, Math.min(4, zScore(p.value, target)));
      }
      return d;
    });
    const rows = runs
      .slice(-10)
      .reverse()
      .map((r) => ({
        run: r,
        status: runStatus(violations, r.id),
        rules: [...new Set(violations.filter((v) => v.runId === r.id).map((v) => v.rule))],
      }));
    return { analytes: analytesOf(state), targets, runs, chart, rows };
  }, [state, analyte]);

  if (!state || !view) return <p className="text-muted">{dict.demoBar.loading}</p>;

  const first = view.targets[0];
  const cvTarget = first ? (first.sd / first.mean) * 100 : null;
  const teaN = Number(tea.replace(',', '.'));
  const biasN = Number(bias.replace(',', '.'));
  const sigma = cvTarget && Number.isFinite(teaN) && Number.isFinite(biasN) ? sigmaMetric(teaN, biasN, cvTarget) : null;
  const sigmaText = sigma === null ? '' : sigma >= 6 ? t.sigmaHigh : sigma >= 4 ? t.sigmaMid : t.sigmaLow;

  async function onAddRun(e: FormEvent) {
    e.preventDefault();
    if (!view) return;
    const points = view.targets.map((tg) => {
      const raw = (values[tg.level] ?? '').trim().replace(',', '.');
      return { level: tg.level, value: raw === '' ? Number.NaN : Number(raw) };
    });
    const res = await run((s, u, at) => addQcRun(s, { analyte, points, correctiveAction: corrective }, u, at));
    if (res.ok) {
      setValues({});
      setCorrective('');
      setMessage({ ok: true, text: t.added });
    } else {
      setMessage({ ok: false, text: formatLabError(dict, res.error) });
    }
  }

  function exportRuns() {
    if (!view) return;
    const headers = ['run', 'date', ...view.targets.map((tg) => tg.level), 'status', 'corrective_action'];
    const violations = violationsFor(state!, analyte);
    const rows = view.runs.map((r) => [
      r.id,
      r.at,
      ...view.targets.map((tg) => r.points.find((p) => p.level === tg.level)?.value ?? null),
      runStatus(violations, r.id),
      r.correctiveAction ?? '',
    ]);
    downloadText(`qc-${analyte}.csv`, toCsv(headers, rows));
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className={`${card} space-y-4`}>
          <label className={label}>
            {t.analyte}
            <select
              data-testid="qc-analyte"
              className={`${input} mt-1`}
              value={analyte}
              onChange={(e) => {
                setAnalyte(e.target.value);
                setValues({});
                setMessage(null);
              }}
            >
              {view.analytes.map((a) => (
                <option key={a} value={a}>
                  {t.analytes[a] ?? a} ({a})
                </option>
              ))}
            </select>
          </label>
          <div>
            <h2 className="text-sm font-semibold">{t.targets}</h2>
            <div className={tableWrap}>
              <table className={`${table} mt-1`}>
                <thead>
                  <tr>
                    <th>{t.level}</th>
                    <th>{t.mean}</th>
                    <th>
                      <Term definition={t.sdDef}>{t.sd}</Term>
                    </th>
                    <th>
                      <Term definition={t.cvDef}>{t.cv}</Term>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {view.targets.map((tg) => (
                    <tr key={tg.level}>
                      <td>{tg.level}</td>
                      <td className="font-mono">{tg.mean}</td>
                      <td className="font-mono">{tg.sd}</td>
                      <td className="font-mono">{((tg.sd / tg.mean) * 100).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className={card}>
          <LeveyJenningsChart data={view.chart} levels={view.targets.map((tg) => tg.level)} title={t.chartTitle} />
        </div>
      </div>

      <div className={card}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">{t.runs}</h2>
          <button type="button" className={btnSecondary} onClick={exportRuns}>
            {t.export}
          </button>
        </div>
        <div className={`${tableWrap} mt-2`}>
          <table className={table}>
            <thead>
              <tr>
                <th>{t.run}</th>
                <th>{t.date}</th>
                {view.targets.map((tg) => (
                  <th key={tg.level}>{tg.level} (z)</th>
                ))}
                <th>{t.rules}</th>
                <th>{t.status}</th>
                <th>{t.corrective}</th>
              </tr>
            </thead>
            <tbody>
              {view.rows.map(({ run: r, status, rules }) => (
                <tr key={r.id}>
                  <td className="font-mono">{r.id}</td>
                  <td className="font-mono text-xs">{r.at.replace('T', ' ')}</td>
                  {view.targets.map((tg) => {
                    const p = r.points.find((x) => x.level === tg.level);
                    return (
                      <td key={tg.level} className="font-mono">
                        {p ? `${p.value} (${zScore(p.value, tg).toFixed(2)})` : t.none}
                      </td>
                    );
                  })}
                  <td className="font-mono">{rules.join(', ') || t.none}</td>
                  <td>
                    <StatusChip tone={runTone(status)} testId={`run-status-${r.id}`}>
                      {dict.runStatus[status]}
                    </StatusChip>
                  </td>
                  <td className="text-xs">{r.correctiveAction ?? t.none}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={onAddRun} className={`${card} space-y-3`}>
          <h2 className="font-semibold">{t.newRun}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {view.targets.map((tg) => (
              <label key={tg.level} className={label}>
                {t.level} {tg.level} ({t.mean} {tg.mean})
                <input
                  data-testid={`new-run-${tg.level}`}
                  inputMode="decimal"
                  className={`${input} mt-1`}
                  value={values[tg.level] ?? ''}
                  onChange={(e) => setValues({ ...values, [tg.level]: e.target.value })}
                  required
                />
              </label>
            ))}
          </div>
          <label className={label}>
            {t.correctiveLabel}
            <textarea
              data-testid="corrective-action"
              className={`${input} mt-1`}
              rows={2}
              placeholder={t.correctivePlaceholder}
              value={corrective}
              onChange={(e) => setCorrective(e.target.value)}
            />
          </label>
          <button type="submit" data-testid="add-run" className={btnPrimary}>
            {t.addRun}
          </button>
          {message && (
            <p role="status" data-testid="qc-message" className={`text-sm ${message.ok ? 'text-ok' : 'text-danger'}`}>
              {message.text}
            </p>
          )}
        </form>

        <div className={`${card} space-y-3`}>
          <h2 className="font-semibold">{t.sigmaTitle}</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className={label}>
              {t.tea}
              <input className={`${input} mt-1`} inputMode="decimal" value={tea} onChange={(e) => setTea(e.target.value)} />
            </label>
            <label className={label}>
              {t.bias}
              <input className={`${input} mt-1`} inputMode="decimal" value={bias} onChange={(e) => setBias(e.target.value)} />
            </label>
            <div className="text-sm">
              <p className="font-medium">{t.cvFromTarget}</p>
              <p className="mt-2 font-mono">{cvTarget?.toFixed(2) ?? t.none}</p>
            </div>
          </div>
          {sigma !== null && (
            <p className="text-sm">
              <span className="font-semibold">
                {t.sigmaResult} = {sigma.toFixed(2)}
              </span>{' '}
              — {sigmaText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
