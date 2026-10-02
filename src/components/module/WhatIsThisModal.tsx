'use client';

import { useRef } from 'react';
import type { ModuleContent } from '@/content/types';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import { btnPrimary, btnSecondary, table, tableWrap } from '@/components/ui/styles';

const sectionTitle = 'flex items-baseline gap-2 border-b border-line pb-1 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-muted';

/** Ficha «¿Qué es esto?» con forma de hoja de documento: encabezado con código y secciones numeradas. */
export function WhatIsThisModal({ dict, content, code }: { dict: Dictionary; content: ModuleContent; code: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const t = dict.validation.doc;
  const n = (i: number) => <span className="text-accent">{i}.</span>;
  return (
    <>
      <button type="button" data-testid="what-is-this" onClick={() => ref.current?.showModal()} className={btnSecondary}>
        <span aria-hidden="true">ⓘ</span> {dict.module.whatIsThis}
      </button>
      <dialog
        ref={ref}
        aria-label={content.name}
        className="m-auto w-[min(48rem,calc(100vw-2rem))] border border-ink bg-surface p-0 text-ink"
      >
        <div className="max-h-[85vh] overflow-y-auto">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-ink px-6 py-2 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-muted">
            <span>{t.sheet}</span>
            <span className="font-semibold text-accent">{code}</span>
          </div>
          <div className="space-y-6 px-6 py-5">
            <header>
              <p className="font-mono text-xs text-muted">{content.area}</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">{content.name}</h2>
            </header>
            <section>
              <h3 className={sectionTitle}>
                {n(1)} {dict.module.whatSolves}
              </h3>
              <p className="mt-2 text-[0.95rem] leading-relaxed">{content.whatSolves}</p>
            </section>
            <section>
              <h3 className={sectionTitle}>
                {n(2)} {dict.module.howItWorks}
              </h3>
              <ol className="mt-2 space-y-1.5 text-sm leading-relaxed">
                {content.howItWorks.map((item, i) => (
                  <li key={item} className="grid grid-cols-[2.25rem_minmax(0,1fr)]">
                    <span className="font-mono text-xs text-muted">2.{i + 1}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </section>
            <section>
              <h3 className={sectionTitle}>
                {n(3)} {dict.module.dataSources}
              </h3>
              <div className={`${tableWrap} mt-2`}>
                <table className={table}>
                  <thead>
                    <tr>
                      <th>{dict.module.variable}</th>
                      <th>{dict.module.source}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.dataSources.map((row) => (
                      <tr key={row.variable}>
                        <td className="font-medium">{row.variable}</td>
                        <td>{row.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <section>
              <h3 className={sectionTitle}>
                {n(4)} {dict.module.whereElse}
              </h3>
              <ul className="mt-2 space-y-1 text-sm">
                {content.whereElse.map((item) => (
                  <li key={item} className="grid grid-cols-[1rem_minmax(0,1fr)]">
                    <span aria-hidden="true" className="text-muted">
                      —
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
            <form method="dialog" className="flex justify-end border-t border-line pt-4">
              <button className={btnPrimary}>{dict.module.close}</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}
