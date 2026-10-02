'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/** Recuadro de altura fija para un gráfico que todavía carga (sin texto) o que no tiene datos (con texto). */
export function ChartPlaceholder({ className, text }: { className: string; text?: string }) {
  return (
    <div
      aria-hidden={text ? undefined : true}
      className={`${className} flex items-center justify-center border border-dashed border-line px-4 text-center font-mono text-xs leading-relaxed text-muted`}
    >
      {text}
    </div>
  );
}

/**
 * Estado de carga de una herramienta mientras se hidrata el laboratorio de demostración.
 * Reserva aproximadamente la altura final para que la sección siguiente no se desplace (CLS).
 */
export function ToolLoading({ text, className }: { text: string; className: string }) {
  return (
    <div className={className}>
      <p role="status" className="text-muted">
        {text}
      </p>
    </div>
  );
}

/**
 * Monta `children` recién cuando el recuadro se acerca a la pantalla. Así el chunk de Recharts
 * (cargado con next/dynamic) no compite con la primera pintura en móvil, donde el gráfico queda abajo.
 */
export function WhenVisible({ children, placeholder }: { children: ReactNode; placeholder: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '400px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref}>{visible ? children : placeholder}</div>;
}
