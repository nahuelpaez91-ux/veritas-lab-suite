import { profile } from '@/content/profile';

type VertexMarkProps = {
  className?: string;
  /** Muestra las coordenadas en monoespaciada junto al vértice. */
  showCoords?: boolean;
  /** Nombre accesible del símbolo. */
  label?: string;
};

/**
 * Vértice geodésico (triángulo con punto) sobre dos curvas de nivel, con las coordenadas de La Rioja.
 * El triángulo usa `currentColor`; las curvas, el color de línea.
 */
export function VertexMark({ className, showCoords = true, label = 'Vértice geodésico, La Rioja' }: VertexMarkProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className ?? ''}`}>
      <svg viewBox="0 0 86 78" className="h-12 w-12 shrink-0" role="img" aria-label={label}>
        <g fill="none" stroke="var(--color-line)" strokeWidth="1">
          <ellipse cx="43" cy="44" rx="40" ry="32" />
          <ellipse cx="44" cy="45" rx="30" ry="23" />
        </g>
        <path d="M43 14 L69 60 H17 Z" fill="var(--color-surface)" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="miter" />
        <circle cx="43" cy="44" r="3" fill="currentColor" />
      </svg>
      {showCoords ? (
        <span className="font-mono text-xs leading-snug text-muted">
          <span className="block text-ink">{profile.coordinates}</span>
          <span className="block">{profile.location}</span>
        </span>
      ) : null}
    </span>
  );
}
