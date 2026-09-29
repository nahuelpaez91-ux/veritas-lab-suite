import { profile } from '@/content/profile';
import type { ModuleContent } from '@/content/types';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

export function VerifiedBadge({ dict, verified }: { dict: Dictionary; verified: ModuleContent['verifiedAgainst'] }) {
  return (
    <p className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-full border border-ok/40 bg-ok/10 px-3 py-1 text-xs text-ok">
      <span aria-hidden="true">✔</span>
      <span>
        {dict.module.verified}: {verified.label}
      </span>
      <a className="underline" href={`${profile.repo}/blob/main/${verified.testPath}`}>
        {dict.module.viewTest}
      </a>
    </p>
  );
}
