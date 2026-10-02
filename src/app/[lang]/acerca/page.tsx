import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Signature } from '@/components/layout/Signature';
import { card, h2 } from '@/components/ui/styles';
import { profile } from '@/content/profile';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getDictionary(lang).about.title };
}

export default async function AboutPage({ params }: { params: Params }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.about;
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <h1 className="text-3xl font-semibold">{t.title}</h1>
      {t.paragraphs.map((p) => (
        <p key={p} className="leading-relaxed">
          {p}
        </p>
      ))}
      <section className={card}>
        <h2 className={h2}>{t.howTitle}</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {t.how.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </section>
      <section className={card}>
        <h2 className={h2}>{t.otherTitle}</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {t.other.map((o) => (
            <li key={o.href}>
              <a className="text-accent hover:underline" href={o.href}>
                {o.label} →
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section className={card}>
        <h2 className={h2}>{t.contactTitle}</h2>
        <p className="mt-2 text-sm">
          <a className="text-accent hover:underline" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>{' '}
          · {profile.phone} · {profile.location}
        </p>
        <div className="mt-4">
          <Signature dict={dict} />
        </div>
      </section>
    </div>
  );
}
