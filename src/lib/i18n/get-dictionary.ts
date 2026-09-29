import type { Locale } from './config';
import { en } from './dictionaries/en';
import { es } from './dictionaries/es';
import type { Dictionary } from './dictionaries/types';

export type { Dictionary };

export function getDictionary(locale: Locale): Dictionary {
  return locale === 'en' ? en : es;
}
