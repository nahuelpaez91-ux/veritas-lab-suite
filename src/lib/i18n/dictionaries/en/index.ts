import type { Dictionary } from '../types';
import { ai } from './ai';
import { base } from './base';
import { curva } from './curva';
import { custodia } from './custodia';
import { enlace } from './enlace';
import { informe } from './informe';
import { margen } from './margen';
import { qc } from './qc';
import { validation } from './validation';

export const en: Dictionary = {
  ...base,
  ai,
  validation,
  tools: { enlace, qc, custodia, informe, curva, margen },
};
