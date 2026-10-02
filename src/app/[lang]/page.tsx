import { notFound } from 'next/navigation';
import { Capabilities, Contact, Credentials, Flow, HeroSheet, ModuleMatrix, Region, Trajectory } from '@/components/home/HomeSections';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const p = { lang, dict };
  return (
    <div className="mx-auto max-w-6xl px-4 pb-8">
      <HeroSheet {...p} />
      <Flow {...p} />
      <ModuleMatrix {...p} />
      <Trajectory {...p} />
      <Region {...p} />
      <Capabilities {...p} />
      <Credentials {...p} />
      <Contact {...p} />
    </div>
  );
}
