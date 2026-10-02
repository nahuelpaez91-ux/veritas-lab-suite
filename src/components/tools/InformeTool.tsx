'use client';

import Link from 'next/link';
import { useState } from 'react';
import { nowIso, useLab } from '@/components/lab/LabStoreProvider';
import { StatusChip } from '@/components/lab/StatusChip';
import { btnPrimary, card } from '@/components/ui/styles';
import { downloadBlob } from '@/lib/export/csv';
import { buildReportData } from '@/lib/lims/report';
import { ToolLoading } from './Placeholders';
import type { ToolProps } from './registry';

export function InformeTool({ dict, lang }: ToolProps) {
  const t = dict.tools.informe;
  const { state } = useLab();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  if (!state) return <ToolLoading text={dict.demoBar.loading} className="min-h-[14rem] sm:min-h-[12rem] lg:min-h-[6.5rem]" />;
  const lab = state;
  const released = lab.samples.filter((s) => s.status === 'released');
  const pending = lab.samples.filter((s) => s.status !== 'released');

  async function download(sampleId: string) {
    setBusy(sampleId);
    setError('');
    try {
      const [{ pdf }, { ReportDocument }] = await Promise.all([import('@react-pdf/renderer'), import('./ReportDocument')]);
      const data = buildReportData(lab, sampleId, nowIso());
      const matrixLabel = dict.tools.custodia.matrices[data.matrix] ?? data.matrix;
      const blob = await pdf(<ReportDocument data={data} labels={t.pdf} matrixLabel={matrixLabel} />).toBlob();
      downloadBlob(`informe-${sampleId}.pdf`, blob);
    } catch {
      setError(t.error);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
      <div className={card}>
        <h2 className="font-semibold">{t.released}</h2>
        {released.length === 0 ? (
          <p className="mt-2 text-sm text-muted">{t.none}</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {released.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  <span className="font-mono">{s.id}</span> · {s.patientName}
                </span>
                <button
                  type="button"
                  data-testid={`download-report-${s.id}`}
                  className={btnPrimary}
                  disabled={busy !== null}
                  onClick={() => download(s.id)}
                >
                  {busy === s.id ? t.generating : t.download}
                </button>
              </li>
            ))}
          </ul>
        )}
        {error && (
          <p role="alert" className="mt-3 text-sm text-danger">
            {error}
          </p>
        )}
      </div>
      <div className={card}>
        <h2 className="font-semibold">{t.pending}</h2>
        {pending.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            {t.pendingNone}{' '}
            <Link href={`/${lang}/modulos/enlace`} className="font-mono text-ink underline decoration-accent underline-offset-4 hover:text-accent">
              {t.start}&nbsp;<span aria-hidden="true">→</span>
            </Link>
          </p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {pending.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-2">
                <span className="font-mono">{s.id}</span>
                <StatusChip tone="neutral">{dict.sampleStatus[s.status]}</StatusChip>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
