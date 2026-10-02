import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CredentialsBrowser, type DocView } from '@/components/credentials/CredentialsBrowser';
import { DocHeader } from '@/components/module/DocHeader';
import { credentialDocs, imageSize } from '@/content/credentials';
import { validationSummary } from '@/content/validation/summary';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

type Params = Promise<{ lang: string }>;

const DOC_CODE = 'ANP-CRE-001';

/** Rellena «{clave}» en los textos del diccionario (los diccionarios no llevan funciones). */
function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in values ? String(values[k]) : m));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang).credentials;
  return { title: t.title, description: t.metaDescription };
}

export default async function CredentialsPage({ params }: { params: Params }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang).credentials;
  const s = validationSummary();
  const size = (src: string) => {
    const [w, h] = imageSize[src] ?? [1600, 1131];
    return { w, h };
  };

  const docs: DocView[] = credentialDocs.map((d) => {
    const title = d.title[lang];
    return {
      slug: d.slug,
      kind: d.kind,
      kindLabel: t.kind[d.kind],
      title,
      issuer: d.issuer[lang],
      year: d.year,
      yearText: d.yearLabel?.[lang] ?? String(d.year),
      hours: d.hours ? `${d.hours} ${t.hours}` : undefined,
      pagesLabel: d.pages.length === 1 ? t.pageOne : fill(t.pageMany, { n: d.pages.length }),
      pages: d.pages.map((src, i) => {
        const label = fill(t.viewer.page, { n: i + 1, total: d.pages.length });
        return { src, ...size(src), alt: `${d.alt[lang]} · ${label}`, label };
      }),
      thumb: { src: d.thumb, ...size(d.thumb) },
      pdf: d.pdf,
      pdfLabel: fill(t.actions.pdfLabel, { title }),
      verifyUrl: d.verifyUrl,
      verifyLabel: d.verifyUrl ? fill(t.actions.verifyLabel, { title }) : undefined,
    };
  });
  const n = (k: DocView['kind']) => docs.filter((d) => d.kind === k).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <header className="border border-ink bg-surface">
        <DocHeader
          cells={[
            { label: t.doc.document, value: t.title, title: true },
            { label: t.doc.code, value: <span className="text-accent">{DOC_CODE}</span> },
            { label: t.doc.revision, value: s.commit || '—' },
            { label: t.doc.effective, value: s.date || '—' },
            {
              label: t.doc.contents,
              // Espacio duro antes de cada «·»: si el valor se parte, la línea nueva no empieza con el separador.
              value: fill(t.contentsValue, { t: n('titulo'), a: n('analitico'), c: n('certificado') }).replace(/ · /g, '\u00a0· '),
            },
          ]}
        />
        <div className="grid gap-6 px-4 py-7 sm:px-6 md:py-9 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-12">
          <div>
            <p className="font-mono text-xs tracking-[0.02em] text-accent">{t.eyebrow}</p>
            <h1 className="mt-3 text-[2.25rem] font-semibold leading-[1.05] tracking-[-0.02em] [font-variation-settings:'opsz'_60] [text-wrap:balance] md:text-5xl">
              {t.title}
            </h1>
            <p className="mt-4 max-w-[60ch] text-lg leading-relaxed">{t.intro}</p>
          </div>
          <p className="self-end border-t border-dashed border-line pt-3 font-mono text-[0.75rem] leading-relaxed text-muted lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            {t.privacy}
          </p>
        </div>
      </header>

      <div className="mt-10">
        <CredentialsBrowser
          docs={docs}
          labels={{
            filterLabel: t.filterLabel,
            filters: t.filters,
            view: t.actions.view,
            pdf: t.actions.pdf,
            verify: t.actions.verify,
            close: t.viewer.close,
            openPdf: t.viewer.openPdf,
          }}
        />
      </div>
    </div>
  );
}
