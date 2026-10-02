'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatLabError, useLab } from '@/components/lab/LabStoreProvider';
import { StatusChip } from '@/components/lab/StatusChip';
import { btnPrimary, btnSecondary, card, label, table, tableWrap } from '@/components/ui/styles';
import { ASTM_EXAMPLE, HL7_EXAMPLE } from '@/lib/lis/examples';
import { parseMessage } from '@/lib/lis/parse';
import type { ParseOutcome } from '@/lib/lis/types';
import { importResults } from '@/lib/lims/actions';
import type { ToolProps } from './registry';

export function EnlaceTool({ dict, lang }: ToolProps) {
  const t = dict.tools.enlace;
  const { state, run } = useLab();
  const [raw, setRaw] = useState('');
  const [outcome, setOutcome] = useState<ParseOutcome | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const hasErrors = outcome?.issues.some((i) => i.severity === 'error') ?? false;

  function load(example: string) {
    setRaw(example.replace(/\r/g, '\n'));
    setOutcome(null);
    setNotice(null);
  }

  async function onImport() {
    if (!outcome) return;
    const parsed = outcome;
    const res = await run((s, u, at) => importResults(s, parsed.results, parsed.format, u, at));
    setNotice(
      res.ok
        ? { ok: true, text: t.imported.replace('{n}', String(parsed.results.length)) }
        : { ok: false, text: formatLabError(dict, res.error) },
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className={card}>
        <div className="flex flex-wrap gap-2">
          <button type="button" data-testid="load-astm-example" className={btnSecondary} onClick={() => load(ASTM_EXAMPLE)}>
            {t.loadAstm}
          </button>
          <button type="button" data-testid="load-hl7-example" className={btnSecondary} onClick={() => load(HL7_EXAMPLE)}>
            {t.loadHl7}
          </button>
        </div>
        <label htmlFor="raw-message" className={`${label} mt-4`}>
          {t.messageLabel}
        </label>
        <textarea
          id="raw-message"
          data-testid="raw-message"
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            setOutcome(null);
            setNotice(null);
          }}
          rows={12}
          spellCheck={false}
          className="mt-1 w-full rounded-md border border-line bg-bg p-2 font-mono text-xs"
        />
        <p className="mt-1 text-xs text-muted">{t.frames}</p>
        <button
          type="button"
          data-testid="parse-message"
          className={`${btnPrimary} mt-3`}
          disabled={!raw.trim()}
          onClick={() => {
            setOutcome(parseMessage(raw));
            setNotice(null);
          }}
        >
          {t.parse}
        </button>
      </div>

      <div className={card}>
        {!outcome ? (
          <p className="text-sm text-muted">{t.empty}</p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <StatusChip tone="neutral">
                {t.format}: {outcome.format === 'astm' ? 'ASTM E1394' : 'HL7 v2'}
              </StatusChip>
              {outcome.sender && (
                <StatusChip tone="neutral">
                  {t.sender}: {outcome.sender}
                </StatusChip>
              )}
            </div>
            <section>
              <h2 className="text-sm font-semibold">{t.issuesTitle}</h2>
              {outcome.issues.length === 0 ? (
                <p className="mt-1 text-sm text-ok">{t.noIssues}</p>
              ) : (
                <ul className="mt-1 space-y-1 text-sm" data-testid="parse-issues">
                  {outcome.issues.map((issue, k) => (
                    <li key={k} className={issue.severity === 'error' ? 'text-danger' : 'text-warn'}>
                      {t.line} {issue.line}: {t.issues[issue.code]}
                      {issue.detail ? ` (${issue.detail})` : ''}
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <div className={tableWrap}>
              <table className={table}>
                <thead>
                  <tr>
                    <th>{t.cols.specimen}</th>
                    <th>{t.cols.patient}</th>
                    <th>{t.cols.test}</th>
                    <th>{t.cols.loinc}</th>
                    <th>{t.cols.value}</th>
                    <th>{t.cols.units}</th>
                    <th>{t.cols.range}</th>
                    <th>{t.cols.flag}</th>
                    <th>{t.cols.completed}</th>
                  </tr>
                </thead>
                <tbody>
                  {outcome.results.map((r) => (
                    <tr key={`${r.specimenId}:${r.testCode}`} data-testid="parsed-row">
                      <td className="font-mono">{r.specimenId}</td>
                      <td>
                        {r.patientName} <span className="text-muted">({r.patientId})</span>
                      </td>
                      <td className="font-mono">{r.testCode}</td>
                      <td className="font-mono">{r.loinc ?? '—'}</td>
                      <td className="font-mono">{r.rawValue}</td>
                      <td>{r.units}</td>
                      <td>{r.referenceRange}</td>
                      <td>{r.flag}</td>
                      <td className="font-mono text-xs">{r.completedAt ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              data-testid="import-results"
              className={btnPrimary}
              disabled={hasErrors || outcome.results.length === 0 || !state}
              onClick={onImport}
            >
              {t.import}
            </button>
            {notice && (
              <p role="status" data-testid={notice.ok ? 'import-ok' : 'import-error'} className={`text-sm ${notice.ok ? 'text-ok' : 'text-danger'}`}>
                {notice.text}{' '}
                {notice.ok && (
                  <Link className="underline" href={`/${lang}/modulos/qc`}>
                    {t.next}
                  </Link>
                )}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
