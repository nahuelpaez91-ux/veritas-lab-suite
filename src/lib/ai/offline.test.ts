import { describe, expect, it } from 'vitest';
import { offlineDraft } from './offline';
import { buildAssistPrompt, type AssistContext } from './prompts';

const ctx: AssistContext = {
  analyte: 'GLU',
  runId: 'GLU-R021',
  status: 'reject',
  rules: ['1-2s', '2-2s'],
  points: [
    { level: 'N1', value: 101, z: 2.4 },
    { level: 'N2', value: 264, z: 2.33 },
  ],
};

describe('asistente', () => {
  it('[AI-URS-01] el modo sin conexión explica cada regla, se declara sin IA y no cambia la decisión', () => {
    const es = offlineDraft('explain_violation', 'es', ctx);
    expect(es).toContain('sin IA');
    expect(es).toContain('2-2s');
    expect(es).toContain('sistemático');
    expect(es).toContain('rechazada');
    const capa = offlineDraft('draft_capa', 'en', ctx);
    expect(capa).toContain('no AI');
    expect(capa).toContain('Preventive action');
    expect(offlineDraft('explain_violation', 'es', { ...ctx, rules: [], status: 'accept' })).toContain('no viola');
  });

  it('[AI-URS-02] el prompt entrega la decisión ya calculada como dato y pide un borrador acotado', () => {
    const prompt = buildAssistPrompt('explain_violation', 'es', ctx);
    expect(prompt).toContain('"status":"reject"');
    expect(prompt).toContain('"rules":["1-2s","2-2s"]');
    expect(prompt).toContain('español');
  });
});
