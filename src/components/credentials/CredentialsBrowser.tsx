'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

export type Kind = 'titulo' | 'analitico' | 'certificado';
export type Filter = 'all' | Kind;

/** Documento ya resuelto para el idioma actual (datos serializables desde el servidor). */
export interface DocView {
  slug: string;
  kind: Kind;
  kindLabel: string;
  title: string;
  issuer: string;
  year: number;
  hours?: string;
  pagesLabel: string;
  pages: { src: string; w: number; h: number; alt: string; label: string }[];
  thumb: { src: string; w: number; h: number };
  pdf: string;
  pdfLabel: string;
  verifyUrl?: string;
  verifyLabel?: string;
}

export interface BrowserLabels {
  filterLabel: string;
  filters: Record<Filter, string>;
  view: string;
  pdf: string;
  verify: string;
  close: string;
  openPdf: string;
}

const FILTERS: Filter[] = ['all', 'titulo', 'analitico', 'certificado'];

const chip = 'border px-1.5 py-0.5 font-mono text-[0.625rem] font-semibold uppercase leading-none tracking-[0.12em]';
const chipTone: Record<Kind, string> = {
  titulo: 'border-accent text-accent',
  analitico: 'border-ink text-ink',
  certificado: 'border-muted text-muted',
};
const action =
  'inline-flex min-h-10 items-center justify-center gap-1.5 px-3 py-2 font-mono text-[0.75rem] font-medium tracking-wide transition-colors';

/** Filtro por tipo (pestañas accesibles) + rejilla de documentos + visor en <dialog>. */
export function CredentialsBrowser({ docs, labels }: { docs: DocView[]; labels: BrowserLabels }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const dialog = useRef<HTMLDialogElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const current = docs.find((d) => d.slug === openSlug) ?? null;

  const count = (f: Filter) => (f === 'all' ? docs.length : docs.filter((d) => d.kind === f).length);

  function onTabKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const last = FILTERS.length - 1;
    const next =
      e.key === 'ArrowRight' ? (i === last ? 0 : i + 1) : e.key === 'ArrowLeft' ? (i === 0 ? last : i - 1) : e.key === 'Home' ? 0 : e.key === 'End' ? last : -1;
    if (next < 0) return;
    e.preventDefault();
    setFilter(FILTERS[next]);
    tabs.current[next]?.focus();
  }

  function open(slug: string, trigger: HTMLElement) {
    returnTo.current = trigger;
    setOpenSlug(slug);
  }

  useEffect(() => {
    const d = dialog.current;
    if (current && d && !d.open) {
      d.showModal();
      d.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    }
  }, [current]);

  function onClose() {
    setOpenSlug(null);
    const el = returnTo.current;
    returnTo.current = null;
    // Devolver el foco al botón que abrió el visor.
    requestAnimationFrame(() => el?.focus());
  }

  return (
    <div>
      <div role="tablist" aria-label={labels.filterLabel} className="grid grid-cols-2 gap-px border border-ink bg-ink sm:inline-grid sm:grid-cols-4">
        {FILTERS.map((f, i) => {
          const selected = filter === f;
          return (
            <button
              key={f}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${f}`}
              aria-selected={selected}
              aria-controls="credenciales-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => setFilter(f)}
              onKeyDown={(e) => onTabKey(e, i)}
              className={`flex min-h-10 items-center justify-between gap-3 px-3.5 py-2 font-mono text-[0.75rem] font-medium tracking-wide transition-colors ${
                selected ? 'bg-ink text-surface' : 'bg-surface text-ink hover:bg-accent-soft hover:text-accent'
              }`}
            >
              <span>{labels.filters[f]}</span>
              <span className={`tabular-nums ${selected ? 'text-surface' : 'text-muted'}`}>{count(f)}</span>
            </button>
          );
        })}
      </div>

      <div id="credenciales-panel" role="tabpanel" aria-labelledby={`tab-${filter}`} className="mt-6">
        <ul className="grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((d) => (
            <li key={d.slug} hidden={filter !== 'all' && d.kind !== filter} className="flex flex-col border-b border-r border-line bg-surface">
              <button
                type="button"
                tabIndex={-1}
                aria-hidden="true"
                onClick={(e) => open(d.slug, e.currentTarget.closest('li')?.querySelector<HTMLElement>('[data-view]') ?? e.currentTarget)}
                className="group flex aspect-[4/3] items-center justify-center overflow-hidden border-b border-line bg-bg p-4"
              >
                <Image
                  src={d.thumb.src}
                  width={d.thumb.w}
                  height={d.thumb.h}
                  alt=""
                  unoptimized
                  loading="lazy"
                  sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 90vw"
                  className="h-full w-auto max-w-full border border-line bg-white object-contain transition-transform group-hover:-translate-y-0.5"
                />
              </button>
              <div className="flex grow flex-col gap-2 px-4 pb-4 pt-3.5">
                <p className="flex items-center justify-between gap-3">
                  <span className={`${chip} ${chipTone[d.kind]}`}>{d.kindLabel}</span>
                  <span className="font-mono text-[0.6875rem] text-muted tabular-nums">{d.pagesLabel}</span>
                </p>
                <h2 className="text-[1.125rem] font-semibold leading-snug [text-wrap:balance]">{d.title}</h2>
                <p className="text-[0.875rem] leading-snug text-muted">
                  {d.issuer} · <span className="font-mono text-[0.8125rem] tabular-nums">{d.year}</span>
                  {d.hours ? (
                    <>
                      {' '}
                      · <span className="font-mono text-[0.8125rem] tabular-nums">{d.hours}</span>
                    </>
                  ) : null}
                </p>
              </div>
              <div className="flex flex-wrap gap-px border-t border-line bg-line">
                <button
                  type="button"
                  data-view
                  onClick={(e) => open(d.slug, e.currentTarget)}
                  aria-haspopup="dialog"
                  className={`${action} grow bg-ink text-surface hover:bg-accent hover:text-accent-ink`}
                >
                  {labels.view}
                </button>
                <a href={d.pdf} target="_blank" rel="noopener" aria-label={d.pdfLabel} className={`${action} bg-surface text-ink hover:bg-accent-soft hover:text-accent`}>
                  {labels.pdf} <span aria-hidden="true">↗</span>
                </a>
                {d.verifyUrl ? (
                  <a
                    href={d.verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={d.verifyLabel}
                    className={`${action} bg-surface text-accent hover:bg-accent-soft`}
                  >
                    {labels.verify} <span aria-hidden="true">↗</span>
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <dialog
        ref={dialog}
        aria-labelledby="visor-titulo"
        onClose={onClose}
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
        className="m-auto h-[calc(100dvh-1rem)] max-h-none w-[min(60rem,calc(100vw-1rem))] max-w-none flex-col border border-ink bg-surface p-0 text-ink open:flex sm:h-[calc(100dvh-3rem)]"
      >
        {current ? (
          <>
            <header className="flex items-start gap-3 border-b border-ink px-4 py-3 sm:px-6">
              <div className="min-w-0 grow">
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className={`${chip} ${chipTone[current.kind]}`}>{current.kindLabel}</span>
                  <span className="font-mono text-[0.6875rem] text-muted tabular-nums">{current.pagesLabel}</span>
                </p>
                <h2 id="visor-titulo" className="mt-1.5 text-lg font-semibold leading-snug [text-wrap:balance] sm:text-xl">
                  {current.title}
                </h2>
                <p className="text-[0.8125rem] leading-snug text-muted">
                  {current.issuer} · {current.year}
                </p>
              </div>
              <form method="dialog" className="shrink-0">
                <button data-autofocus className={`${action} border border-ink bg-surface text-ink hover:border-accent hover:bg-accent hover:text-accent-ink`}>
                  {labels.close} <span aria-hidden="true">✕</span>
                </button>
              </form>
            </header>
            <div className="grow overflow-y-auto overscroll-contain bg-bg px-3 py-4 sm:px-6 sm:py-6">
              <ol className="mx-auto grid max-w-[52rem] gap-6">
                {current.pages.map((p) => (
                  <li key={p.src}>
                    <figure>
                      <figcaption className="mb-1.5 border-b border-line pb-1 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-muted tabular-nums">
                        {p.label}
                      </figcaption>
                      <Image
                        src={p.src}
                        width={p.w}
                        height={p.h}
                        alt={p.alt}
                        unoptimized
                        loading="lazy"
                        className="h-auto w-full border border-line bg-white"
                      />
                    </figure>
                  </li>
                ))}
              </ol>
              <p className="mx-auto mt-6 flex max-w-[52rem] justify-end">
                <a href={current.pdf} target="_blank" rel="noopener" className={`${action} border border-ink bg-surface text-ink hover:border-accent hover:bg-accent hover:text-accent-ink`}>
                  {labels.openPdf} <span aria-hidden="true">↗</span>
                </a>
              </p>
            </div>
          </>
        ) : null}
      </dialog>
    </div>
  );
}
