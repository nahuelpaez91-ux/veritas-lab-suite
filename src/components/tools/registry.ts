import type { ComponentType } from 'react';
import type { ModuleSlug } from '@/content/types';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import { EnlaceTool } from './EnlaceTool';
import { QcTool } from './QcTool';

export type ToolProps = { dict: Dictionary; lang: Locale };

// Cada tarea de herramienta (T22–T27) agrega su entrada.
export const toolRegistry: Partial<Record<ModuleSlug, ComponentType<ToolProps>>> = {
  enlace: EnlaceTool,
  qc: QcTool,
};
