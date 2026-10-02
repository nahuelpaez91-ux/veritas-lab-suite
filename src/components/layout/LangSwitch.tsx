'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Locale } from '@/lib/i18n/config';

export function LangSwitch({ lang, label }: { lang: Locale; label: string }) {
  const pathname = usePathname() ?? `/${lang}`;
  const other: Locale = lang === 'es' ? 'en' : 'es';
  const target = pathname.replace(/^\/(es|en)(?=\/|$)/, `/${other}`);
  return (
    <Link
      href={target}
      hrefLang={other}
      aria-label={label}
      className="border border-ink px-2 py-0.5 font-mono text-xs uppercase tracking-wider hover:border-accent hover:bg-accent hover:text-accent-ink"
    >
      {other}
    </Link>
  );
}
