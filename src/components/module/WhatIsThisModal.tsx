'use client';

import { useRef } from 'react';
import type { ModuleContent } from '@/content/types';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import { btnPrimary, h3, table, tableWrap } from '@/components/ui/styles';

export function WhatIsThisModal({ dict, content }: { dict: Dictionary; content: ModuleContent }) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        data-testid="what-is-this"
        onClick={() => ref.current?.showModal()}
        className="rounded-full border border-accent px-4 py-2 text-sm font-medium text-accent hover:bg-accent-soft"
      >
        ⓘ {dict.module.whatIsThis}
      </button>
      <dialog
        ref={ref}
        aria-label={content.name}
        className="m-auto w-[min(48rem,calc(100vw-2rem))] rounded-xl border border-line bg-surface p-0 text-ink"
      >
        <div className="max-h-[80vh] space-y-4 overflow-y-auto p-6">
          <h2 className="text-2xl font-semibold">{content.name}</h2>
          <section>
            <h3 className={h3}>{dict.module.whatSolves}</h3>
            <p className="mt-1 text-sm leading-relaxed">{content.whatSolves}</p>
          </section>
          <section>
            <h3 className={h3}>{dict.module.howItWorks}</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
              {content.howItWorks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section>
            <h3 className={h3}>{dict.module.dataSources}</h3>
            <div className={`${tableWrap} mt-1`}>
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
            <h3 className={h3}>{dict.module.whereElse}</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
              {content.whereElse.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <form method="dialog" className="text-right">
            <button className={btnPrimary}>{dict.module.close}</button>
          </form>
        </div>
      </dialog>
    </>
  );
}
