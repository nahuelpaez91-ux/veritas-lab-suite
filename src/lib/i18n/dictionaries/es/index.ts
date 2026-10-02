import { about } from './about';
import { ai } from './ai';
import { aiPolicy } from './aiPolicy';
import { base } from './base';
import { curva } from './curva';
import { custodia } from './custodia';
import { credentials } from './credentials';
import { cv } from './cv';
import { enlace } from './enlace';
import { home } from './home';
import { informe } from './informe';
import { margen } from './margen';
import { qc } from './qc';
import { validation } from './validation';

export const es = {
  ...base,
  ai,
  validation,
  aiPolicy,
  about,
  home,
  cv,
  credentials,
  tools: { enlace, qc, custodia, informe, curva, margen },
};
