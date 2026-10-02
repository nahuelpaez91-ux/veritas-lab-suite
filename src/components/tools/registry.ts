import type { ComponentType } from 'react';
import type { ModuleSlug } from '@/content/types';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import { CurvaTool } from './CurvaTool';
import { CustodiaTool } from './CustodiaTool';
import { EnlaceTool } from './EnlaceTool';
import { InformeTool } from './InformeTool';
import { MargenTool } from './MargenTool';
import { QcTool } from './QcTool';

export type ToolProps = { dict: Dictionary; lang: Locale };

// Cada tarea de herramienta (T22–T27) agrega su entrada.
export const toolRegistry: Partial<Record<ModuleSlug, ComponentType<ToolProps>>> = {
  enlace: EnlaceTool,
  qc: QcTool,
  custodia: CustodiaTool,
  informe: InformeTool,
  curva: CurvaTool,
  margen: MargenTool,
};
