import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { card, h2 } from '@/components/ui/styles';
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
  const t = getDictionary(lang).aiPolicy;
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <h1 className="text-3xl font-semibold">{t.title}</h1>
      <p className="text-muted">{t.intro}</p>
      {t.sections.map((s) => (
        <section key={s.title} className={card}>
          <h2 className={h2}>{s.title}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {s.items.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </section>
      ))}
      <section>
        <h2 className={h2}>{t.refsTitle}</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
          {t.refs.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
