import { useId } from 'react';

const ARC_TEXT = 'ANDRÉS NAHUEL PÁEZ · LA RIOJA · ARGENTINA ·';
const DEFAULT_LABEL = 'Sello ANP · Andrés Nahuel Páez · La Rioja, Argentina';

type SealProps = {
  className?: string;
  /**
   * `full`: doble anillo con el texto en arco (para tamaños de 96 px o más).
   * `compact`: doble anillo con ANP, legible a 32 px (encabezado).
   */
  variant?: 'full' | 'compact';
  /** Línea opcional bajo ANP en la variante `full` (p. ej. «REV a1b2c3d»). Solo datos reales. */
  caption?: string;
  /** Nombre accesible. Si `decorative`, el sello se oculta a lectores de pantalla. */
  label?: string;
  decorative?: boolean;
};

/** Sello circular de lacre. El color sale de `currentColor` (usar `text-accent`). */
export function Seal({ className, variant = 'full', caption, label = DEFAULT_LABEL, decorative = false }: SealProps) {
  const arcId = `seal-arc-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const a11y = decorative ? { 'aria-hidden': true as const, focusable: 'false' as const } : { role: 'img', 'aria-label': label };

  if (variant === 'compact') {
    return (
      <svg viewBox="0 0 34 34" className={className} {...a11y}>
        <circle cx="17" cy="17" r="15.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="17" cy="17" r="12" fill="none" stroke="currentColor" strokeWidth="0.8" />
        <text
          x="17"
          y="20.6"
          textAnchor="middle"
          fill="currentColor"
          style={{ font: '600 10px var(--font-serif)', letterSpacing: '0.02em' }}
        >
          ANP
        </text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 132 132" className={className} {...a11y}>
      <defs>
        <path id={arcId} d="M66,66 m-48,0 a48,48 0 1,1 96,0 a48,48 0 1,1 -96,0" />
      </defs>
      <circle cx="66" cy="66" r="63" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="66" cy="66" r="58" fill="none" stroke="currentColor" strokeWidth="0.6" />
      <circle cx="66" cy="66" r="39" fill="none" stroke="currentColor" strokeWidth="1" />
      <text fill="currentColor" style={{ font: '600 9.2px var(--font-mono)', letterSpacing: '0.18em' }}>
        <textPath href={`#${arcId}`} startOffset="0">
          {ARC_TEXT}
        </textPath>
      </text>
      <text
        x="66"
        y={caption ? 72 : 75}
        textAnchor="middle"
        fill="currentColor"
        style={{ font: '600 25px var(--font-serif)', letterSpacing: '0.01em' }}
      >
        ANP
      </text>
      {caption ? (
        <>
          <line x1="44" y1="80" x2="88" y2="80" stroke="currentColor" strokeWidth="0.8" />
          <text
            x="66"
            y="91"
            textAnchor="middle"
            fill="currentColor"
            style={{ font: '500 7.5px var(--font-mono)', letterSpacing: '0.14em' }}
          >
            {caption}
          </text>
        </>
      ) : null}
    </svg>
  );
}
