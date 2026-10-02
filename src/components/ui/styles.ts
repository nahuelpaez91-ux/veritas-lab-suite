// Estilo «documento controlado»: sin radios ni sombras, bordes de 1 px, metadatos en monoespaciada.
export const card = 'border border-line bg-surface p-4';
export const btnPrimary =
  'inline-flex items-center justify-center gap-2 border border-ink bg-ink px-4 py-2 font-mono text-sm font-medium tracking-wide text-surface transition-colors hover:border-accent hover:bg-accent hover:text-accent-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-ink disabled:hover:bg-ink disabled:hover:text-surface';
export const btnSecondary =
  'inline-flex items-center justify-center gap-2 border border-ink bg-transparent px-3 py-1.5 font-mono text-sm tracking-wide text-ink transition-colors hover:border-accent hover:bg-accent hover:text-accent-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-ink disabled:hover:bg-transparent disabled:hover:text-ink';
export const input =
  'w-full border border-muted bg-surface px-2 py-1.5 text-sm text-ink focus:border-accent focus:outline-2 focus:outline-offset-0 focus:outline-accent';
export const label = 'block text-sm font-semibold';
export const table =
  'w-full border-collapse text-left text-sm [font-variant-numeric:tabular-nums] [&_th]:border-b [&_th]:border-ink [&_th]:px-2 [&_th]:py-1.5 [&_th]:font-mono [&_th]:text-[0.6875rem] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.1em] [&_th]:text-muted [&_td]:border-b [&_td]:border-line [&_td]:px-2 [&_td]:py-1.5 [&_td]:align-top';
// Contenedor desplazable: sombra en el borde derecho solo cuando hay contenido oculto (ver .scroll-hint).
export const tableWrap = 'scroll-hint overflow-x-auto';
export const h2 = 'text-xl font-semibold tracking-tight';
export const h3 = 'text-base font-semibold';
