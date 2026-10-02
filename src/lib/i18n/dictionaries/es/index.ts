import { base } from './base';
import { curva } from './curva';
import { custodia } from './custodia';
import { enlace } from './enlace';
import { informe } from './informe';
import { qc } from './qc';

export const es = {
  ...base,
  tools: { enlace, qc, custodia, informe, curva },
};
