import { StatusChip } from '@/components/lab/StatusChip';
import { profile } from '@/content/profile';
import type { ModuleContent } from '@/content/types';
import { testFileVerdict } from '@/content/validation/summary';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

/** Dictamen real del módulo: resultado de su archivo de tests en el último reporte (traceability.json). */
export function VerifiedBadge({ dict, verified }: { dict: Dictionary; verified: ModuleContent['verifiedAgainst'] }) {
  const t = dict.validation.doc;
  const v = testFileVerdict(verified.testPath);
  const text = v.total === 0 ? t.noData : `${v.conforme ? t.conforme : t.noConforme} · ${v.passed}/${v.total}`;
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      <StatusChip tone={v.total === 0 ? 'neutral' : v.conforme ? 'ok' : 'danger'} testId="module-verdict">
        {text}
      </StatusChip>
      <a
        className="font-normal text-accent underline decoration-1 underline-offset-2 hover:decoration-2"
        href={`${profile.repo}/blob/main/${verified.testPath}`}
      >
        {dict.module.viewTest}
      </a>
    </span>
  );
}
