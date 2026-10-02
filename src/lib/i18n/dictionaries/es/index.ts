import { base } from './base';
import { custodia } from './custodia';
import { enlace } from './enlace';
import { qc } from './qc';

export const es = {
  ...base,
  tools: { enlace, qc, custodia },
};
