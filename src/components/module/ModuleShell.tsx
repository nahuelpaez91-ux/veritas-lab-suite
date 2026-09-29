import Link from 'next/link';
import type { ReactNode } from 'react';
import type { ModuleContent } from '@/content/types';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import { Glossary } from './Glossary';
import { ScienceSection } from './ScienceSection';
import { StepGuide } from './StepGuide';
import { VerifiedBadge } from './VerifiedBadge';
import { WhatIsThisModal } from './WhatIsThisModal';

export function ModuleShell({
  lang,
  dict,
  content,
  children,
}: {
  lang: Locale;
  dict: Dictionary;
  content: ModuleContent;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-8">
      <div className="flex flex-wrap items-start justify-between gap-4 py-6">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">{content.area}</p>
          <h1 className="mt-1 text-3xl font-semibold">{content.name}</h1>
          <p className="mt-2 text-muted">{content.tagline}</p>
          <VerifiedBadge dict={dict} verified={content.verifiedAgainst} />
        </div>
        <WhatIsThisModal dict={dict} content={content} />
      </div>
      <StepGuide title={dict.module.guide} steps={content.steps} />
      <section className="mt-6" aria-label={content.name}>
        {children}
      </section>
      <ScienceSection dict={dict} science={content.science} />
      <Glossary title={dict.module.glossary} items={content.glossary} />
      <p className="mt-10">
        <Link href={`/${lang}#modulos`} className="text-sm text-accent hover:underline">
          ← {dict.module.back}
        </Link>
      </p>
    </div>
  );
}
