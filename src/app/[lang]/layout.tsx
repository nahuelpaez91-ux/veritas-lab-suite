import type { Metadata } from 'next';
import { Red_Hat_Mono, Source_Serif_4 } from 'next/font/google';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import '../globals.css';
import { LabStoreProvider } from '@/components/lab/LabStoreProvider';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { profile } from '@/content/profile';
import { isLocale, locales } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

// Fuente variable (400–700 en el eje wght) con eje óptico opsz para títulos y texto.
const serif = Source_Serif_4({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--font-source-serif',
  display: 'swap',
});
const mono = Red_Hat_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-red-hat-mono', display: 'swap' });

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    metadataBase: new URL(profile.siteUrl),
    title: { default: dict.meta.title, template: `%s · ${dict.meta.shortTitle}` },
    description: dict.meta.description,
    alternates: { languages: { es: '/es', en: '/en' } },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      siteName: 'Andrés Nahuel Páez · Portfolio',
      locale: lang === 'es' ? 'es_AR' : 'en_US',
      type: 'website',
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  return (
    <html lang={lang} className={`${serif.variable} ${mono.variable}`}>
      <body className="min-h-screen antialiased">
        <LabStoreProvider>
          <SiteHeader lang={lang} dict={dict} />
          <main>{children}</main>
          <SiteFooter dict={dict} />
        </LabStoreProvider>
      </body>
    </html>
  );
}
