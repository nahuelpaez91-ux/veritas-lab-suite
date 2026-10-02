import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { VertexMark } from '@/components/brand/VertexMark';
import { profile } from '@/content/profile';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getDictionary(lang).about.title };
}

const textLink = 'underline decoration-line underline-offset-4 hover:text-accent hover:decoration-accent';
const metaLabel = 'font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted';

// Curvas de nivel: un mismo contorno irregular a distintas escalas (decorativo).
const CONTOUR = 'M0,-100 C62,-104 112,-58 106,-4 C100,56 52,96 -6,90 C-72,84 -112,38 -101,-16 C-92,-70 -52,-97 0,-100Z';
const RINGS = [0.14, 0.3, 0.46, 0.62, 0.78, 0.96, 1.14, 1.32];

function Contours({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 320" preserveAspectRatio="xMaxYMax slice" className={className} aria-hidden="true" focusable="false">
      <g transform="translate(392 304)" fill="none" stroke="var(--color-line)">
        {RINGS.map((k, i) => (
          <path
            key={k}
            d={CONTOUR}
            transform={`rotate(${i * 9}) scale(${k} ${k * 0.86})`}
            vectorEffect="non-scaling-stroke"
            strokeWidth={i % 4 === 0 ? 1.6 : 1}
          />
        ))}
      </g>
    </svg>
  );
}

function Head({ id, title }: { id: string; title: string }) {
  return (
    <h2 id={id} className="border-b border-ink pb-2 text-[1.5rem] font-semibold leading-tight tracking-[-0.01em] [text-wrap:balance]">
      {title}
    </h2>
  );
}

export default async function AboutPage({ params }: { params: Params }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.about;
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <header className="grid gap-6 border-b border-ink pb-6 md:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] md:items-end md:gap-10">
        <div>
          <p className="font-mono text-xs tracking-[0.02em] text-accent">{t.eyebrow}</p>
          <h1 className="mt-3 text-[2.375rem] font-semibold leading-[1.05] tracking-[-0.02em] [font-variation-settings:'opsz'_60] [text-wrap:balance] md:text-[3.25rem]">
            {t.title}
          </h1>
        </div>
        <figure className="max-w-[26rem]">
          <Image
            src="/foto/andres-nahuel-paez-mit.webp"
            width={800}
            height={600}
            alt={t.photoAlt}
            priority
            sizes="(min-width: 768px) 26rem, calc(100vw - 2rem)"
            className="aspect-[4/3] w-full border border-ink bg-surface object-cover p-1"
          />
          <figcaption className="mt-2 font-mono text-[0.6875rem] leading-snug text-muted">{t.photoCaption}</figcaption>
        </figure>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-14">
        <div className="space-y-5">
          {t.paragraphs.map((p, i) => (
            <p key={p} className={i === 0 ? 'text-xl leading-relaxed md:text-[1.375rem] md:leading-[1.6]' : 'text-lg leading-relaxed'}>
              {p}
            </p>
          ))}
        </div>

        <section aria-labelledby="territory-title" className="relative isolate self-start overflow-hidden border border-ink bg-surface">
          <Contours className="absolute inset-0 -z-10 h-full w-full opacity-90" />
          <div className="p-6 pb-36">
            <h2 id="territory-title" className={metaLabel}>
              {t.territory.title}
            </h2>
            <VertexMark className="mt-4 text-ink" label={dict.signature.vertex} />
            <p className="mt-5 max-w-[34ch] leading-relaxed">{t.territory.text}</p>
            <p className="mt-3 max-w-[34ch] font-mono text-xs leading-relaxed text-muted">{t.territory.availability}</p>
          </div>
        </section>
      </div>

      <div className="mt-20 grid gap-14 md:grid-cols-2">
        <section aria-labelledby="how-title">
          <Head id="how-title" title={t.howTitle} />
          <ol className="mt-2">
            {t.how.map((item, i) => (
              <li key={item} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-2 border-b border-line py-3 text-[0.9375rem] leading-relaxed">
                <span className="font-mono text-xs leading-7 text-muted">{String(i + 1).padStart(2, '0')}</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="other-title">
          <Head id="other-title" title={t.otherTitle} />
          <p className="mt-3 text-[0.9375rem] text-muted">{t.otherNote}</p>
          <ul className="mt-2">
            {t.other.map((o) => (
              <li key={o.href} className="border-b border-line py-3">
                <a className={`text-lg font-semibold ${textLink}`} href={o.href}>
                  {o.label}&nbsp;<span aria-hidden="true">→</span>
                </a>
                <p className="mt-0.5 break-all font-mono text-xs text-muted">{o.href.replace('https://', '')}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby="about-contact-title" className="mt-20 border border-ink bg-surface">
        {/* La firma ya está en el pie de página: aquí solo los datos de contacto. */}
        <div className="p-6 md:p-10">
          <div className="max-w-3xl">
            <h2 id="about-contact-title" className={metaLabel}>
              {t.contactTitle}
            </h2>
            <p className="mt-3 text-[1.5rem] font-semibold leading-snug [text-wrap:balance] md:text-[1.75rem]">{t.contactText}</p>
            <p className="mt-5 font-mono text-sm leading-relaxed">
              <a className={`break-all ${textLink}`} href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
              <br />
              <a className={textLink} href={profile.whatsappUrl}>
                {profile.phone}
              </a>
              <span className="text-muted"> · {profile.location}</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
