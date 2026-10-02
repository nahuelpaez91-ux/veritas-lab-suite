import Link from 'next/link';
import { Seal } from '@/components/brand/Seal';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import { LangSwitch } from './LangSwitch';
import { NavLinks, type NavItem } from './NavLinks';

const skipLabel: Record<Locale, string> = { es: 'Saltar al contenido', en: 'Skip to content' };

export function SiteHeader({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const links: NavItem[] = [
    { href: `/${lang}#modulos`, label: dict.nav.modules },
    { href: `/${lang}/validacion`, label: dict.nav.validation, match: `/${lang}/validacion` },
    { href: `/${lang}/ia`, label: dict.nav.ai, short: dict.nav.aiShort, match: `/${lang}/ia` },
    { href: `/${lang}/cv/${lang === 'en' ? 'global' : 'nacional'}`, label: dict.nav.cv, match: `/${lang}/cv` },
    { href: `/${lang}/credenciales`, label: dict.nav.credentials, match: `/${lang}/credenciales` },
    { href: `/${lang}/acerca`, label: dict.nav.about, match: `/${lang}/acerca` },
  ];
  return (
    <>
      <a
        href="#contenido"
        className="sr-only z-50 border border-ink bg-surface px-3 py-2 font-mono text-sm text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-[calc(env(safe-area-inset-top,0px)+0.5rem)]"
      >
        {skipLabel[lang]}
      </a>
      <header className="sticky top-[env(safe-area-inset-top,0px)] z-40 border-b border-ink bg-bg/95 backdrop-blur print:hidden">
        {/* Móvil: marca + idioma en la primera fila y la navegación debajo. Desde lg, todo en una fila. */}
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 sm:gap-x-4 lg:gap-x-6 lg:py-3">
          <Link
            href={`/${lang}`}
            className="mr-auto flex min-w-0 items-center gap-2 text-[0.9375rem] font-semibold leading-tight text-ink hover:text-ink sm:gap-2.5 sm:text-[1.0625rem]"
          >
            <Seal variant="compact" decorative className="h-7 w-7 shrink-0 text-accent sm:h-8 sm:w-8" />
            <span className="whitespace-nowrap">{dict.meta.shortTitle}</span>
          </Link>
          <nav
            aria-label={dict.nav.label}
            className="order-last -mx-1 flex w-full flex-wrap items-center gap-x-1.5 font-mono text-[0.75rem] text-ink sm:gap-x-3 sm:text-[0.8125rem] lg:order-none lg:mx-0 lg:w-auto lg:gap-x-4"
          >
            <NavLinks items={links} />
          </nav>
          <LangSwitch lang={lang} label={dict.nav.language} />
        </div>
      </header>
    </>
  );
}
