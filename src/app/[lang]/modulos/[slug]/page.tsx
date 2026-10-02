import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ModuleShell } from '@/components/module/ModuleShell';
import { toolRegistry } from '@/components/tools/registry';
import { isModuleSlug, moduleOrder, modules } from '@/content/modules';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

type Params = Promise<{ lang: string; slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return moduleOrder.filter((slug) => toolRegistry[slug]).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang) || !isModuleSlug(slug)) return {};
  const content = modules[slug][lang];
  return { title: content.name, description: content.tagline };
}

export default async function ModulePage({ params }: { params: Params }) {
  const { lang, slug } = await params;
  if (!isLocale(lang) || !isModuleSlug(slug)) notFound();
  const Tool = toolRegistry[slug];
  if (!Tool) notFound();
  const dict = getDictionary(lang);
  return (
    <ModuleShell lang={lang} dict={dict} content={modules[slug][lang]}>
      <Tool dict={dict} lang={lang} />
    </ModuleShell>
  );
}
