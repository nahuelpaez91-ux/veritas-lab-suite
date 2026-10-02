import type { Locale } from '@/lib/i18n/config';
import type { AssistContext, AssistTask } from './prompts';

const RULES: Record<string, { es: string; en: string; systematic: boolean }> = {
  '1-2s': {
    es: 'un control superó ±2 DE; es una advertencia que obliga a revisar las demás reglas',
    en: 'a control exceeded ±2 SD; a warning that triggers inspection of the other rules',
    systematic: false,
  },
  '1-3s': {
    es: 'un control superó ±3 DE; sugiere un error aleatorio grande (pipeteo, burbujas, control mal reconstituido)',
    en: 'a control exceeded ±3 SD; suggests a large random error (pipetting, bubbles, poorly reconstituted control)',
    systematic: false,
  },
  '2-2s': {
    es: 'dos resultados superaron 2 DE del mismo lado; sugiere un error sistemático (calibración, lote de reactivo, deriva del equipo)',
    en: 'two results exceeded 2 SD on the same side; suggests a systematic error (calibration, reagent lot, instrument drift)',
    systematic: true,
  },
  'R-4s': {
    es: 'la diferencia entre niveles supera 4 DE; sugiere un error aleatorio (imprecisión)',
    en: 'the difference between levels exceeds 4 SD; suggests random error (imprecision)',
    systematic: false,
  },
  '4-1s': {
    es: 'cuatro resultados seguidos del mismo lado de 1 DE; sugiere un error sistemático pequeño (deriva)',
    en: 'four consecutive results beyond 1 SD on the same side; suggests a small systematic error (drift)',
    systematic: true,
  },
  '10x': {
    es: 'diez resultados seguidos del mismo lado de la media; sugiere un sesgo sostenido',
    en: 'ten consecutive results on the same side of the mean; suggests a sustained bias',
    systematic: true,
  },
};

const STATUS = {
  es: { accept: 'aceptada', warning: 'aceptada con advertencia', reject: 'rechazada' },
  en: { accept: 'accepted', warning: 'accepted with a warning', reject: 'rejected' },
};

export function offlineDraft(task: AssistTask, lang: Locale, ctx: AssistContext): string {
  const es = lang === 'es';
  const known = ctx.rules.filter((r) => RULES[r]);
  const systematic = known.some((r) => RULES[r].systematic);
  const header = es
    ? `Texto automático por reglas (sin IA) · corrida ${ctx.runId} (${ctx.analyte})`
    : `Rule-based automatic text (no AI) · run ${ctx.runId} (${ctx.analyte})`;
  const decision = es
    ? `Decisión: la corrida ya fue ${STATUS.es[ctx.status]} por el código verificado; este texto no la modifica.`
    : `Decision: the run was already ${STATUS.en[ctx.status]} by the verified code; this text does not change it.`;

  if (known.length === 0) {
    return [
      header,
      es ? 'La corrida no viola reglas de Westgard: no requiere acción correctiva.' : 'The run violates no Westgard rules: no corrective action is required.',
      decision,
    ].join('\n');
  }

  const bullets = known.map((r) => `• ${r}: ${es ? RULES[r].es : RULES[r].en}.`);
  const firstChecks = systematic
    ? es
      ? 'revisar la calibración, el lote y la fecha de apertura del reactivo, y el mantenimiento del equipo'
      : 'check calibration, reagent lot and opening date, and instrument maintenance'
    : es
      ? 'revisar la reconstitución del control, el pipeteo y la presencia de burbujas, y repetir el control'
      : 'check control reconstitution, pipetting and bubbles, then repeat the control';

  if (task === 'explain_violation') {
    return [header, ...bullets, es ? `Primeros pasos sugeridos: ${firstChecks}.` : `Suggested first checks: ${firstChecks}.`, decision].join('\n');
  }

  return es
    ? [
        header,
        `Descripción: la corrida ${ctx.runId} violó ${known.join(', ')}.`,
        `Causa probable a investigar: error ${systematic ? 'sistemático' : 'aleatorio'}; ${firstChecks}.`,
        'Acción inmediata: no liberar resultados de pacientes de la corrida; corregir y repetir los controles.',
        `Acción preventiva: ${systematic ? 'reforzar la verificación de calibración y el control de cambios de lote' : 'reentrenar en la preparación del control y revisar el procedimiento'}.`,
        'Verificación de eficacia: 20 corridas siguientes sin rechazos por la misma regla.',
        decision,
      ].join('\n')
    : [
        header,
        `Description: run ${ctx.runId} violated ${known.join(', ')}.`,
        `Probable cause to investigate: ${systematic ? 'systematic' : 'random'} error; ${firstChecks}.`,
        'Immediate action: do not release patient results from this run; correct and repeat the controls.',
        `Preventive action: ${systematic ? 'strengthen calibration verification and lot-change control' : 'retrain on control preparation and review the procedure'}.`,
        'Effectiveness check: next 20 runs with no rejections by the same rule.',
        decision,
      ].join('\n');
}
