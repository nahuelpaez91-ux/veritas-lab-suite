import type { cv as esCv } from '../es/cv';

export const cv: typeof esCv = {
  variant: 'Version',
  audiences: { nacional: 'National (remote)', local: 'Local (La Rioja / NW Argentina)', global: 'Worldwide (remote)' },
  download: 'Download PDF',
  print: 'Print',
};
