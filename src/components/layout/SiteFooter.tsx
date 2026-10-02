import { VertexMark } from '@/components/brand/VertexMark';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import { Signature } from './Signature';

export function SiteFooter({ dict }: { dict: Dictionary }) {
  return (
    <footer className="mt-16 border-t border-ink bg-surface print:hidden">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.2fr)] md:items-end md:gap-10">
        <Signature dict={dict} />
        <VertexMark className="text-ink" label={dict.signature.vertex} />
        <p className="max-w-prose font-mono text-xs leading-relaxed text-muted md:justify-self-end">{dict.demoBar.disclaimer}</p>
      </div>
    </footer>
  );
}
