import Link from 'next/link';
import { btnPrimary, btnSecondary, card, h2 } from '@/components/ui/styles';
import { moduleOrder, modules } from '@/content/modules';
import { certifications, education } from '@/content/credentials';
import { profile } from '@/content/profile';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

type P = { lang: Locale; dict: Dictionary };

export function Hero({ lang, dict }: P) {
  const t = dict.home.hero;
  return (
    <section className="py-12 md:py-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-accent">{t.eyebrow}</p>
      <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight md:text-5xl">{t.title}</h1>
      <p className="mt-4 max-w-3xl text-lg text-muted">{t.subtitle}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={`/${lang}/modulos/enlace`} className={btnPrimary}>
          {t.ctaFlow}
        </Link>
        <Link href={`/${lang}/cv/${lang === 'en' ? 'global' : 'nacional'}`} className={btnSecondary}>
          {t.ctaCv}
        </Link>
        <Link href={`/${lang}/validacion`} className={btnSecondary}>
          {t.ctaValidation}
        </Link>
      </div>
    </section>
  );
}

export function Availability({ dict }: P) {
  const t = dict.home.availability;
  return (
    <section className={`${card} grid gap-3 md:grid-cols-4`} aria-label={t.title}>
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">{t.title}</h2>
      {t.items.map((item) => (
        <p key={item} className="text-sm">
          {item}
        </p>
      ))}
    </section>
  );
}

export function Flow({ lang, dict }: P) {
  const t = dict.home.flow;
  return (
    <section className="mt-12">
      <h2 className={h2}>{t.title}</h2>
      <p className="mt-1 text-muted">{t.subtitle}</p>
      <ol className="mt-4 grid gap-3 md:grid-cols-4">
        {t.steps.map((step, i) => (
          <li key={step.slug} className="relative">
            <Link href={`/${lang}/modulos/${step.slug}`} className={`${card} block h-full hover:border-accent`}>
              <p className="font-semibold text-accent">{step.title}</p>
              <p className="mt-1 text-sm">{step.text}</p>
            </Link>
            {i < t.steps.length - 1 && (
              <span aria-hidden="true" className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-accent md:block">
                →
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function ModuleGrid({ lang, dict }: P) {
  const t = dict.home.modules;
  return (
    <section id="modulos" className="mt-12 scroll-mt-20">
      <h2 className={h2}>{t.title}</h2>
      <p className="mt-1 text-muted">{t.subtitle}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {moduleOrder.map((slug) => {
          const m = modules[slug][lang];
          return (
            <Link key={slug} href={`/${lang}/modulos/${slug}`} className={`${card} flex flex-col hover:border-accent`}>
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">{m.area}</p>
              <h3 className="mt-1 text-lg font-semibold">{m.name}</h3>
              <p className="mt-1 grow text-sm text-muted">{m.tagline}</p>
              <p className="mt-3 text-xs text-ok">✔ {m.verifiedAgainst.label}</p>
              <p className="mt-2 text-sm font-medium text-accent">{t.open}</p>
            </Link>
          );
        })}
      </div>
      <div className="mt-6 rounded-xl border border-dashed border-line p-4">
        <h3 className="text-sm font-semibold">{t.comingTitle}</h3>
        <ul className="mt-2 grid gap-1 text-sm text-muted sm:grid-cols-2">
          {t.coming.map((c) => (
            <li key={c}>◦ {c}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Trajectory({ dict }: P) {
  const t = dict.home.trajectory;
  return (
    <section className="mt-12">
      <h2 className={h2}>{t.title}</h2>
      <p className="mt-2 max-w-3xl">{t.text}</p>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {t.pillars.map((p) => (
          <div key={p.title} className={card}>
            <h3 className="font-semibold">{p.title}</h3>
            <p className="mt-1 text-sm text-muted">{p.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Capabilities({ dict }: P) {
  const t = dict.home.capabilities;
  return (
    <section className="mt-12">
      <h2 className={h2}>{t.title}</h2>
      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {t.items.map((item) => (
          <li key={item} className={`${card} text-sm`}>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Credentials({ lang, dict }: P) {
  const t = dict.home.credentials;
  return (
    <section className="mt-12">
      <h2 className={h2}>{t.title}</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className={card}>
          <h3 className="font-semibold">{t.education}</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {education.map((e) => (
              <li key={e.org}>
                <p className="font-medium">
                  {e.title[lang]} · {e.year}
                </p>
                <p className="text-muted">{e.org}</p>
                <p className="text-xs text-muted">{e.detail[lang]}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className={card}>
          <h3 className="font-semibold">{t.certs}</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {certifications.map((c) => (
              <li key={c.name.es}>
                {c.issuer} · {c.name[lang]} ({c.year})
                {c.url && (
                  <>
                    {' '}
                    <a className="text-accent hover:underline" href={c.url}>
                      {t.verify}
                    </a>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function Contact({ dict }: P) {
  const t = dict.home.contact;
  return (
    <section className={`${card} mt-12`}>
      <h2 className={h2}>{t.title}</h2>
      <p className="mt-1 text-muted">{t.text}</p>
      <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <li>
          {t.email}:{' '}
          <a className="text-accent hover:underline" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
        </li>
        <li>
          {t.whatsapp}:{' '}
          <a className="text-accent hover:underline" href={profile.whatsappUrl}>
            {profile.phone}
          </a>
        </li>
        <li>
          {t.github}:{' '}
          <a className="text-accent hover:underline" href={profile.github}>
            {profile.github.replace('https://', '')}
          </a>
        </li>
      </ul>
    </section>
  );
}
