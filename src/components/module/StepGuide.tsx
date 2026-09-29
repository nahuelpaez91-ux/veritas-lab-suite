export function StepGuide({ title, steps }: { title: string; steps: string[] }) {
  return (
    <section aria-label={title} className="rounded-xl border border-accent/30 bg-accent-soft p-4">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-accent">{title}</h2>
      <ol className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <li key={step} className="flex gap-3 text-sm">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-xs text-accent-ink">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
