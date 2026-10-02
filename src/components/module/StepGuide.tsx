import { SectionHead } from './DocHeader';

/** Guía como procedimiento numerado: numerales cuadrados en monoespaciada, filas separadas por filetes. */
export function StepGuide({ n, title, steps, note }: { n: string; title: string; steps: string[]; note?: string }) {
  return (
    <section aria-labelledby="guide-title">
      <SectionHead n={n} id="guide-title" title={title} note={note} />
      <ol className="grid border-l border-line sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <li key={step} className="flex gap-3 border-r border-b border-line bg-surface px-3 py-3 text-sm leading-relaxed">
            <span
              aria-hidden="true"
              className="flex h-7 w-7 shrink-0 items-center justify-center border border-ink font-mono text-xs font-semibold [font-variant-numeric:tabular-nums]"
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
