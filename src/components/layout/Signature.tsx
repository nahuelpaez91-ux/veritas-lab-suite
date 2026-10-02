import { HandSignature } from '@/components/brand/HandSignature';
import { profile } from '@/content/profile';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

/** Bloque de firma: rótulo, trazo sobre la línea, nombre, leyenda y contacto. */
export function Signature({ dict }: { dict: Dictionary }) {
  return (
    <div className="grid max-w-xs gap-1">
      <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted">{dict.signature.signedBy}</p>
      <div className="relative h-11 w-[min(15rem,100%)] border-b border-ink">
        <HandSignature className="absolute -bottom-0.5 left-0 h-11 w-44 text-ink" />
      </div>
      <p className="mt-1 text-base font-semibold text-ink">{profile.name}</p>
      <p className="text-sm text-muted">{dict.signature.tagline}</p>
      <p className="font-mono text-xs text-muted">
        <a className="underline decoration-line underline-offset-4 hover:text-accent hover:decoration-accent" href={profile.repo}>
          {dict.signature.repo}
        </a>
        {' · '}
        <a
          className="break-all underline decoration-line underline-offset-4 hover:text-accent hover:decoration-accent"
          href={`mailto:${profile.email}`}
        >
          {profile.email}
        </a>
      </p>
    </div>
  );
}
