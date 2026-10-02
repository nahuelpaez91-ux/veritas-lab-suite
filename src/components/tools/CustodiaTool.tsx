'use client';

import QRCode from 'qrcode';
import { useEffect, useState, type FormEvent } from 'react';
import { formatLabError, useLab } from '@/components/lab/LabStoreProvider';
import { SignDialog } from '@/components/lab/SignDialog';
import { runTone, StatusChip, type ChipTone } from '@/components/lab/StatusChip';
import { btnPrimary, btnSecondary, card, input, label, table, tableWrap } from '@/components/ui/styles';
import { downloadText, toCsv } from '@/lib/export/csv';
import { registerSample, rerunSample } from '@/lib/lims/actions';
import { verifyChain } from '@/lib/lims/audit';
import type { SampleStatus, SignatureMeaning } from '@/lib/lims/model';
import { statusOfRun } from '@/lib/lims/qc';
import { checkRelease } from '@/lib/lims/release';
import type { ToolProps } from './registry';

const sampleTone: Record<SampleStatus, ChipTone> = {
  received: 'neutral',
  in_analysis: 'warn',
  reviewed: 'warn',
  released: 'ok',
  rejected: 'danger',
};
const MATRICES = ['suero', 'plasma', 'sangre', 'orina'];
const EMPTY_FORM = { id: '', patientId: '', patientName: '', matrix: 'suero' };

export function CustodiaTool({ dict }: ToolProps) {
  const t = dict.tools.custodia;
  const { state, run } = useLab();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [signing, setSigning] = useState<SignatureMeaning | null>(null);
  const [rerunOpen, setRerunOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [chain, setChain] = useState<{ valid: boolean; text: string } | null>(null);
  const [qr, setQr] = useState<{ id: string; url: string } | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!state) return;
    let cancelled = false;
    verifyChain(state.audit).then((r) => {
      if (cancelled) return;
      setChain(
        r.valid
          ? { valid: true, text: t.chainOk.replace('{n}', String(state.audit.length)) }
          : { valid: false, text: t.chainBroken.replace('{seq}', String(r.brokenAt)) },
      );
    });
    return () => {
      cancelled = true;
    };
  }, [state, t]);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    QRCode.toDataURL(selectedId, { margin: 1, width: 132 })
      .then((url) => {
        if (!cancelled) setQr({ id: selectedId, url });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  if (!state) return <p className="text-muted">{dict.demoBar.loading}</p>;
  const lab = state;
  const sample = lab.samples.find((s) => s.id === selectedId) ?? null;
  const results = sample ? lab.results.filter((r) => r.sampleId === sample.id) : [];
  const release = sample ? checkRelease(lab, sample.id) : null;
  const timeline = sample
    ? lab.audit.filter((e) => e.entityId === sample.id || e.entityId.startsWith(`${sample.id}:`))
    : [];
  const qrUrl = qr && qr.id === selectedId ? qr.url : '';

  async function onRegister(e: FormEvent) {
    e.preventDefault();
    const input = { ...form };
    const res = await run((s, u, at) => registerSample(s, input, u, at));
    if (res.ok) {
      setSelectedId(input.id.trim());
      setForm(EMPTY_FORM);
      setMessage({ ok: true, text: t.registered });
    } else {
      setMessage({ ok: false, text: formatLabError(dict, res.error) });
    }
  }

  async function onRerun() {
    if (!sample) return;
    const id = sample.id;
    const res = await run((s, u, at) => rerunSample(s, id, reason, u, at));
    if (res.ok) {
      setRerunOpen(false);
      setReason('');
      setMessage({ ok: true, text: t.rerunDone });
    } else {
      setMessage({ ok: false, text: formatLabError(dict, res.error) });
    }
  }

  function exportAudit() {
    downloadText(
      'audit-trail.csv',
      toCsv(
        ['seq', 'at_utc', 'actor', 'action', 'entity', 'entity_id', 'reason', 'prev_hash', 'hash'],
        lab.audit.map((e) => [e.seq, e.at, e.actor, e.action, e.entity, e.entityId, e.reason ?? '', e.prevHash, e.hash]),
      ),
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="space-y-6">
          <div className={card}>
            <h2 className="font-semibold">{t.samples}</h2>
            {lab.samples.length === 0 ? (
              <p className="mt-2 text-sm text-muted">{t.noSamples}</p>
            ) : (
              <div className={`${tableWrap} mt-2`}>
                <table className={table}>
                  <thead>
                    <tr>
                      <th>{t.sampleId}</th>
                      <th>{t.patientName}</th>
                      <th>{t.status}</th>
                      <th>{t.revision}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lab.samples.map((s) => (
                      <tr key={s.id} className={s.id === selectedId ? 'bg-accent-soft' : undefined}>
                        <td>
                          <button
                            type="button"
                            data-testid={`sample-${s.id}`}
                            className="font-mono text-accent underline"
                            onClick={() => {
                              setSelectedId(s.id);
                              setMessage(null);
                              setRerunOpen(false);
                            }}
                          >
                            {s.id}
                          </button>
                        </td>
                        <td>{s.patientName}</td>
                        <td>
                          <StatusChip tone={sampleTone[s.status]}>{dict.sampleStatus[s.status]}</StatusChip>
                        </td>
                        <td className="font-mono">{s.revision}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <form onSubmit={onRegister} className={`${card} space-y-3`}>
            <h2 className="font-semibold">{t.register}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={label}>
                {t.sampleId}
                <input className={`${input} mt-1`} value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} required />
              </label>
              <label className={label}>
                {t.patientId}
                <input className={`${input} mt-1`} value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} required />
              </label>
              <label className={label}>
                {t.patientName}
                <input className={`${input} mt-1`} value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} required />
              </label>
              <label className={label}>
                {t.matrix}
                <select className={`${input} mt-1`} value={form.matrix} onChange={(e) => setForm({ ...form, matrix: e.target.value })}>
                  {MATRICES.map((m) => (
                    <option key={m} value={m}>
                      {t.matrices[m]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button type="submit" className={btnSecondary}>
              {t.registerBtn}
            </button>
          </form>
        </div>

        <div className={card}>
          {!sample ? (
            <p className="text-sm text-muted">{t.select}</p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-mono text-lg font-semibold">{sample.id}</h2>
                  <p className="text-sm text-muted">
                    {sample.patientName} ({sample.patientId}) · {t.matrices[sample.matrix] ?? sample.matrix} · {t.revision} {sample.revision}
                  </p>
                  <p className="mt-2">
                    <StatusChip tone={sampleTone[sample.status]} testId="sample-status">
                      {dict.sampleStatus[sample.status]}
                    </StatusChip>
                  </p>
                </div>
                {qrUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- data URL generada en el cliente
                  <img src={qrUrl} alt={`${t.qrLabel}: ${sample.id}`} width={96} height={96} className="rounded border border-line bg-white p-1" />
                )}
              </div>

              <div className={tableWrap}>
                <table className={table}>
                  <thead>
                    <tr>
                      <th>{t.test}</th>
                      <th>{t.value}</th>
                      <th>{t.flag}</th>
                      <th>{t.qcRun}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => {
                      const st = r.runId ? statusOfRun(lab, r.runId) : null;
                      return (
                        <tr key={r.id}>
                          <td className="font-mono">{r.testCode}</td>
                          <td className="font-mono">
                            {r.rawValue} {r.units}
                          </td>
                          <td>{r.flag}</td>
                          <td>
                            <span className="font-mono text-xs">{r.runId || t.noRun}</span>{' '}
                            {st && <StatusChip tone={runTone(st)}>{dict.runStatus[st]}</StatusChip>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {release && (
                <div data-testid="release-check" className={`rounded-lg border p-3 text-sm ${release.ok ? 'border-ok/40 bg-ok/10' : 'border-danger/40 bg-danger/10'}`}>
                  <p className="font-semibold">{t.releaseCheck}</p>
                  {release.ok ? (
                    <p>{t.releaseOk}</p>
                  ) : (
                    <ul className="list-disc pl-5">
                      {release.blockingRuns.length > 0 && (
                        <li>
                          {t.blockingRuns}: <span className="font-mono">{release.blockingRuns.join(', ')}</span>
                        </li>
                      )}
                      {release.missingQc.length > 0 && (
                        <li>
                          {t.missingQc}: <span className="font-mono">{release.missingQc.join(', ')}</span>
                        </li>
                      )}
                      {release.notFinal.length > 0 && (
                        <li>
                          {t.notFinal}: <span className="font-mono">{release.notFinal.join(', ')}</span>
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button type="button" data-testid="sign-reviewed" className={btnSecondary} onClick={() => setSigning('reviewed')}>
                  {t.signReviewed}
                </button>
                <button type="button" data-testid="sign-approved" className={btnPrimary} onClick={() => setSigning('approved')}>
                  {t.signApproved}
                </button>
                <button type="button" data-testid="rerun-sample" className={btnSecondary} onClick={() => setRerunOpen(true)}>
                  {t.rerun}
                </button>
              </div>

              {rerunOpen && (
                <div className="flex flex-wrap items-end gap-2">
                  <label className={`${label} grow`}>
                    {t.rerunReason}
                    <input data-testid="rerun-reason" className={`${input} mt-1`} value={reason} onChange={(e) => setReason(e.target.value)} />
                  </label>
                  <button type="button" data-testid="rerun-confirm" className={btnPrimary} onClick={onRerun}>
                    {t.rerunConfirm}
                  </button>
                  <button type="button" className={btnSecondary} onClick={() => setRerunOpen(false)}>
                    {t.cancel}
                  </button>
                </div>
              )}

              {message && (
                <p role="status" data-testid="custodia-message" className={`text-sm ${message.ok ? 'text-ok' : 'text-danger'}`}>
                  {message.text}
                </p>
              )}

              <section>
                <h3 className="text-sm font-semibold">{t.timeline}</h3>
                <ol className="mt-2 space-y-1 border-l border-line pl-4 text-xs">
                  {timeline.map((e) => (
                    <li key={e.seq}>
                      <span className="font-mono text-muted">
                        #{e.seq} · {e.at.replace('T', ' ')}
                      </span>{' '}
                      <span className="font-semibold">{e.action}</span> · {e.actor}
                      {e.reason ? ` · «${e.reason}»` : ''}
                    </li>
                  ))}
                </ol>
              </section>

              <SignDialog
                key={signing ?? 'closed'}
                dict={dict}
                sampleId={sample.id}
                meaning={signing}
                onClose={(signed) => {
                  setSigning(null);
                  if (signed) setMessage({ ok: true, text: t.signed });
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div className={`${card} space-y-3`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          {chain && (
            <StatusChip tone={chain.valid ? 'ok' : 'danger'} testId="audit-chain-status">
              {chain.text}
            </StatusChip>
          )}
          <button type="button" className={btnSecondary} onClick={exportAudit}>
            {t.exportAudit}
          </button>
        </div>
        <details>
          <summary className="cursor-pointer text-sm font-semibold">{t.auditAll}</summary>
          <div className={`${tableWrap} mt-2`}>
            <table className={`${table} text-xs`}>
              <thead>
                <tr>
                  <th>{t.cols.seq}</th>
                  <th>{t.cols.at}</th>
                  <th>{t.cols.actor}</th>
                  <th>{t.cols.action}</th>
                  <th>{t.cols.entity}</th>
                  <th>{t.cols.reason}</th>
                  <th>{t.cols.hash}</th>
                </tr>
              </thead>
              <tbody>
                {[...lab.audit].reverse().map((e) => (
                  <tr key={e.seq}>
                    <td className="font-mono">{e.seq}</td>
                    <td className="font-mono">{e.at.replace('T', ' ')}</td>
                    <td>{e.actor}</td>
                    <td className="font-mono">{e.action}</td>
                    <td className="font-mono">{e.entityId}</td>
                    <td>{e.reason ?? ''}</td>
                    <td className="font-mono" title={e.hash}>
                      {e.hash.slice(0, 12)}…
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
        <section>
          <h3 className="text-sm font-semibold">{t.alcoaTitle}</h3>
          <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
            {t.alcoa.map((item) => (
              <li key={item}>✔ {item}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
