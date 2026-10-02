import Link from 'next/link';
import { Seal } from '@/components/brand/Seal';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import { LangSwitch } from './LangSwitch';

export function SiteHeader({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const links: { href: string; label: string; short?: string }[] = [
    { href: `/${lang}#modulos`, label: dict.nav.modules },
    { href: `/${lang}/validacion`, label: dict.nav.validation },
    { href: `/${lang}/ia`, label: dict.nav.ai, short: dict.nav.aiShort },
    { href: `/${lang}/cv/${lang === 'en' ? 'global' : 'nacional'}`, label: dict.nav.cv },
    { href: `/${lang}/credenciales`, label: dict.nav.credentials },
    { href: `/${lang}/acerca`, label: dict.nav.about },
  ];
  return (
    <header className="sticky top-[env(safe-area-inset-top,0px)] z-40 border-b border-ink bg-bg/95 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
        <Link href={`/${lang}`} className="flex items-center gap-2.5 text-[1.0625rem] font-semibold leading-tight text-ink hover:text-ink">
          <Seal variant="compact" decorative className="h-8 w-8 shrink-0 text-accent" />
          <span>{dict.meta.shortTitle}</span>
        </Link>
        <nav aria-label={dict.nav.label} className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[0.6875rem] text-ink sm:gap-x-4 sm:text-[0.8125rem]">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-label={l.short ? l.label : undefined}
              className="py-1 underline-offset-4 hover:text-accent hover:underline hover:decoration-accent"
            >
              {l.short ? (
                <>
                  <span className="sm:hidden">{l.short}</span>
                  <span className="hidden sm:inline">{l.label}</span>
                </>
              ) : (
                l.label
              )}
            </Link>
          ))}
          <LangSwitch lang={lang} label={dict.nav.language} />
        </nav>
      </div>
    </header>
  );
}
