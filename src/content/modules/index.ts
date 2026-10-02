import type { LocalizedModule, ModuleSlug } from '../types';
import { curva } from './curva';
import { custodia } from './custodia';
import { enlace } from './enlace';
import { informe } from './informe';
import { margen } from './margen';
import { qc } from './qc';

export const moduleOrder: ModuleSlug[] = ['enlace', 'qc', 'custodia', 'informe', 'curva', 'margen'];

export const modules: Record<ModuleSlug, LocalizedModule> = { enlace, qc, custodia, informe, curva, margen };

export function isModuleSlug(value: string): value is ModuleSlug {
  return (moduleOrder as string[]).includes(value);
}
