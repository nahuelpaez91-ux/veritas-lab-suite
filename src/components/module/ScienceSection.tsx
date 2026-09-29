import type { ModuleContent } from '@/content/types';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

export function ScienceSection({ dict, science }: { dict: Dictionary; science: ModuleContent['science'] }) {
  return (
    <section className="mt-10" aria-labelledby="science-title">
      <h2 id="science-title" className="text-xl font-semibold">
        {dict.module.science}
      </h2>
      <div className="mt-3 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-4">
          <h3 className="text-sm font-semibold text-muted">{dict.module.formula}</h3>
          <pre className="mt-2 overflow-x-auto whitespace-pre font-mono text-xs leading-relaxed">{science.formula}</pre>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <h3 className="text-sm font-semibold text-muted">{dict.module.workedExample}</h3>
          <pre className="mt-2 overflow-x-auto whitespace-pre font-mono text-xs leading-relaxed">
            {science.workedExample}
          </pre>
        </div>
      </div>
      <p className="mt-3 text-sm">
        <span className="font-semibold">{dict.module.standard}: </span>
        {science.standard}
      </p>
    </section>
  );
}
