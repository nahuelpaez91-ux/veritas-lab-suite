import type { CSSProperties, ReactNode } from 'react';

export type DocCell = { label: string; value: ReactNode; title?: boolean };

/**
 * Encabezado de documento controlado: una fila de casillas (documento, código, revisión…)
 * con etiqueta en mayúsculas monoespaciadas. En pantallas angostas pasa a 2 columnas
 * y la primera casilla (el título) ocupa el ancho completo.
 */
export function DocHeader({ cells, className = '' }: { cells: DocCell[]; className?: string }) {
  const style = { '--doc-cols': Math.max(cells.length - 1, 1) } as CSSProperties;
  return (
    <dl
      style={style}
      className={`grid grid-cols-2 gap-px border-b border-ink bg-line font-mono text-[0.75rem] lg:grid-cols-[minmax(0,1.6fr)_repeat(var(--doc-cols),minmax(0,1fr))] ${className}`}
    >
      {cells.map((cell, i) => (
        <div key={cell.label} className={`grid content-start gap-0.5 bg-surface px-3 py-2 ${i === 0 || (i === cells.length - 1 && cells.length % 2 === 0) ? 'col-span-2 lg:col-span-1' : ''}`}>
          <dt className="text-[0.625rem] uppercase tracking-[0.1em] text-muted">{cell.label}</dt>
          <dd className={cell.title ? 'font-serif text-[0.95rem] font-semibold leading-snug' : 'font-semibold [font-variant-numeric:tabular-nums]'}>
            {cell.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Encabezado de sección numerada: «§ 2  Título ………… nota». */
export function SectionHead({ n, title, note, id }: { n: string; title: string; note?: ReactNode; id?: string }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-3 border-b border-ink pb-1.5 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
      <span className="font-mono text-sm font-semibold text-accent">§ {n}</span>
      <h2 id={id} className="text-xl font-semibold tracking-tight sm:text-2xl">
        {title}
      </h2>
      {note ? <span className="col-span-2 font-mono text-[0.6875rem] text-muted sm:col-span-1">{note}</span> : null}
    </div>
  );
}
