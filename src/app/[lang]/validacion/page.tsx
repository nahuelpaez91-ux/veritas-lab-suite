import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StatusChip } from '@/components/lab/StatusChip';
import { PrintButton } from '@/components/ui/PrintButton';
import { card, h2, table, tableWrap } from '@/components/ui/styles';
import { profile } from '@/content/profile';
import traceability from '@/content/validation/traceability.json';
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

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-semibold">{t.title}</h1>
          <p className="mt-2 text-muted">{t.intro}</p>
        </div>
        <PrintButton label={t.print} />
      </header>

      <section className={card}>
        <h2 className={h2}>{t.oqTitle}</h2>
        <p className="mt-2 text-sm" data-testid="oq-summary">
          {traceability.generatedAt
            ? t.oq
                .replace('{date}', traceability.generatedAt.slice(0, 10))
                .replace('{commit}', traceability.commit)
                .replace('{passed}', String(passed))
                .replace('{failed}', String(failed))
                .replace('{total}', String(tests.length))
            : t.notRun}
        </p>
      </section>

      <section className={card}>
        <h2 className={h2}>{t.scopeTitle}</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {t.scope.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>

      <section className={card}>
        <h2 className={h2}>{t.ursTitle}</h2>
        <p className="mt-1 text-xs text-muted">{t.riskLegend}</p>
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
                    <td className="font-mono">{u.id}</td>
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
                            <a key={x.title} className="block text-accent hover:underline" href={`${profile.repo}/blob/main/${x.file}`}>
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

      <section className={card}>
        <h2 className={h2}>{t.changeTitle}</h2>
        <p className="mt-2 text-sm">{t.change}</p>
        <a className="mt-2 inline-block text-sm text-accent hover:underline" href={`${profile.repo}/commits/main`}>
          {t.changeLink} →
        </a>
      </section>
    </div>
  );
}
