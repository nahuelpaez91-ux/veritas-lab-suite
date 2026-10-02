import type { Dictionary } from '../types';
import { base } from './base';
import { custodia } from './custodia';
import { enlace } from './enlace';
import { qc } from './qc';

export const en: Dictionary = {
  ...base,
  tools: { enlace, qc, custodia },
};
