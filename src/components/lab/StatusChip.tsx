import type { ReactNode } from 'react';

const tones = {
  ok: 'border-ok/40 bg-ok/10 text-ok',
  warn: 'border-warn/40 bg-warn/10 text-warn',
  danger: 'border-danger/40 bg-danger/10 text-danger',
  neutral: 'border-line bg-bg text-muted',
} as const;

export type ChipTone = keyof typeof tones;

export function StatusChip({ tone, children, testId }: { tone: ChipTone; children: ReactNode; testId?: string }) {
  return (
    <span data-testid={testId} className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>
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
