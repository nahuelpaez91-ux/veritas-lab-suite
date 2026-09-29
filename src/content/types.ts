import type { Locale } from '@/lib/i18n/config';

export type ModuleSlug = 'enlace' | 'qc' | 'custodia' | 'informe' | 'curva' | 'margen';

export interface ModuleContent {
  name: string;
  area: string;
  tagline: string;
  whatSolves: string;
  howItWorks: string[];
  dataSources: { variable: string; source: string }[];
  whereElse: string[];
  steps: string[];
  science: { formula: string; standard: string; workedExample: string };
  glossary: { term: string; definition: string }[];
  verifiedAgainst: { label: string; testPath: string };
}

export type LocalizedModule = Record<Locale, ModuleContent>;
