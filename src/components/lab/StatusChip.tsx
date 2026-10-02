import type { ReactNode } from 'react';

// Sello de estado: rectangular, en mayúsculas monoespaciadas. El texto del DOM no cambia (lo verifican los e2e).
const tones = {
  ok: 'border-ok text-ok',
  warn: 'border-warn text-warn',
  danger: 'border-danger text-danger',
  neutral: 'border-line text-muted',
} as const;

export type ChipTone = keyof typeof tones;

export function StatusChip({ tone, children, testId }: { tone: ChipTone; children: ReactNode; testId?: string }) {
  return (
    <span
      data-testid={testId}
      className={`inline-flex items-center border bg-surface px-1.5 py-px font-mono text-[0.6875rem] font-semibold uppercase leading-normal tracking-[0.06em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function runTone(status: 'accept' | 'warning' | 'reject' | null): ChipTone {
  if (status === 'accept') return 'ok';
  if (status === 'warning') return 'warn';
  if (status === 'reject') return 'danger';
  return 'neutral';
}
