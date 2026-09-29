import type { ReactNode } from 'react';

export function Term({ children, definition }: { children: ReactNode; definition: string }) {
  return (
    <abbr title={definition} className="cursor-help underline decoration-dotted underline-offset-2">
      {children}
    </abbr>
  );
}
