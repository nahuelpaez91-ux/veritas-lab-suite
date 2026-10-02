import type { ModuleContent } from '@/content/types';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import { SectionHead } from './DocHeader';

/** La ciencia como recuadros numerados: Ec. (fórmulas) y Ej. (ejemplo resuelto), en monoespaciada. */
export function ScienceSection({
  n,
  code,
  dict,
  science,
}: {
  n: string;
  code: string;
  dict: Dictionary;
  science: ModuleContent['science'];
}) {
  const t = dict.validation.doc;
  const boxes = [
    { tag: `${t.equation} ${n}-a`, title: dict.module.formula, body: science.formula },
    { tag: `${t.example} ${n}-b`, title: dict.module.workedExample, body: science.workedExample },
  ];
  return (
    <section className="mt-12" aria-labelledby="science-title">
      <SectionHead n={n} id="science-title" title={dict.module.science} note={code} />
      <div className="grid grid-cols-1 border-l border-line lg:grid-cols-2">
        {boxes.map((box) => (
          <figure key={box.tag} className="m-0 min-w-0 border-r border-b border-line bg-surface p-4">
            <figcaption className="text-[0.95rem]">
              <b className="mr-2 font-mono text-xs font-semibold text-accent">{box.tag}</b>
              {box.title}
            </figcaption>
            <pre className="mt-3 overflow-x-auto border-t border-dashed border-line pt-3 font-mono text-xs leading-relaxed whitespace-pre">
              {box.body}
            </pre>
          </figure>
        ))}
      </div>
      <p className="mt-3 grid gap-1 text-sm sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-3">
        <span className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-muted sm:pt-0.5">
          {dict.module.standard}
        </span>
        <span>{science.standard}</span>
      </p>
    </section>
  );
}
