import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DocHeader, SectionHead } from '@/components/module/DocHeader';
import { validationSummary } from '@/content/validation/summary';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getDictionary(lang).aiPolicy.title };
}

export default async function AiPolicyPage({ params }: { params: Params }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.aiPolicy;
  const d = dict.validation.doc;
  const summary = validationSummary();
  const refsN = String(t.sections.length + 1);
  return (
    <div className="mx-auto max-w-4xl space-y-12 px-4 py-8">
      <header className="border border-ink bg-surface">
        <DocHeader
          cells={[
            { label: d.document, value: t.title, title: true },
            { label: d.code, value: <span className="text-accent">ANP-IA-001</span> },
            { label: d.revision, value: summary.commit || '—' },
            { label: d.effective, value: summary.date || '—' },
          ]}
        />
        <div className="px-4 py-6 sm:px-6">
          <p className="font-mono text-xs tracking-[0.04em] text-accent">ANP-IA-001 · EU GMP {lang === 'es' ? 'Anexo' : 'Annex'} 22 · GAMP</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">{t.title}</h1>
          <p className="mt-3 max-w-3xl text-lg leading-relaxed">{t.intro}</p>
        </div>
      </header>

      {t.sections.map((s, i) => (
        <section key={s.title} aria-labelledby={`ai-s${i + 1}`}>
          <SectionHead n={String(i + 1)} id={`ai-s${i + 1}`} title={s.title} />
          <ol className="mt-3 space-y-2 text-[0.95rem] leading-relaxed">
            {s.items.map((item, j) => (
              <li key={item} className="grid grid-cols-[2.5rem_minmax(0,1fr)]">
                <span className="font-mono text-xs text-muted">
                  {i + 1}.{j + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <section aria-labelledby="ai-refs">
        <SectionHead n={refsN} id="ai-refs" title={t.refsTitle} />
        <ol className="mt-3 space-y-1.5 text-sm text-muted">
          {t.refs.map((r, j) => (
            <li key={r} className="grid grid-cols-[2.5rem_minmax(0,1fr)]">
              <span className="font-mono text-xs">[{j + 1}]</span>
              <span>{r}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
