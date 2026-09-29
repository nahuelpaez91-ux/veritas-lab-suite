import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import { LangSwitch } from './LangSwitch';
import { Monogram } from './Monogram';

export function SiteHeader({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const links = [
    { href: `/${lang}#modulos`, label: dict.nav.modules },
    { href: `/${lang}/validacion`, label: dict.nav.validation },
    { href: `/${lang}/ia`, label: dict.nav.ai },
    { href: `/${lang}/cv/${lang === 'en' ? 'global' : 'nacional'}`, label: dict.nav.cv },
    { href: `/${lang}/acerca`, label: dict.nav.about },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href={`/${lang}`} className="flex items-center gap-2 font-semibold">
          <Monogram className="h-8 w-8 text-ink" />
          <span>Veritas Lab Suite</span>
        </Link>
        <nav aria-label={dict.nav.label} className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-accent">
              {l.label}
            </Link>
          ))}
          <LangSwitch lang={lang} label={dict.nav.language} />
        </nav>
      </div>
    </header>
  );
}
