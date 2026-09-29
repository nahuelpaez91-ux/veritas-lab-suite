import { profile } from '@/content/profile';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import { Monogram } from './Monogram';

export function Signature({ dict }: { dict: Dictionary }) {
  return (
    <div className="flex items-center gap-3">
      <Monogram className="h-11 w-11 shrink-0 text-ink" />
      <div className="text-sm">
        <p className="text-xs uppercase tracking-widest text-muted">{dict.signature.designed}</p>
        <p className="font-semibold text-ink">{profile.name}</p>
        <p className="text-xs text-muted">
          <a className="hover:text-accent" href={profile.repo}>
            {dict.signature.repo}
          </a>
          {' · '}
          <a className="hover:text-accent" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
        </p>
      </div>
    </div>
  );
}
