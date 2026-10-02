import { SectionHead } from './DocHeader';

/** Glosario como lista de definiciones con filetes. */
export function Glossary({ n, title, items }: { n: string; title: string; items: { term: string; definition: string }[] }) {
  return (
    <section className="mt-12" aria-labelledby="glossary-title">
      <SectionHead n={n} id="glossary-title" title={title} />
      <dl className="grid lg:grid-cols-2 lg:gap-x-8">
        {items.map((item) => (
          <div key={item.term} className="grid gap-1 border-b border-line py-2.5 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4">
            <dt className="font-mono text-sm font-semibold">{item.term}</dt>
            <dd className="text-sm leading-relaxed text-muted">{item.definition}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
