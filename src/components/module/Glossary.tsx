export function Glossary({ title, items }: { title: string; items: { term: string; definition: string }[] }) {
  return (
    <section className="mt-10" aria-labelledby="glossary-title">
      <h2 id="glossary-title" className="text-xl font-semibold">
        {title}
      </h2>
      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.term} className="rounded-lg border border-line bg-surface p-3">
            <dt className="font-mono text-sm font-semibold text-accent">{item.term}</dt>
            <dd className="mt-1 text-sm text-muted">{item.definition}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
