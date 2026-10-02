import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StatusChip } from '@/components/lab/StatusChip';
import { PrintButton } from '@/components/ui/PrintButton';
import { DocHeader, SectionHead } from '@/components/module/DocHeader';
import { table, tableWrap } from '@/components/ui/styles';
import { profile } from '@/content/profile';
import traceability from '@/content/validation/traceability.json';
import { validationSummary } from '@/content/validation/summary';
import { URS } from '@/content/validation/urs';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

type Params = Promise<{ lang: string }>;
type TraceTest = { ids: string[]; title: string; file: string; status: string };

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getDictionary(lang).validation.title };
}

export default async function ValidationPage({ params }: { params: Params }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang).validation;
  const tests = traceability.tests as TraceTest[];
  const passed = tests.filter((x) => x.status === 'passed').length;
  const failed = tests.length - passed;
  const riskOf = (rpn: number) => (rpn >= 12 ? 'high' : rpn >= 6 ? 'medium' : 'low') as 'high' | 'medium' | 'low';

  const summary = validationSummary();
  const hasRun = Boolean(traceability.generatedAt);
  const allPassed = hasRun && tests.length > 0 && failed === 0;

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-8">
      <header className="border border-ink bg-surface">
        <DocHeader
          cells={[
            { label: t.doc.document, value: t.title, title: true },
            { label: t.doc.code, value: <span className="text-accent">ANP-VAL-001</span> },
            { label: t.doc.revision, value: summary.commit || '—' },
            { label: t.doc.effective, value: summary.date || '—' },
            { label: t.doc.scope, value: t.doc.scopeValue },
          ]}
        />
        <div className="flex flex-wrap items-end justify-between gap-4 px-4 py-6 sm:px-6">
          <div className="max-w-3xl">
            <p className="font-mono text-xs tracking-[0.04em] text-accent">ANP-VAL-001 · GAMP 5</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">{t.title}</h1>
            <p className="mt-3 text-lg leading-relaxed">{t.intro}</p>
          </div>
          <PrintButton label={t.print} />
        </div>
      </header>

      <section aria-labelledby="oq-title">
        <SectionHead n="1" id="oq-title" title={t.oqTitle} note={t.docTitle} />
        <dl className="grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))]">
          <div className="col-span-2 bg-surface px-4 py-4 lg:col-span-1">
            <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-muted">{t.oqPassed}</dt>
            <dd className={`mt-1 font-mono text-5xl font-semibold tracking-tight [font-variant-numeric:tabular-nums] ${allPassed ? 'text-ok' : 'text-danger'}`}>
              {passed}/{tests.length}
            </dd>
          </div>
          {[
            [t.oqFailed, String(failed)],
            [t.oqCommit, summary.commit || '—'],
            [t.oqDate, summary.date || '—'],
          ].map(([k, v]) => (
            <div key={k} className="bg-surface px-4 py-4">
              <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-muted">{k}</dt>
              <dd className="mt-2 font-mono text-xl font-semibold [font-variant-numeric:tabular-nums]">{v}</dd>
            </div>
          ))}
          <div className="bg-surface px-4 py-4">
            <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-muted">{t.oqVerdict}</dt>
            <dd className="mt-2">
              <StatusChip tone={!hasRun ? 'neutral' : allPassed ? 'ok' : 'danger'}>
                {!hasRun ? t.doc.noData : allPassed ? t.doc.conforme : t.doc.noConforme}
              </StatusChip>
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-sm text-muted" data-testid="oq-summary">
          {hasRun
            ? t.oq
                .replace('{date}', traceability.generatedAt.slice(0, 10))
                .replace('{commit}', traceability.commit)
                .replace('{passed}', String(passed))
                .replace('{failed}', String(failed))
                .replace('{total}', String(tests.length))
            : t.notRun}
        </p>
      </section>

      <section aria-labelledby="scope-title">
        <SectionHead n="2" id="scope-title" title={t.scopeTitle} />
        <ol className="mt-3 space-y-2 text-[0.95rem] leading-relaxed">
          {t.scope.map((s, i) => (
            <li key={s} className="grid grid-cols-[2.5rem_minmax(0,1fr)]">
              <span className="font-mono text-xs text-muted">2.{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="urs-title">
        <SectionHead n="3" id="urs-title" title={t.ursTitle} note={`${URS.length} URS`} />
        <p className="mt-2 font-mono text-xs text-muted">{t.riskLegend}</p>
        <div className={`${tableWrap} mt-3`}>
          <table className={`${table} text-xs`}>
            <thead>
              <tr>
                <th>{t.cols.id}</th>
                <th>{t.cols.requirement}</th>
                <th>{t.cols.s}</th>
                <th>{t.cols.p}</th>
                <th>{t.cols.d}</th>
                <th>{t.cols.rpn}</th>
                <th>{t.cols.risk}</th>
                <th>{t.cols.tests}</th>
                <th>{t.cols.status}</th>
              </tr>
            </thead>
            <tbody>
              {URS.map((u) => {
                const rpn = u.s * u.p * u.d;
                const risk = riskOf(rpn);
                const evidence = tests.filter((x) => x.ids.includes(u.id));
                const ok = evidence.length > 0 && evidence.every((x) => x.status === 'passed');
                return (
                  <tr key={u.id}>
                    <td className="font-mono whitespace-nowrap">{u.id}</td>
                    <td>{u[lang]}</td>
                    <td>{u.s}</td>
                    <td>{u.p}</td>
                    <td>{u.d}</td>
                    <td className="font-mono">{rpn}</td>
                    <td>
                      <StatusChip tone={risk === 'high' ? 'danger' : risk === 'medium' ? 'warn' : 'neutral'}>{t.risk[risk]}</StatusChip>
                    </td>
                    <td>
                      {evidence.length === 0
                        ? t.noEvidence
                        : evidence.map((x) => (
                            <a key={x.title} className="block text-accent underline-offset-2 hover:underline" href={`${profile.repo}/blob/main/${x.file}`}>
                              {x.title}
                            </a>
                          ))}
                    </td>
                    <td>
                      <StatusChip tone={ok ? 'ok' : 'danger'}>{ok ? t.passed : evidence.length === 0 ? t.noEvidence : t.failed}</StatusChip>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="change-title">
        <SectionHead n="4" id="change-title" title={t.changeTitle} />
        <p className="mt-3 max-w-3xl text-[0.95rem] leading-relaxed">{t.change}</p>
        <a className="mt-2 inline-block font-mono text-sm text-accent underline-offset-2 hover:underline" href={`${profile.repo}/commits/main`}>
          {t.changeLink} →
        </a>
      </section>
    </div>
  );
}
