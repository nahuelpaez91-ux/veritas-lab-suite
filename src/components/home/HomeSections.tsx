import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Seal } from '@/components/brand/Seal';
import { certifications, education } from '@/content/credentials';
import { moduleOrder, modules } from '@/content/modules';
import { profile } from '@/content/profile';
import type { ModuleSlug } from '@/content/types';
import { testFileVerdict, validationSummary } from '@/content/validation/summary';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

type P = { lang: Locale; dict: Dictionary };

// Código de documento de cada módulo en la matriz de trazabilidad.
const moduleCode: Record<ModuleSlug, string> = {
  enlace: 'MOD-ENL',
  qc: 'MOD-QC',
  custodia: 'MOD-CUS',
  informe: 'MOD-INF',
  curva: 'MOD-CUR',
  margen: 'MOD-MAR',
};

const DOC_CODE = 'ANP-POR-001';
const PHOTO = '/foto/andres-nahuel-paez-mit-carnet.webp';

const ctaPrimary =
  'inline-flex items-center justify-center gap-2 border border-ink bg-ink px-4 py-3 font-mono text-[0.8125rem] font-medium tracking-wide text-surface transition-colors hover:border-accent hover:bg-accent hover:text-accent-ink';
const ctaSecondary =
  'inline-flex items-center justify-center gap-2 border border-ink px-4 py-3 font-mono text-[0.8125rem] font-medium tracking-wide text-ink transition-colors hover:border-accent hover:bg-accent hover:text-accent-ink';
const textLink = 'underline decoration-line underline-offset-4 hover:text-accent hover:decoration-accent';
const metaLabel = 'font-mono text-[0.625rem] font-medium uppercase tracking-[0.12em] text-muted';

function SectionHead({ id, n, title, note }: { id: string; n: string; title: string; note?: string }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-4 gap-y-1 border-b border-ink pb-2.5 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
      <span className="font-mono text-sm font-semibold text-accent">{n}</span>
      <h2 id={id} className="text-[1.625rem] font-semibold leading-tight tracking-[-0.01em] [text-wrap:balance] md:text-[1.875rem]">
        {title}
      </h2>
      {note ? <span className="col-start-2 font-mono text-xs text-muted sm:col-start-auto">{note}</span> : null}
    </div>
  );
}

function markTitle(title: string, mark: string): ReactNode {
  const i = title.lastIndexOf(mark);
  if (!mark || i < 0) return title;
  return (
    <>
      {title.slice(0, i)}
      <span className="underline decoration-accent decoration-2 underline-offset-[0.12em]">{mark}</span>
      {title.slice(i + mark.length)}
    </>
  );
}

/** Encabezado de documento + héroe + panel «Registro de verificación», en una sola hoja. */
export function HeroSheet({ lang, dict }: P) {
  const d = dict.home.doc;
  const t = dict.home.hero;
  const r = dict.home.register;
  const s = validationSummary();
  const allPass = s.total > 0 && s.passed === s.total;
  const readouts = [
    { v: `${s.passed}/${s.total}`, l: r.tests, cls: allPass ? 'text-ok' : 'text-danger' },
    { v: String(moduleOrder.length), l: r.modules, cls: 'text-ink' },
    { v: r.westgardValue, l: r.westgard, cls: 'text-ink' },
    { v: 'SHA-256', l: r.audit, cls: 'text-ink' },
  ];

  return (
    <section aria-labelledby="hero-title" className="mt-6 border border-ink bg-surface md:mt-10">
      <dl
        aria-label={d.label}
        className="grid grid-cols-2 gap-px border-b border-ink bg-ink md:grid-cols-[minmax(0,1.8fr)_repeat(3,minmax(0,1fr))]"
      >
        <div className="col-span-2 grid gap-0.5 bg-surface px-3 py-2.5 md:col-span-1">
          <dt className={metaLabel}>{d.document}</dt>
          <dd className="text-[0.9375rem] font-semibold leading-snug">{d.title}</dd>
        </div>
        <div className="grid gap-0.5 bg-surface px-3 py-2.5">
          <dt className={metaLabel}>{d.code}</dt>
          <dd className="font-mono text-[0.8125rem] font-semibold">{DOC_CODE}</dd>
        </div>
        <div className="grid gap-0.5 bg-surface px-3 py-2.5">
          <dt className={metaLabel}>{d.revision}</dt>
          <dd className="font-mono text-[0.8125rem] font-semibold">{s.commit || '—'}</dd>
        </div>
        <div className="col-span-2 grid gap-0.5 bg-surface px-3 py-2.5 md:col-span-1">
          <dt className={metaLabel}>{d.effective}</dt>
          <dd className="font-mono text-[0.8125rem] font-semibold tabular-nums">{s.date || '—'}</dd>
        </div>
      </dl>

      <div className="grid lg:grid-cols-[8.5rem_minmax(0,1fr)_20rem]">
        <aside aria-label={d.marginLabel} className="hidden border-r border-line px-4 py-9 lg:block">
          <figure className="mb-7">
            <p className={metaLabel}>{d.photoLabel}</p>
            <Image
              src={PHOTO}
              width={480}
              height={480}
              alt={d.photoAlt}
              unoptimized
              priority
              className="mt-2 aspect-square w-full border border-ink bg-bg object-cover p-[3px]"
            />
            <figcaption className="mt-2 font-mono text-[0.625rem] leading-snug text-muted">{d.photoCaption}</figcaption>
          </figure>
          <dl className="grid gap-5 font-mono text-[0.6875rem] leading-snug text-muted">
            {d.margin.map((m) => (
              <div key={m.k}>
                <dt className="font-semibold text-ink">{m.k}</dt>
                <dd>{m.v}</dd>
              </div>
            ))}
          </dl>
        </aside>

        <div className="px-5 py-9 sm:px-8 md:py-12 lg:px-10">
          <div className="flex items-center gap-4 lg:block">
            <figure className="w-[5.5rem] shrink-0 lg:hidden">
              <Image
                src={PHOTO}
                width={480}
                height={480}
                alt={d.photoAlt}
                unoptimized
                priority
                className="aspect-square w-full border border-ink bg-bg object-cover p-[2px]"
              />
              <figcaption className="sr-only">{d.photoCaption}</figcaption>
            </figure>
            <div>
              <p className="font-mono text-xs leading-relaxed tracking-[0.02em] text-accent">{t.eyebrow}</p>
              <p aria-hidden="true" className="mt-1.5 font-mono text-[0.625rem] leading-snug text-muted lg:hidden">
                {d.photoCaption}
              </p>
            </div>
          </div>
          <h1
            id="hero-title"
            className="mt-4 text-[2.375rem] font-semibold leading-[1.04] tracking-[-0.02em] [font-variation-settings:'opsz'_60] [text-wrap:balance] sm:text-5xl lg:text-[3.6rem]"
          >
            {markTitle(t.title, t.titleMark)}
          </h1>
          <p className="mt-6 max-w-[54ch] text-lg leading-relaxed md:text-xl">{t.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/${lang}/modulos/enlace`} className={ctaPrimary}>
              {t.ctaFlow} <span aria-hidden="true">→</span>
            </Link>
            <Link href={`/${lang}/validacion`} className={ctaSecondary}>
              {t.ctaValidation}
            </Link>
          </div>
          <p className="mt-10 border-t border-dashed border-line pt-3 font-mono text-[0.8125rem] leading-relaxed text-muted">{t.aiLine}</p>
        </div>

        <aside aria-labelledby="register-title" className="border-t border-ink lg:border-t-0 lg:border-l">
          <h2 id="register-title" className="border-b border-ink px-4 py-2.5 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.12em]">
            {r.title}
          </h2>
          <dl className="grid grid-cols-2 gap-px border-b border-line bg-line">
            {readouts.map((x) => (
              <div key={x.l} className="flex flex-col-reverse justify-end gap-2 bg-surface px-4 pb-3.5 pt-4">
                <dt className={metaLabel}>{x.l}</dt>
                <dd className={`font-mono text-[1.75rem] font-semibold leading-none tracking-[-0.02em] tabular-nums ${x.cls}`}>{x.v}</dd>
              </div>
            ))}
          </dl>
          <dl className="font-mono text-[0.8125rem]">
            <div className="grid gap-1 border-b border-line px-4 py-3">
              <dt className={metaLabel}>{r.references}</dt>
              <dd className="font-medium">NIST · EURACHEM · Westgard</dd>
            </div>
            <div className="grid gap-1 border-b border-ink px-4 py-3">
              <dt className={metaLabel}>{r.framework}</dt>
              <dd className="font-medium">{r.frameworkValue}</dd>
              <dd className="text-xs text-muted">{r.frameworkNote}</dd>
            </div>
          </dl>
          <div className="flex items-center gap-4 px-4 py-5">
            <Seal
              className="h-28 w-28 shrink-0 text-accent"
              caption={s.commit ? s.commit.toUpperCase() : undefined}
              label={`${r.sealLabel} ${s.commit || '—'}`}
            />
            <p className="font-mono text-[0.6875rem] leading-relaxed text-muted">
              {r.sealNote}
              <br />
              <span className="text-ink">
                {s.commit || '—'} · {s.date || '—'}
              </span>
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

export function Flow({ lang, dict }: P) {
  const t = dict.home.flow;
  return (
    <section aria-labelledby="flow-title" className="mt-20">
      <SectionHead id="flow-title" n={t.n} title={t.title} note={t.note} />
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{t.subtitle}</p>
      <ol className="mt-8 grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-4">
        {t.steps.map((step, i) => (
          <li key={step.slug} className="border-b border-r border-line bg-surface">
            <Link href={`/${lang}/modulos/${step.slug}`} className="group flex h-full flex-col gap-3 p-5 transition-colors hover:bg-accent-soft">
              <span className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-[2.5rem] font-semibold leading-none tracking-[-0.03em] text-accent tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted">
                  {moduleCode[step.slug as ModuleSlug]}
                </span>
              </span>
              <span className="text-xl font-semibold leading-tight decoration-accent underline-offset-4 group-hover:underline">{step.title}</span>
              <span className="text-[0.9375rem] leading-relaxed">{step.text}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function ModuleMatrix({ lang, dict }: P) {
  const t = dict.home.modules;
  return (
    <section id="modulos" aria-labelledby="modules-title" className="mt-20 scroll-mt-24">
      <SectionHead id="modules-title" n={t.n} title={t.title} note={t.note} />
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{t.subtitle}</p>
      <ul className="mt-8 grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-3">
        {moduleOrder.map((slug) => {
          const m = modules[slug][lang];
          const v = testFileVerdict(m.verifiedAgainst.testPath);
          const verdict =
            v.total === 0 ? (
              <span className="font-semibold text-danger">{t.none}</span>
            ) : (
              <span className={`font-semibold ${v.conforme ? 'text-ok' : 'text-danger'}`}>
                {v.conforme ? t.pass : t.fail} · {v.passed}/{v.total}
              </span>
            );
          return (
            <li key={slug} className="border-b border-r border-line bg-surface">
              <Link href={`/${lang}/modulos/${slug}`} className="group flex h-full flex-col gap-3 p-5 transition-colors hover:bg-accent-soft">
                <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 font-mono text-[0.6875rem]">
                  <span className="font-semibold tracking-[0.06em] text-accent">{moduleCode[slug]}</span>
                  <span className="uppercase tracking-[0.1em] text-muted">{m.area}</span>
                </span>
                <span className="text-2xl font-semibold leading-tight decoration-accent underline-offset-4 group-hover:underline">{m.name}</span>
                <span className="grow text-[0.9375rem] leading-relaxed">{m.tagline}</span>
                <span className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 border-t border-line pt-3 font-mono text-[0.6875rem] leading-snug text-muted">
                  <span>{t.reference}</span>
                  <span className="text-ink">{m.verifiedAgainst.label}</span>
                  <span>{t.verdict}</span>
                  {verdict}
                </span>
                <span className="font-mono text-xs text-accent">{t.open}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function Trajectory({ dict }: P) {
  const t = dict.home.trajectory;
  return (
    <section aria-labelledby="trajectory-title" className="mt-24">
      <SectionHead id="trajectory-title" n={t.n} title={t.title} note={t.note} />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-14">
        <p className="text-xl leading-relaxed [font-variation-settings:'opsz'_24] md:text-[1.4rem] md:leading-[1.6]">{t.text}</p>
        <ol className="grid content-start">
          {t.pillars.map((p, i) => (
            <li key={p.title} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-2 border-t border-line py-4 last:border-b">
              <span className="font-mono text-xs leading-7 text-accent">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3 className="text-lg font-semibold leading-snug">{p.title}</h3>
                <p className="mt-1 text-[0.9375rem] leading-relaxed text-muted">{p.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Region({ dict }: P) {
  const t = dict.home.region;
  return (
    <section aria-labelledby="region-title" className="mt-24">
      <SectionHead id="region-title" n={t.n} title={t.title} note={t.note} />
      <dl aria-label={t.availabilityLabel} className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-3">
        {t.availability.map((a) => (
          <div key={a.scope} className="grid content-start gap-2 bg-surface p-5">
            <dt className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-accent">{a.scope}</dt>
            <dd className="leading-relaxed">{a.text}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 border border-dashed border-muted p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-semibold">{t.roadmapTitle}</h3>
          <span className="border border-warn px-1.5 py-0.5 font-mono text-[0.6875rem] font-semibold tracking-[0.1em] text-warn">
            {t.roadmapStatus}
          </span>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-muted">{t.roadmapNote}</p>
        <ul className="mt-4 grid gap-x-8 gap-y-2 text-[0.9375rem] md:grid-cols-2">
          {t.roadmap.map((c) => (
            <li key={c} className="grid grid-cols-[1.25rem_minmax(0,1fr)] leading-relaxed">
              <span aria-hidden="true" className="font-mono text-muted">
                ◦
              </span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Capabilities({ dict }: P) {
  const t = dict.home.capabilities;
  return (
    <section aria-labelledby="capabilities-title" className="mt-24">
      <SectionHead id="capabilities-title" n={t.n} title={t.title} />
      <ol className="mt-6 grid gap-x-10 md:grid-cols-2">
        {t.items.map((item, i) => (
          <li key={item} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-2 border-b border-line py-3.5 leading-relaxed">
            <span className="font-mono text-xs leading-7 text-muted">{String(i + 1).padStart(2, '0')}</span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Credentials({ lang, dict }: P) {
  const t = dict.home.credentials;
  return (
    <section aria-labelledby="credentials-title" className="mt-24">
      <SectionHead id="credentials-title" n={t.n} title={t.title} />
      <Link
        href={`/${lang}/credenciales`}
        className="group mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border border-ink bg-surface px-5 py-4 transition-colors hover:border-accent hover:bg-accent-soft"
      >
        <span className="text-xl font-semibold leading-snug decoration-accent underline-offset-4 group-hover:text-accent group-hover:underline">
          {t.all} <span aria-hidden="true">→</span>
        </span>
        <span className="font-mono text-xs text-muted">{t.allNote}</span>
      </Link>
      <div className="mt-8 grid gap-10 md:grid-cols-2">
        <div>
          <h3 className={`${metaLabel} text-[0.6875rem]`}>{t.education}</h3>
          <ul className="mt-3">
            {education.map((e) => (
              <li key={e.org} className="border-t border-line py-3.5 last:border-b">
                <p className="flex items-baseline justify-between gap-4">
                  <span className="font-semibold">{e.title[lang]}</span>
                  <span className="font-mono text-xs text-muted tabular-nums">{e.year}</span>
                </p>
                <p className="text-[0.9375rem]">{e.org}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{e.detail[lang]}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className={`${metaLabel} text-[0.6875rem]`}>{t.certs}</h3>
          <ul className="mt-3">
            {certifications.map((c) => (
              <li
                key={c.name.es}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 border-t border-line py-2.5 text-[0.9375rem] last:border-b"
              >
                <span>
                  <span className="font-mono text-xs text-muted">{c.issuer}</span>
                  <span className="block">
                    {c.name[lang]} <span className="font-mono text-xs text-muted tabular-nums">· {c.year}</span>
                  </span>
                </span>
                {c.url ? (
                  <a className={`font-mono text-xs text-accent ${textLink}`} href={c.url}>
                    {t.verify}
                  </a>
                ) : (
                  <span />
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function Contact({ lang, dict }: P) {
  const t = dict.home.contact;
  const rows = [
    { k: t.email, v: profile.email, href: `mailto:${profile.email}` },
    { k: t.whatsapp, v: profile.phone, href: profile.whatsappUrl },
    { k: t.github, v: profile.github.replace('https://', ''), href: profile.github },
    { k: t.cv, v: t.cvLink, href: `/${lang}/cv/${lang === 'en' ? 'global' : 'nacional'}` },
  ];
  return (
    <section aria-labelledby="contact-title" className="mt-24 border border-ink bg-surface">
      <div className="grid gap-8 p-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:p-10">
        <div>
          <p className="font-mono text-sm font-semibold text-accent">{t.n}</p>
          <h2 id="contact-title" className="mt-1 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted">
            {t.title}
          </h2>
          <p className="mt-4 text-[1.75rem] font-semibold leading-snug tracking-[-0.01em] [text-wrap:balance] md:text-[2.125rem]">{t.text}</p>
        </div>
        <dl className="grid content-end font-mono text-sm">
          {rows.map((r) => (
            <div key={r.k} className="grid grid-cols-[6rem_minmax(0,1fr)] gap-x-3 border-t border-line py-2.5 last:border-b">
              <dt className="text-muted">{r.k}</dt>
              <dd className="break-all">
                {r.href.startsWith('/') ? (
                  <Link className={textLink} href={r.href}>
                    {r.v}
                  </Link>
                ) : (
                  <a className={textLink} href={r.href}>
                    {r.v}
                  </a>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
