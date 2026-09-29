import type { Dictionary } from '@/lib/i18n/get-dictionary';
import { Signature } from './Signature';

export function SiteFooter({ dict }: { dict: Dictionary }) {
  return (
    <footer className="mt-16 border-t border-line bg-surface print:hidden">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between">
        <Signature dict={dict} />
        <p className="max-w-md text-xs text-muted">{dict.demoBar.disclaimer}</p>
      </div>
    </footer>
  );
}
