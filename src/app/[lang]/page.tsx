import { notFound } from 'next/navigation';
import { Availability, Capabilities, Contact, Credentials, Flow, Hero, ModuleGrid, Trajectory } from '@/components/home/HomeSections';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const p = { lang, dict };
  return (
    <div className="mx-auto max-w-6xl px-4 pb-8">
      <Hero {...p} />
      <Availability {...p} />
      <Flow {...p} />
      <ModuleGrid {...p} />
      <Trajectory {...p} />
      <Capabilities {...p} />
      <Credentials {...p} />
      <Contact {...p} />
    </div>
  );
}
