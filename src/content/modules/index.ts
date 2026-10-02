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

// Código de documento de cada módulo (encabezado «MOD-…»).
export const moduleCodes: Record<ModuleSlug, string> = {
  enlace: 'MOD-ENL',
  qc: 'MOD-QC',
  custodia: 'MOD-CUS',
  informe: 'MOD-INF',
  curva: 'MOD-CUR',
  margen: 'MOD-MAR',
};
