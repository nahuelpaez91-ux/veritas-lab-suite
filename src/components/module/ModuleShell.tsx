import Link from 'next/link';
import type { ReactNode } from 'react';
import type { ModuleContent } from '@/content/types';
import { DemoBar } from '@/components/lab/DemoBar';
import { moduleCodes, moduleOrder, modules } from '@/content/modules';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import { DocHeader, SectionHead } from './DocHeader';
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
  const t = dict.validation.doc;
  const slug = moduleOrder.find((s) => modules[s][lang] === content);
  const code = slug ? moduleCodes[slug] : 'MOD';
  return (
    <div className="mx-auto max-w-6xl px-4 pb-8">
      <DemoBar dict={dict} />

      <header className="mt-6 border border-ink bg-surface">
        <DocHeader
          cells={[
            { label: t.document, value: content.name, title: true },
            { label: t.code, value: <span className="text-accent">{code}</span> },
            { label: t.area, value: content.area },
            { label: t.verdict, value: <VerifiedBadge dict={dict} verified={content.verifiedAgainst} /> },
          ]}
        />
        <div className="grid gap-x-8 gap-y-4 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="font-mono text-xs tracking-[0.04em] text-accent">
              {code} · {content.area}
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight [font-variation-settings:'opsz'_60] sm:text-5xl">
              {content.name}
            </h1>
            <p className="mt-3 text-lg leading-relaxed">{content.tagline}</p>
          </div>
          <WhatIsThisModal dict={dict} content={content} code={code} />
        </div>
        <p className="grid gap-1 border-t border-line px-4 py-2 font-mono text-xs sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-3 sm:px-6">
          <span className="uppercase tracking-[0.1em] text-muted">{t.reference}</span>
          <span>{content.verifiedAgainst.label}</span>
        </p>
      </header>

      <div className="mt-10">
        <StepGuide n="1" title={dict.module.guide} steps={content.steps} note={`${content.steps.length} · ${code}`} />
      </div>

      <section className="mt-12" aria-label={content.name}>
        <SectionHead n="2" title={t.toolSection} note={code} />
        <div className="mt-4">{children}</div>
      </section>

      <ScienceSection n="3" code={code} dict={dict} science={content.science} />
      <Glossary n="4" title={dict.module.glossary} items={content.glossary} />
      <p className="mt-10 border-t border-ink pt-3 font-mono text-sm">
        <Link href={`/${lang}#modulos`} className="text-accent underline-offset-2 hover:underline">
          ← {dict.module.back}
        </Link>
      </p>
    </div>
  );
}
