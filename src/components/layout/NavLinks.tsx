'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type NavItem = {
  href: string;
  label: string;
  short?: string;
  /** Prefijo de ruta que marca el enlace como activo (aria-current="page"). Sin él, el enlace no se marca. */
  match?: string;
};

/** Enlaces de navegación con estado activo visible y aria-current="page" en la sección actual. */
export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname() ?? '';
  return (
    <>
      {items.map((l) => {
        const active = l.match ? pathname === l.match || pathname.startsWith(`${l.match}/`) : false;
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-label={l.short ? l.label : undefined}
            aria-current={active ? 'page' : undefined}
            className={`inline-flex min-h-6 items-center px-1 py-1.5 underline-offset-4 hover:text-accent hover:underline hover:decoration-accent ${
              active ? 'text-accent underline decoration-accent decoration-2' : ''
            }`}
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
        );
      })}
    </>
  );
}
