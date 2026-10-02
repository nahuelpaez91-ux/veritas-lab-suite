import type { Locale } from '@/lib/i18n/config';

export type AssistTask = 'explain_violation' | 'draft_capa';

export interface AssistContext {
  analyte: string;
  runId: string;
  status: 'accept' | 'warning' | 'reject';
  rules: string[];
  points: { level: string; value: number; z: number }[];
  correctiveAction?: string;
}

export const ASSIST_SYSTEM = `Sos un asistente para un laboratorio de análisis que usa control de calidad interno con reglas de Westgard.
Reglas estrictas:
- La aceptación o el rechazo de la corrida ya los calculó un código determinista y verificado; te llegan como dato. Nunca los cambies ni los contradigas.
- No inventes valores, lotes, equipos, personas ni fechas que no estén en el contexto.
- Tu texto es un BORRADOR que un profesional debe revisar y aprobar.
- Máximo 180 palabras, en el idioma pedido, en texto plano con viñetas simples.`;

export function buildAssistPrompt(task: AssistTask, lang: Locale, context: AssistContext): string {
  const language = lang === 'es' ? 'español' : 'English';
  const instruction =
    task === 'explain_violation'
      ? 'Explicá qué significan las reglas violadas en esta corrida, qué tipo de error sugieren (aleatorio o sistemático) y qué verificaría primero el analista.'
      : 'Redactá un borrador de acción correctiva y preventiva (CAPA) para esta corrida: descripción, causa probable a investigar, acción inmediata, acción preventiva y verificación de eficacia.';
  return `${instruction}\nIdioma de la respuesta: ${language}.\nContexto (JSON):\n${JSON.stringify(context)}`;
}
