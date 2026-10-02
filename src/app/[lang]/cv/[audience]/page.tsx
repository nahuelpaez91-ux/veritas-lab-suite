import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PrintButton } from '@/components/ui/PrintButton';
import { audiences, cvPdfName, getCv, isAudience } from '@/content/cv';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

type Params = Promise<{ lang: string; audience: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return audiences.map((audience) => ({ audience }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, audience } = await params;
  if (!isLocale(lang) || !isAudience(audience)) return {};
  return { title: `CV · ${getDictionary(lang).cv.audiences[audience]}` };
}

export default async function CvPage({ params }: { params: Params }) {
  const { lang, audience } = await params;
  if (!isLocale(lang) || !isAudience(audience)) notFound();
  const t = getDictionary(lang).cv;
  const cv = getCv(lang, audience);

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 text-[15px] leading-snug print:max-w-none print:px-0 print:py-0 print:text-[9pt] print:leading-[1.25]">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm print:hidden" aria-label={t.variant}>
        <span className="text-muted">{t.variant}:</span>
        {audiences.map((a) => (
          <Link
            key={a}
            href={`/${lang}/cv/${a}`}
            className={`rounded-full border px-3 py-1 ${a === audience ? 'border-accent bg-accent-soft text-accent' : 'border-line'}`}
          >
            {t.audiences[a]}
          </Link>
        ))}
        <a className="ml-auto text-accent underline" href={`/cv/${cvPdfName(audience, lang)}`} download>
          {t.download}
        </a>
        <PrintButton label={t.print} />
      </nav>

      <header className="print:mb-1">
        <h1 className="text-3xl font-semibold print:text-[15pt] print:leading-tight">{cv.name}</h1>
        <p className="mt-1 text-lg font-medium text-accent print:mt-0.5 print:text-[9.5pt]">{cv.headline}</p>
        <p className="mt-2 text-sm print:mt-1 print:text-[8pt]">
          {cv.contact.map((c, i) => (
            <span key={c.label}>
              {i > 0 && ' · '}
              {c.href ? (
                <a className="hover:underline" href={c.href}>
                  {c.label}
                </a>
              ) : (
                c.label
              )}
            </span>
          ))}
        </p>
      </header>

      {cv.sections.map((section) => (
        <section key={section.id} className="mt-5 break-inside-avoid-page print:mt-2">
          <h2 className="border-b border-line pb-1 text-sm font-semibold uppercase tracking-wider text-accent print:pb-0 print:text-[8.5pt]">
            {section.title}
          </h2>
          {section.entries.map((entry, i) => (
            <div key={`${section.id}-${i}`} className="mt-2 print:mt-1">
              {(entry.title || entry.meta) && (
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  {entry.title && <h3 className={entry.bullets || entry.meta ? 'font-semibold' : ''}>{entry.title}</h3>}
                  {entry.meta && <span className="text-sm text-muted print:text-[8pt]">{entry.meta}</span>}
                </div>
              )}
              {entry.link && (
                <a className="text-sm text-accent hover:underline print:text-[8pt]" href={entry.link.href}>
                  {entry.link.label}
                </a>
              )}
              {entry.bullets && (
                <ul className="mt-1 list-disc space-y-0.5 pl-5 print:mt-0.5 print:space-y-0">
                  {entry.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      ))}
    </article>
  );
}
