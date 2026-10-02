'use client';

import { btnSecondary } from './styles';

export function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" className={`${btnSecondary} print:hidden`} onClick={() => window.print()}>
      {label}
    </button>
  );
}
