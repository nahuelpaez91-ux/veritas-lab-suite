# Fase 1 · Parte 5: IA con barandas, validación, páginas, CV y publicación (T28–T37)

> Parte del plan `2026-09-29-fase1-veritas-lab-suite.md`.
>
> Los diccionarios de nivel superior (`ai`, `validation`, `aiPolicy`, `about`, `home`, `cv`) van **fuera** de `tools`, por ejemplo: `export const es = { ...base, ai, tools: { … } };` (y lo mismo en `en/index.ts`).

---

### Task 28: Asistente de IA con barandas y modo sin conexión

**Files:**
- Create: `src/lib/ai/prompts.ts`, `src/lib/ai/offline.ts`, `src/lib/ai/offline.test.ts`, `src/app/api/assist/route.ts`, `src/lib/i18n/dictionaries/es/ai.ts`, `src/lib/i18n/dictionaries/en/ai.ts`, `src/components/tools/AssistButton.tsx`, `.env.example`
- Modify: ambos `index.ts`, `src/components/tools/QcTool.tsx`

**Comportamiento:**
- Con `ANTHROPIC_API_KEY` en el servidor: usa Claude (`claude-opus-5`, esfuerzo bajo, fallback automático del servidor ante rechazos).
- Sin la key (situación actual de Andrés) o ante cualquier error: modo sin conexión con plantillas deterministas, etiquetado **"sin IA"**.
- En ambos casos el texto es un borrador. Solo se registra en el audit trail si una persona lo aprueba.

- [ ] **Step 1: Test que falla**

`src/lib/ai/offline.test.ts`:

```ts
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
```

- [ ] **Step 2: Verificar que falla**

Run: `npx vitest run src/lib/ai/offline.test.ts`
Esperado: FAIL.

- [ ] **Step 3: Prompts**

`src/lib/ai/prompts.ts`:

```ts
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
```

- [ ] **Step 4: Modo sin conexión**

`src/lib/ai/offline.ts`:

```ts
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
```

- [ ] **Step 5: Verificar que pasa**

Run: `npx vitest run src/lib/ai/offline.test.ts`
Esperado: `2 passed`.

- [ ] **Step 6: Ruta server-side**

`src/app/api/assist/route.ts`:

```ts
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ASSIST_SYSTEM, buildAssistPrompt } from '@/lib/ai/prompts';
import { canonicalJson, sha256Hex } from '@/lib/crypto';

export const runtime = 'nodejs';

const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-opus-5';

const bodySchema = z.object({
  task: z.enum(['explain_violation', 'draft_capa']),
  lang: z.enum(['es', 'en']),
  context: z.object({
    analyte: z.string().max(20),
    runId: z.string().max(40),
    status: z.enum(['accept', 'warning', 'reject']),
    rules: z.array(z.string().max(10)).max(12),
    points: z.array(z.object({ level: z.string().max(10), value: z.number(), z: z.number() })).max(6),
    correctiveAction: z.string().max(500).optional(),
  }),
});

// Límite simple por instancia: 10 pedidos cada 10 minutos por IP.
const hits = new Map<string, { count: number; resetAt: number }>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || h.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + 10 * 60_000 });
    return false;
  }
  h.count += 1;
  return h.count > 10;
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (rateLimited(ip)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  const { task, lang, context } = parsed.data;
  const userPrompt = buildAssistPrompt(task, lang, context);

  const client = new Anthropic();
  // `fallbacks: "default"` reencamina en el servidor si el modelo declina; los tipos del SDK pueden no incluirlo aún.
  const params = {
    model: MODEL,
    max_tokens: 2000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low' },
    system: ASSIST_SYSTEM,
    messages: [{ role: 'user', content: userPrompt }],
  } as unknown as Anthropic.Beta.Messages.MessageCreateParamsNonStreaming;

  try {
    const response = await client.beta.messages.create(params);
    if (response.stop_reason === 'refusal') return NextResponse.json({ error: 'refused' }, { status: 422 });
    const text = response.content
      .flatMap((block) => (block.type === 'text' ? [block.text] : []))
      .join('\n')
      .trim();
    const [promptHash, outputHash] = await Promise.all([
      sha256Hex(canonicalJson({ system: ASSIST_SYSTEM, user: userPrompt })),
      sha256Hex(text),
    ]);
    return NextResponse.json({ text, model: response.model, promptHash, outputHash });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return NextResponse.json({ error: 'upstream_rate_limited' }, { status: 429 });
    if (error instanceof Anthropic.APIError) {
      console.error('assist: Anthropic API error', error.status);
      return NextResponse.json({ error: 'upstream_error' }, { status: 502 });
    }
    throw error;
  }
}
```

Si `tsc` marca el nombre del tipo del cast, usar el que indique el compilador para los parámetros no-streaming de `client.beta.messages.create` (por ejemplo `Anthropic.Beta.MessageCreateParamsNonStreaming`). El cast solo existe para admitir `fallbacks`.

`.env.example`:

```
# Opcional. Sin esta variable el asistente funciona en modo sin conexión (reglas, sin IA).
ANTHROPIC_API_KEY=
# Opcional. Modelo a usar (por defecto claude-opus-5).
ANTHROPIC_MODEL=
```

- [ ] **Step 7: Diccionarios**

`src/lib/i18n/dictionaries/es/ai.ts`:

```ts
export const ai = {
  explain: 'Explicar la corrida',
  draftCapa: 'Borrador de CAPA',
  loading: 'Generando borrador…',
  aiLabel: 'BORRADOR GENERADO CON IA (Claude) · requiere revisión humana',
  offlineLabel: 'TEXTO AUTOMÁTICO POR REGLAS (sin IA) · requiere revisión humana',
  model: 'Modelo',
  approve: 'Aprobar y registrar en el audit trail',
  discard: 'Descartar',
  approved: 'Borrador aprobado y registrado (modelo, hash del prompt y del texto).',
  note: 'La IA no decide: explica y redacta sobre un resultado que ya calculó el código verificado.',
};
```

`src/lib/i18n/dictionaries/en/ai.ts`:

```ts
import type { ai as esAi } from '../es/ai';

export const ai: typeof esAi = {
  explain: 'Explain the run',
  draftCapa: 'Draft CAPA',
  loading: 'Generating draft…',
  aiLabel: 'AI-GENERATED DRAFT (Claude) · requires human review',
  offlineLabel: 'RULE-BASED AUTOMATIC TEXT (no AI) · requires human review',
  model: 'Model',
  approve: 'Approve and record in audit trail',
  discard: 'Discard',
  approved: 'Draft approved and recorded (model, prompt hash and text hash).',
  note: 'AI does not decide: it explains and drafts on a result the verified code already computed.',
};
```

Registrar `ai` a nivel superior en ambos índices.

- [ ] **Step 8: Botón del asistente**

`src/components/tools/AssistButton.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useLab } from '@/components/lab/LabStoreProvider';
import { btnPrimary, btnSecondary } from '@/components/ui/styles';
import { offlineDraft } from '@/lib/ai/offline';
import { ASSIST_SYSTEM, buildAssistPrompt, type AssistContext, type AssistTask } from '@/lib/ai/prompts';
import { canonicalJson, sha256Hex } from '@/lib/crypto';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import { recordAiDraft } from '@/lib/lims/actions';

interface Draft {
  task: AssistTask;
  mode: 'ai' | 'offline';
  text: string;
  model: string;
  promptHash: string;
  outputHash: string;
}

export function AssistButton({
  dict,
  lang,
  tasks,
  context,
}: {
  dict: Dictionary;
  lang: Locale;
  tasks: AssistTask[];
  context: AssistContext;
}) {
  const t = dict.ai;
  const { run } = useLab();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  async function live(task: AssistTask): Promise<Draft | null> {
    try {
      const res = await fetch('/api/assist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ task, lang, context }),
      });
      if (!res.ok) return null;
      const body = (await res.json()) as { text: string; model: string; promptHash: string; outputHash: string };
      return { task, mode: 'ai', ...body };
    } catch {
      return null;
    }
  }

  async function offline(task: AssistTask): Promise<Draft> {
    const text = offlineDraft(task, lang, context);
    const [promptHash, outputHash] = await Promise.all([
      sha256Hex(canonicalJson({ system: ASSIST_SYSTEM, user: buildAssistPrompt(task, lang, context) })),
      sha256Hex(text),
    ]);
    return { task, mode: 'offline', text, model: 'offline-rules', promptHash, outputHash };
  }

  async function generate(task: AssistTask) {
    setLoading(true);
    setNotice('');
    const next = (await live(task)) ?? (await offline(task));
    setDraft(next);
    setLoading(false);
  }

  async function approve() {
    if (!draft) return;
    const d = draft;
    const res = await run((s, u, at) =>
      recordAiDraft(
        s,
        { task: d.task, model: d.model, promptHash: d.promptHash, outputHash: d.outputHash, entity: 'qc_run', entityId: context.runId },
        u,
        at,
      ),
    );
    if (res.ok) {
      setDraft(null);
      setNotice(t.approved);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {tasks.map((task) => (
          <button
            key={task}
            type="button"
            data-testid={`assist-${task}`}
            className={btnSecondary}
            disabled={loading}
            onClick={() => generate(task)}
          >
            ✦ {task === 'explain_violation' ? t.explain : t.draftCapa}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted">{t.note}</p>
      {loading && <p className="text-sm text-muted">{t.loading}</p>}
      {draft && (
        <div data-testid="assist-draft" className="rounded-lg border border-accent/40 bg-accent-soft p-3">
          <p className="font-mono text-xs font-semibold tracking-wide text-accent">
            {draft.mode === 'ai' ? t.aiLabel : t.offlineLabel}
          </p>
          <p className="mt-1 text-xs text-muted">
            {t.model}: <span className="font-mono">{draft.model}</span>
          </p>
          <pre className="mt-2 whitespace-pre-wrap font-sans text-sm">{draft.text}</pre>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" data-testid="assist-approve" className={btnPrimary} onClick={approve}>
              {t.approve}
            </button>
            <button type="button" className={btnSecondary} onClick={() => setDraft(null)}>
              {t.discard}
            </button>
          </div>
        </div>
      )}
      {notice && (
        <p role="status" className="text-sm text-ok">
          {notice}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 9: Conectar el asistente al módulo QC**

En `src/components/tools/QcTool.tsx`:

1. Agregar el import: `import { AssistButton } from './AssistButton';`
2. Cambiar la firma para recibir `lang`: `export function QcTool({ dict, lang }: ToolProps) {`
3. Justo antes del `<div className="grid gap-6 lg:grid-cols-2">` que contiene el formulario de nueva corrida, insertar:

```tsx
      {view.rows[0] && (
        <div className={card}>
          <h2 className="mb-3 font-semibold">
            {t.aiTitle}: <span className="font-mono">{view.rows[0].run.id}</span>
          </h2>
          <AssistButton
            key={view.rows[0].run.id}
            dict={dict}
            lang={lang}
            tasks={view.rows[0].status === 'reject' ? ['explain_violation', 'draft_capa'] : ['explain_violation']}
            context={{
              analyte,
              runId: view.rows[0].run.id,
              status: view.rows[0].status,
              rules: view.rows[0].rules,
              points: view.rows[0].run.points.map((p) => {
                const tg = view.targets.find((x) => x.level === p.level);
                return { level: p.level, value: p.value, z: tg ? Number(zScore(p.value, tg).toFixed(2)) : 0 };
              }),
              correctiveAction: view.rows[0].run.correctiveAction,
            }}
          />
        </div>
      )}
```

- [ ] **Step 10: Verificar y commit**

1. Run: `npx tsc --noEmit && npm run lint && npx vitest run`. Esperado: todo en verde.
2. Con `npm run dev` y **sin** `.env.local`, en `/es/modulos/qc`:
   - «Explicar la corrida» sobre GLU-R021 muestra el panel «TEXTO AUTOMÁTICO POR REGLAS (sin IA)».
   - «Aprobar» registra `ai.draft_approved`, visible en Custodia → Audit trail completo.

```bash
git add -A
git commit -m "feat: asistente de IA con barandas GxP y modo sin conexión por reglas

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 29: Dossier de validación y matriz de trazabilidad automática

**Files:**
- Create: `src/content/validation/urs.ts`, `src/content/validation/traceability.json`, `scripts/build-traceability.ts`, `src/lib/i18n/dictionaries/es/validation.ts`, `src/lib/i18n/dictionaries/en/validation.ts`, `src/components/ui/PrintButton.tsx`, `src/app/[lang]/validacion/page.tsx`
- Modify: ambos `index.ts`

- [ ] **Step 1: Requisitos de usuario (URS) con evaluación de riesgo**

S = severidad, P = probabilidad, D = detectabilidad, cada una de 1 a 3; RPN = S × P × D.

`src/content/validation/urs.ts`:

```ts
export interface Urs {
  id: string;
  es: string;
  en: string;
  s: 1 | 2 | 3;
  p: 1 | 2 | 3;
  d: 1 | 2 | 3;
}

export const URS: Urs[] = [
  { id: 'STA-URS-01', es: 'Media, DE muestral y CV correctos', en: 'Correct mean, sample SD and CV', s: 3, p: 1, d: 2 },
  { id: 'STA-URS-02', es: 'Cuantil t de Student para IC 95 %', en: 'Student t quantile for 95 % CI', s: 2, p: 1, d: 2 },
  { id: 'STA-URS-03', es: 'Cuantil empírico para intervalos Monte Carlo', en: 'Empirical quantile for Monte Carlo intervals', s: 2, p: 1, d: 2 },
  { id: 'QC-URS-01', es: 'Cálculo de z y rechazo de DE inválida', en: 'z computation and invalid SD rejection', s: 3, p: 1, d: 2 },
  { id: 'QC-URS-02', es: '1-2s es advertencia, no rechazo', en: '1-2s is a warning, not a rejection', s: 2, p: 2, d: 2 },
  { id: 'QC-URS-03', es: '1-3s rechaza la corrida', en: '1-3s rejects the run', s: 3, p: 1, d: 2 },
  { id: 'QC-URS-04', es: '2-2s dentro de un nivel', en: '2-2s within a level', s: 3, p: 2, d: 2 },
  { id: 'QC-URS-05', es: '2-2s entre niveles de la corrida', en: '2-2s across levels in a run', s: 3, p: 2, d: 2 },
  { id: 'QC-URS-06', es: 'R-4s entre niveles', en: 'R-4s across levels', s: 3, p: 2, d: 2 },
  { id: 'QC-URS-07', es: '4-1s dentro de un nivel', en: '4-1s within a level', s: 3, p: 2, d: 2 },
  { id: 'QC-URS-08', es: '10x dentro de un nivel', en: '10x within a level', s: 3, p: 2, d: 2 },
  { id: 'QC-URS-09', es: 'Datos en control → corrida aceptada', en: 'In-control data → accepted run', s: 3, p: 1, d: 2 },
  { id: 'QC-URS-10', es: 'Métrica Sigma', en: 'Sigma metric', s: 1, p: 1, d: 1 },
  { id: 'QC-URS-11', es: 'Datos semilla coherentes con las reglas', en: 'Seed data consistent with the rules', s: 1, p: 1, d: 1 },
  { id: 'QC-URS-12', es: 'Valores faltantes y objetivos duplicados se rechazan', en: 'Missing values and duplicate targets are rejected', s: 3, p: 2, d: 2 },
  { id: 'QC-URS-13', es: '4-1s y 10x entre niveles (materiales)', en: '4-1s and 10x across levels (materials)', s: 3, p: 2, d: 2 },
  { id: 'CAL-URS-01', es: 'Regresión igual a los valores certificados NIST Norris', en: 'Regression matches NIST Norris certified values', s: 3, p: 1, d: 2 },
  { id: 'CAL-URS-02', es: 'Pendiente, ordenada, R² y s y/x del ejemplo resuelto', en: 'Slope, intercept, R² and s y/x of the worked example', s: 3, p: 1, d: 2 },
  { id: 'CAL-URS-03', es: 'LOD y LOQ según ICH Q2', en: 'LOD and LOQ per ICH Q2', s: 2, p: 1, d: 2 },
  { id: 'CAL-URS-04', es: 'Predicción inversa con IC y aviso fuera de rango', en: 'Inverse prediction with CI and out-of-range warning', s: 3, p: 2, d: 2 },
  { id: 'CAL-URS-05', es: 'Regresión ponderada y exigencia x > 0', en: 'Weighted regression and x > 0 requirement', s: 2, p: 1, d: 2 },
  { id: 'CAL-URS-06', es: 'Validación de datos de entrada', en: 'Input data validation', s: 2, p: 2, d: 1 },
  { id: 'UNC-URS-01', es: 'Incertidumbre tipo A', en: 'Type A uncertainty', s: 2, p: 1, d: 2 },
  { id: 'UNC-URS-02', es: 'Conversiones tipo B', en: 'Type B conversions', s: 2, p: 1, d: 2 },
  { id: 'UNC-URS-03', es: 'Presupuesto GUM igual a EURACHEM A1', en: 'GUM budget matches EURACHEM A1', s: 3, p: 1, d: 2 },
  { id: 'UNC-URS-04', es: 'Monte Carlo coincide con la GUM', en: 'Monte Carlo agrees with the GUM', s: 2, p: 1, d: 2 },
  { id: 'UNC-URS-05', es: 'Generador aleatorio reproducible', en: 'Reproducible random generator', s: 1, p: 1, d: 1 },
  { id: 'UNC-URS-06', es: 'Monte Carlo valida las entradas', en: 'Monte Carlo validates its inputs', s: 2, p: 1, d: 2 },
  { id: 'EXP-URS-01', es: 'Exportación CSV sin pérdida de datos', en: 'Lossless CSV export', s: 2, p: 1, d: 2 },
  { id: 'EXP-URS-02', es: 'CSV neutraliza fórmulas (inyección)', en: 'CSV neutralizes formulas (injection)', s: 2, p: 1, d: 2 },
  { id: 'CRY-URS-01', es: 'SHA-256 estándar y JSON canónico', en: 'Standard SHA-256 and canonical JSON', s: 3, p: 1, d: 3 },
  { id: 'ENL-URS-01', es: 'Interpretación de registros ASTM', en: 'ASTM record parsing', s: 3, p: 2, d: 2 },
  { id: 'ENL-URS-02', es: 'Checksum LIS1-A correcto', en: 'Correct LIS1-A checksum', s: 3, p: 1, d: 2 },
  { id: 'ENL-URS-03', es: 'Tramas y detección de corrupción', en: 'Frames and corruption detection', s: 3, p: 2, d: 2 },
  { id: 'ENL-URS-04', es: 'Errores de estructura y valores no numéricos', en: 'Structure errors and non-numeric values', s: 2, p: 2, d: 2 },
  { id: 'ENL-URS-05', es: 'Interpretación HL7 ORU^R01 y LOINC', en: 'HL7 ORU^R01 and LOINC parsing', s: 3, p: 2, d: 2 },
  { id: 'ENL-URS-06', es: 'Validación del tipo de mensaje y detección de formato', en: 'Message type validation and format detection', s: 2, p: 2, d: 1 },
  { id: 'CUS-URS-01', es: 'Audit trail encadenado desde el génesis', en: 'Audit trail chained from genesis', s: 3, p: 1, d: 3 },
  { id: 'CUS-URS-02', es: 'Detección de alteraciones', en: 'Tamper detection', s: 3, p: 2, d: 3 },
  { id: 'CUS-URS-03', es: 'Detección de borrados', en: 'Deletion detection', s: 3, p: 2, d: 3 },
  { id: 'CUS-URS-04', es: 'Importación con registro de muestra y corrida', en: 'Import with sample registration and run linking', s: 3, p: 2, d: 2 },
  { id: 'CUS-URS-05', es: 'Firma con re-autenticación', en: 'Signature with re-authentication', s: 3, p: 2, d: 2 },
  { id: 'CUS-URS-06', es: 'Solo el validador aprueba', en: 'Only the approver approves', s: 3, p: 2, d: 2 },
  { id: 'CUS-URS-07', es: 'Segregación de funciones', en: 'Segregation of duties', s: 3, p: 2, d: 2 },
  { id: 'CUS-URS-08', es: 'Bloqueo de liberación por QC rechazado', en: 'Release blocked by rejected QC', s: 3, p: 2, d: 2 },
  { id: 'CUS-URS-09', es: 'Flujo completo hasta la liberación', en: 'Complete flow to release', s: 3, p: 2, d: 2 },
  { id: 'CUS-URS-10', es: 'Acción correctiva obligatoria tras rechazo', en: 'Mandatory corrective action after rejection', s: 2, p: 2, d: 2 },
  { id: 'CUS-URS-11', es: 'Firma ligada al contenido e IA registrada', en: 'Content-bound signature and recorded AI use', s: 3, p: 1, d: 2 },
  { id: 'INF-URS-01', es: 'Informe solo para muestras liberadas', en: 'Report only for released samples', s: 3, p: 1, d: 2 },
  { id: 'DB-URS-01', es: 'Cadena de hash dentro de Postgres', en: 'Hash chain inside Postgres', s: 3, p: 1, d: 3 },
  { id: 'DB-URS-02', es: 'Audit trail inmodificable en la base', en: 'Immutable audit trail in the database', s: 3, p: 1, d: 2 },
  { id: 'DB-URS-03', es: 'Verificación detecta alteraciones directas', en: 'Verification detects direct tampering', s: 3, p: 1, d: 3 },
  { id: 'AI-URS-01', es: 'Modo sin conexión declarado y sin cambiar la decisión', en: 'Offline mode declared and decision unchanged', s: 2, p: 2, d: 2 },
  { id: 'AI-URS-02', es: 'La IA recibe la decisión como dato', en: 'AI receives the decision as data', s: 2, p: 2, d: 2 },
];
```

- [ ] **Step 2: Script de trazabilidad y JSON inicial**

`src/content/validation/traceability.json`:

```json
{ "generatedAt": "", "commit": "", "tests": [] }
```

`scripts/build-traceability.ts`:

```ts
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

interface VitestJson {
  testResults: { name: string; assertionResults: { title: string; status: string }[] }[];
}

function main() {
  const report = JSON.parse(readFileSync('reports/vitest.json', 'utf8')) as VitestJson;
  const tests = report.testResults.flatMap((file) =>
    file.assertionResults.map((a) => ({
      ids: [...a.title.matchAll(/\[([A-Z]+-URS-\d+)\]/g)].map((m) => m[1]),
      title: a.title.replace(/\[[A-Z]+-URS-\d+\]\s*/g, ''),
      file: file.name.replace(/\\/g, '/').replace(/^.*?\/(src\/)/, '$1'),
      status: a.status,
    })),
  );
  let commit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? '';
  if (!commit) {
    try {
      commit = execSync('git rev-parse --short HEAD').toString().trim();
    } catch {
      commit = 'local';
    }
  }
  writeFileSync(
    'src/content/validation/traceability.json',
    JSON.stringify({ generatedAt: new Date().toISOString(), commit, tests }, null, 2) + '\n',
  );
  console.log(`traceability: ${tests.length} tests → src/content/validation/traceability.json`);
}

main();
```

Run: `npm run traceability`
Esperado: `traceability: 5x tests → …` y el JSON lleno. **Todos los `status` deben ser `passed`.**

- [ ] **Step 3: Diccionarios**

`src/lib/i18n/dictionaries/es/validation.ts`:

```ts
export const validation = {
  title: 'Dossier de validación',
  intro:
    'Evidencia de verificación del software, organizada al estilo GAMP 5: requisitos, riesgos, trazabilidad y ejecución de pruebas. Es un ejercicio de demostración, no una validación formal para uso GxP.',
  scopeTitle: 'Alcance y clasificación',
  scope: [
    'Sistema: Veritas Lab Suite (demo educativa), software a medida → GAMP 5 categoría 5.',
    'Uso previsto: demostrar control de calidad, trazabilidad de muestras, integración de equipos y cálculos metrológicos.',
    'Fuera de alcance: uso con pacientes o productos reales, infraestructura, cualificación de proveedores.',
  ],
  ursTitle: 'Requisitos de usuario y evaluación de riesgo',
  riskLegend: 'S = severidad, P = probabilidad, D = detectabilidad (1 a 3). RPN = S × P × D. Alto ≥ 12, medio 6–11, bajo ≤ 5.',
  cols: {
    id: 'ID',
    requirement: 'Requisito',
    s: 'S',
    p: 'P',
    d: 'D',
    rpn: 'RPN',
    risk: 'Riesgo',
    tests: 'Evidencia (tests)',
    status: 'Resultado',
  },
  risk: { high: 'alto', medium: 'medio', low: 'bajo' },
  matrixTitle: 'Matriz de trazabilidad requisito → prueba',
  noEvidence: 'sin evidencia',
  oqTitle: 'Resumen de ejecución (OQ)',
  oq: 'Pruebas automatizadas ejecutadas el {date} sobre el commit {commit}: {passed} aprobadas, {failed} fallidas, {total} en total.',
  notRun: 'Todavía no se generó el reporte de pruebas (ejecutar npm run traceability).',
  changeTitle: 'Control de cambios',
  change: 'Cada cambio queda en el historial de Git con su commit, y la integración continua ejecuta toda la suite antes de publicar.',
  changeLink: 'Ver historial de cambios',
  print: 'Imprimir o guardar como PDF',
  passed: 'aprobado',
  failed: 'fallido',
};
```

`src/lib/i18n/dictionaries/en/validation.ts`:

```ts
import type { validation as esValidation } from '../es/validation';

export const validation: typeof esValidation = {
  title: 'Validation dossier',
  intro:
    'Software verification evidence organized in GAMP 5 style: requirements, risks, traceability and test execution. It is a demonstration exercise, not a formal validation for GxP use.',
  scopeTitle: 'Scope and classification',
  scope: [
    'System: Veritas Lab Suite (educational demo), custom software → GAMP 5 category 5.',
    'Intended use: demonstrate quality control, sample traceability, instrument integration and metrology calculations.',
    'Out of scope: use with real patients or products, infrastructure, supplier qualification.',
  ],
  ursTitle: 'User requirements and risk assessment',
  riskLegend: 'S = severity, P = probability, D = detectability (1 to 3). RPN = S × P × D. High ≥ 12, medium 6–11, low ≤ 5.',
  cols: {
    id: 'ID',
    requirement: 'Requirement',
    s: 'S',
    p: 'P',
    d: 'D',
    rpn: 'RPN',
    risk: 'Risk',
    tests: 'Evidence (tests)',
    status: 'Result',
  },
  risk: { high: 'high', medium: 'medium', low: 'low' },
  matrixTitle: 'Requirement → test traceability matrix',
  noEvidence: 'no evidence',
  oqTitle: 'Execution summary (OQ)',
  oq: 'Automated tests run on {date} against commit {commit}: {passed} passed, {failed} failed, {total} total.',
  notRun: 'The test report has not been generated yet (run npm run traceability).',
  changeTitle: 'Change control',
  change: 'Every change is recorded in Git history with its commit, and continuous integration runs the full suite before publishing.',
  changeLink: 'View change history',
  print: 'Print or save as PDF',
  passed: 'passed',
  failed: 'failed',
};
```

Registrar `validation` a nivel superior en ambos índices.

- [ ] **Step 4: Botón de impresión**

`src/components/ui/PrintButton.tsx`:

```tsx
'use client';

import { btnSecondary } from './styles';

export function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" className={`${btnSecondary} print:hidden`} onClick={() => window.print()}>
      {label}
    </button>
  );
}
```

- [ ] **Step 5: Página del dossier**

`src/app/[lang]/validacion/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StatusChip } from '@/components/lab/StatusChip';
import { PrintButton } from '@/components/ui/PrintButton';
import { card, h2, table, tableWrap } from '@/components/ui/styles';
import { profile } from '@/content/profile';
import traceability from '@/content/validation/traceability.json';
import { URS } from '@/content/validation/urs';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

type Params = Promise<{ lang: string }>;
type TraceTest = { ids: string[]; title: string; file: string; status: string };

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getDictionary(lang).validation.title };
}

export default async function ValidationPage({ params }: { params: Params }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang).validation;
  const tests = traceability.tests as TraceTest[];
  const passed = tests.filter((x) => x.status === 'passed').length;
  const failed = tests.length - passed;
  const riskOf = (rpn: number) => (rpn >= 12 ? 'high' : rpn >= 6 ? 'medium' : 'low') as 'high' | 'medium' | 'low';

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-semibold">{t.title}</h1>
          <p className="mt-2 text-muted">{t.intro}</p>
        </div>
        <PrintButton label={t.print} />
      </header>

      <section className={card}>
        <h2 className={h2}>{t.oqTitle}</h2>
        <p className="mt-2 text-sm" data-testid="oq-summary">
          {traceability.generatedAt
            ? t.oq
                .replace('{date}', traceability.generatedAt.slice(0, 10))
                .replace('{commit}', traceability.commit)
                .replace('{passed}', String(passed))
                .replace('{failed}', String(failed))
                .replace('{total}', String(tests.length))
            : t.notRun}
        </p>
      </section>

      <section className={card}>
        <h2 className={h2}>{t.scopeTitle}</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {t.scope.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>

      <section className={card}>
        <h2 className={h2}>{t.ursTitle}</h2>
        <p className="mt-1 text-xs text-muted">{t.riskLegend}</p>
        <div className={`${tableWrap} mt-3`}>
          <table className={`${table} text-xs`}>
            <thead>
              <tr>
                <th>{t.cols.id}</th>
                <th>{t.cols.requirement}</th>
                <th>{t.cols.s}</th>
                <th>{t.cols.p}</th>
                <th>{t.cols.d}</th>
                <th>{t.cols.rpn}</th>
                <th>{t.cols.risk}</th>
                <th>{t.cols.tests}</th>
                <th>{t.cols.status}</th>
              </tr>
            </thead>
            <tbody>
              {URS.map((u) => {
                const rpn = u.s * u.p * u.d;
                const risk = riskOf(rpn);
                const evidence = tests.filter((x) => x.ids.includes(u.id));
                const ok = evidence.length > 0 && evidence.every((x) => x.status === 'passed');
                return (
                  <tr key={u.id}>
                    <td className="font-mono">{u.id}</td>
                    <td>{u[lang]}</td>
                    <td>{u.s}</td>
                    <td>{u.p}</td>
                    <td>{u.d}</td>
                    <td className="font-mono">{rpn}</td>
                    <td>
                      <StatusChip tone={risk === 'high' ? 'danger' : risk === 'medium' ? 'warn' : 'neutral'}>{t.risk[risk]}</StatusChip>
                    </td>
                    <td>
                      {evidence.length === 0
                        ? t.noEvidence
                        : evidence.map((x) => (
                            <a key={x.title} className="block text-accent hover:underline" href={`${profile.repo}/blob/main/${x.file}`}>
                              {x.title}
                            </a>
                          ))}
                    </td>
                    <td>
                      <StatusChip tone={ok ? 'ok' : 'danger'}>{ok ? t.passed : evidence.length === 0 ? t.noEvidence : t.failed}</StatusChip>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className={card}>
        <h2 className={h2}>{t.changeTitle}</h2>
        <p className="mt-2 text-sm">{t.change}</p>
        <a className="mt-2 inline-block text-sm text-accent hover:underline" href={`${profile.repo}/commits/main`}>
          {t.changeLink} →
        </a>
      </section>
    </div>
  );
}
```

La tabla une URS, riesgo y matriz de trazabilidad (requisito → test → resultado). Un requisito sin test aparece en rojo como «sin evidencia».

- [ ] **Step 6: Activar el build con trazabilidad**

Run: `npm run build`
Esperado: corre toda la suite, escribe el JSON y compila. En `/es/validacion`, todas las filas deben figurar como **aprobado**. Si alguna dice «sin evidencia», falta el ID en el título del test correspondiente: corregir el test, no la URS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: dossier de validación con URS, riesgo y trazabilidad generada desde los tests

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 30: Páginas «Uso de IA» y «Acerca»

**Files:**
- Create: `src/lib/i18n/dictionaries/es/aiPolicy.ts`, `en/aiPolicy.ts`, `es/about.ts`, `en/about.ts`, `src/app/[lang]/ia/page.tsx`, `src/app/[lang]/acerca/page.tsx`
- Modify: ambos `index.ts`

- [ ] **Step 1: Diccionario de la política de IA**

`src/lib/i18n/dictionaries/es/aiPolicy.ts`:

```ts
export const aiPolicy = {
  title: 'Política de uso de IA',
  intro:
    'En este portfolio la IA asiste y nunca decide. Aplica a una demo los principios del borrador del Anexo 22 de las GMP europeas (IA en aplicaciones críticas) y de la guía GAMP de ISPE sobre IA.',
  sections: [
    {
      title: 'Dónde NO hay IA',
      items: [
        'Evaluación de reglas de Westgard, calibración, límites de detección, incertidumbre, reglas de firma y liberación.',
        'Todo eso es código determinista, con tests contra referencias publicadas (NIST, EURACHEM, Westgard) y una matriz de trazabilidad pública.',
      ],
    },
    {
      title: 'Dónde SÍ hay IA',
      items: [
        'Explicar por qué una corrida violó una regla y redactar un borrador de CAPA.',
        'La salida siempre se etiqueta como borrador y requiere aprobación humana.',
        'Al aprobar se registran en el audit trail el modelo, el hash del prompt, el hash del texto, quién aprobó y cuándo.',
      ],
    },
    {
      title: 'Modo sin conexión',
      items: [
        'Si el servidor no tiene credenciales de IA configuradas, o la IA falla, se usa un texto automático por reglas.',
        'Ese texto se etiqueta «sin IA» y queda registrado como modelo «offline-rules».',
      ],
    },
    {
      title: 'Datos',
      items: [
        'La demo no usa datos de pacientes reales.',
        'Al asistente solo se envían el analito, la corrida, las reglas, los valores y los z, validados y con tamaño limitado.',
        'Hay límite de pedidos por IP.',
      ],
    },
  ],
  refsTitle: 'Referencias',
  refs: [
    'EU GMP Anexo 22 «Artificial Intelligence», borrador para consulta (2025).',
    'ISPE GAMP® Guide: Artificial Intelligence (2025).',
    'FDA y EMA: principios de Good AI Practice para el desarrollo de medicamentos (2026).',
    'FDA: borrador de guía sobre credibilidad de modelos de IA por contexto de uso (2025).',
  ],
};
```

`src/lib/i18n/dictionaries/en/aiPolicy.ts`:

```ts
import type { aiPolicy as esAiPolicy } from '../es/aiPolicy';

export const aiPolicy: typeof esAiPolicy = {
  title: 'AI use policy',
  intro:
    'In this portfolio AI assists and never decides. It applies to a demo the principles of the draft EU GMP Annex 22 (AI in critical applications) and the ISPE GAMP guide on AI.',
  sections: [
    {
      title: 'Where there is NO AI',
      items: [
        'Westgard rule evaluation, calibration, detection limits, uncertainty, signature and release rules.',
        'All of it is deterministic code, tested against published references (NIST, EURACHEM, Westgard) with a public traceability matrix.',
      ],
    },
    {
      title: 'Where there IS AI',
      items: [
        'Explaining why a run violated a rule and drafting a CAPA.',
        'Output is always labeled as a draft and requires human approval.',
        'On approval, the audit trail records the model, prompt hash, text hash, approver and time.',
      ],
    },
    {
      title: 'Offline mode',
      items: [
        'If the server has no AI credentials configured, or the AI fails, a rule-based automatic text is used.',
        'That text is labeled “no AI” and recorded as model “offline-rules”.',
      ],
    },
    {
      title: 'Data',
      items: [
        'The demo uses no real patient data.',
        'Only the analyte, run, rules, values and z-scores are sent to the assistant, validated and size-limited.',
        'Requests are rate-limited per IP.',
      ],
    },
  ],
  refsTitle: 'References',
  refs: [
    'EU GMP Annex 22 “Artificial Intelligence”, draft for consultation (2025).',
    'ISPE GAMP® Guide: Artificial Intelligence (2025).',
    'FDA and EMA: Good AI Practice principles for medicines development (2026).',
    'FDA: draft guidance on AI model credibility by context of use (2025).',
  ],
};
```

- [ ] **Step 2: Diccionario de «Acerca»**

`src/lib/i18n/dictionaries/es/about.ts`:

```ts
export const about = {
  title: 'Acerca de este portfolio',
  paragraphs: [
    'Soy Andrés Nahuel Páez, de La Rioja, Argentina. Trabajé nueve años en gestión documental, expedientes y coordinación en instituciones educativas, y hoy desarrollo software y soluciones de datos.',
    'Me formé como Profesor en Geografía (estadística, cartografía, geología, climatología e hidrología) y como Licenciado en Educación. Esa combinación de método, datos y normativa es la que llevo a los laboratorios.',
    'Veritas Lab Suite muestra cómo trabajo: problemas reales del laboratorio, cálculos verificados contra referencias publicadas, trazabilidad de punta a punta e IA solo donde corresponde.',
  ],
  howTitle: 'Cómo está hecho',
  how: [
    'Next.js, React y TypeScript; lógica científica en módulos puros con tests (Vitest) y pruebas de punta a punta (Playwright).',
    'Integración continua en GitHub Actions y publicación en Vercel.',
    'Datos de la demo en tu navegador; esquema Postgres de referencia con audit trail probado en la CI.',
    'Desarrollo asistido por IA (Claude Code), con revisión y pruebas de cada cambio.',
  ],
  otherTitle: 'Otros trabajos: datos e IA para industrias reguladas',
  other: [
    { label: 'Portfolio de minería, energía y datos', href: 'https://portfolio-andresnahuelpaez.vercel.app' },
    { label: 'Portfolio de banca y fintech', href: 'https://andresnahuelpaez-portfolio-banca.vercel.app' },
  ],
  contactTitle: 'Contacto',
};
```

`src/lib/i18n/dictionaries/en/about.ts`:

```ts
import type { about as esAbout } from '../es/about';

export const about: typeof esAbout = {
  title: 'About this portfolio',
  paragraphs: [
    'I am Andrés Nahuel Páez, from La Rioja, Argentina. I spent nine years in document control, records management and coordination at educational institutions, and today I build software and data solutions.',
    'I trained as a Geography teacher (statistics, cartography, geology, climatology and hydrology) and hold a degree in Education. That mix of method, data and regulation is what I bring to laboratories.',
    'Veritas Lab Suite shows how I work: real laboratory problems, calculations verified against published references, end-to-end traceability, and AI only where it belongs.',
  ],
  howTitle: 'How it is built',
  how: [
    'Next.js, React and TypeScript; scientific logic in pure modules with unit tests (Vitest) and end-to-end tests (Playwright).',
    'Continuous integration on GitHub Actions and deployment on Vercel.',
    'Demo data lives in your browser; a reference Postgres schema with an audit trail tested in CI.',
    'AI-assisted development (Claude Code), with review and tests for every change.',
  ],
  otherTitle: 'Other work: data and AI for regulated industries',
  other: [
    { label: 'Mining, energy and data portfolio', href: 'https://portfolio-andresnahuelpaez.vercel.app' },
    { label: 'Banking and fintech portfolio', href: 'https://andresnahuelpaez-portfolio-banca.vercel.app' },
  ],
  contactTitle: 'Contact',
};
```

Registrar `aiPolicy` y `about` a nivel superior en ambos índices.

- [ ] **Step 3: Páginas**

`src/app/[lang]/ia/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { card, h2 } from '@/components/ui/styles';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getDictionary(lang).aiPolicy.title };
}

export default async function AiPolicyPage({ params }: { params: Params }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang).aiPolicy;
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <h1 className="text-3xl font-semibold">{t.title}</h1>
      <p className="text-muted">{t.intro}</p>
      {t.sections.map((s) => (
        <section key={s.title} className={card}>
          <h2 className={h2}>{s.title}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {s.items.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </section>
      ))}
      <section>
        <h2 className={h2}>{t.refsTitle}</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
          {t.refs.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
```

`src/app/[lang]/acerca/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Signature } from '@/components/layout/Signature';
import { card, h2 } from '@/components/ui/styles';
import { profile } from '@/content/profile';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getDictionary(lang).about.title };
}

export default async function AboutPage({ params }: { params: Params }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.about;
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <h1 className="text-3xl font-semibold">{t.title}</h1>
      {t.paragraphs.map((p) => (
        <p key={p} className="leading-relaxed">
          {p}
        </p>
      ))}
      <section className={card}>
        <h2 className={h2}>{t.howTitle}</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {t.how.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </section>
      <section className={card}>
        <h2 className={h2}>{t.otherTitle}</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {t.other.map((o) => (
            <li key={o.href}>
              <a className="text-accent hover:underline" href={o.href}>
                {o.label} →
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section className={card}>
        <h2 className={h2}>{t.contactTitle}</h2>
        <p className="mt-2 text-sm">
          <a className="text-accent hover:underline" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>{' '}
          · {profile.phone} · {profile.location}
        </p>
        <div className="mt-4">
          <Signature dict={dict} />
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Verificar y commit**

Run: `npx tsc --noEmit && npm run lint && npm run build:next`
Esperado: compila. Revisar `/es/ia`, `/en/ia`, `/es/acerca` y `/en/acerca` en `npm run dev`.

```bash
git add -A
git commit -m "feat: páginas de política de uso de IA y acerca del autor

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 31: Credenciales y página de inicio

**Files:**
- Create: `src/content/credentials.ts`, `src/lib/i18n/dictionaries/es/home.ts`, `en/home.ts`, `src/components/home/HomeSections.tsx`
- Modify: `src/app/[lang]/page.tsx` (reemplazo completo), ambos `index.ts`

- [ ] **Step 1: Verificar el orden de las credenciales de Anthropic**

Cada link de verificación debe coincidir con su curso. Descargar cada página y leer el nombre del curso:

```bash
for c in x6kitfnb74fd x43yh64wf9tw hck97yofrzpd ooauw3vzqwr9; do echo "== $c"; curl -fsSL "https://verify.skilljar.com/c/$c" | grep -o -i -E "Claude Code in Action|Building with the Claude API|Claude with the Anthropic API|Model Context Protocol|AI Fluency[^<]*" | head -1; done
```

Anotar a qué curso corresponde cada código y usar ese orden en el Step 2. Si el curso de API figura como «Claude with the Anthropic API», usar ese nombre exacto. Si la descarga falla, abrir las URLs en el navegador.

- [ ] **Step 2: Credenciales (única fuente para home y CV)**

`src/content/credentials.ts` (ajustar `url` según el Step 1):

```ts
import type { Locale } from '@/lib/i18n/config';

type Localized = Record<Locale, string>;

export const education: { title: Localized; org: string; year: string; detail: Localized }[] = [
  {
    title: { es: 'Profesor en Geografía', en: 'Teaching Degree in Geography' },
    org: 'I.S.F.D. Albino G. Sánchez Barros, La Rioja',
    year: '2014',
    detail: {
      es: 'Estadística e informática aplicada, cartografía y fotogrametría, geología y geomorfología, climatología e hidrología, investigación cuantitativa.',
      en: 'Applied statistics and computing, cartography and photogrammetry, geology and geomorphology, climatology and hydrology, quantitative research.',
    },
  },
  {
    title: { es: 'Licenciado en Educación', en: 'Bachelor’s Degree in Education' },
    org: 'Universidad Siglo 21',
    year: '2017',
    detail: {
      es: 'Gestión de la calidad institucional, metodología de la investigación, planificación de proyectos.',
      en: 'Institutional quality management, research methodology, project planning.',
    },
  },
  {
    title: { es: 'Técnico en Idioma Inglés', en: 'English Language Technician' },
    org: 'Instituto English School, La Rioja',
    year: '2015',
    detail: { es: 'Inglés técnico, nivel intermedio.', en: 'Technical English, intermediate level.' },
  },
];

export const certifications: { issuer: string; year: string; name: Localized; url?: string }[] = [
  { issuer: 'Anthropic', year: '2026', name: { es: 'Claude Code in Action', en: 'Claude Code in Action' }, url: 'https://verify.skilljar.com/c/x6kitfnb74fd' },
  { issuer: 'Anthropic', year: '2026', name: { es: 'Building with the Claude API', en: 'Building with the Claude API' }, url: 'https://verify.skilljar.com/c/x43yh64wf9tw' },
  { issuer: 'Anthropic', year: '2026', name: { es: 'Introduction to Model Context Protocol', en: 'Introduction to Model Context Protocol' }, url: 'https://verify.skilljar.com/c/hck97yofrzpd' },
  { issuer: 'Anthropic', year: '2026', name: { es: 'AI Fluency: Framework & Foundations', en: 'AI Fluency: Framework & Foundations' }, url: 'https://verify.skilljar.com/c/ooauw3vzqwr9' },
  { issuer: 'Fundación YPF', year: '2026', name: { es: 'Instrumentación Industrial (16 h)', en: 'Industrial Instrumentation (16 h)' } },
  { issuer: 'Fundación YPF', year: '2026', name: { es: 'Salud y Seguridad en el Trabajo (16 h)', en: 'Occupational Health and Safety (16 h)' } },
  { issuer: 'Fundación YPF', year: '2026', name: { es: 'Energías Renovables (16 h)', en: 'Renewable Energy (16 h)' } },
  { issuer: 'Fundación YPF', year: '2026', name: { es: 'Introducción a la Inteligencia Artificial (3 h)', en: 'Introduction to Artificial Intelligence (3 h)' } },
];
```

- [ ] **Step 3: Diccionario de la home**

`src/lib/i18n/dictionaries/es/home.ts`:

```ts
export const home = {
  hero: {
    eyebrow: 'Software para laboratorios · Datos · Calidad · Trazabilidad',
    title: 'Construyo software de laboratorio con IA, sabiendo dónde no ponerla.',
    subtitle:
      'Los cálculos que deciden son deterministas y están verificados contra referencias publicadas. La IA solo asiste —explica y redacta— con revisión humana y audit trail.',
    ctaFlow: 'Recorrer el flujo',
    ctaCv: 'Ver CV',
    ctaValidation: 'Ver evidencia de validación',
  },
  availability: {
    title: 'Disponibilidad',
    items: [
      'Nacional: remoto para toda Argentina (UTC−3).',
      'Local: presencial o remoto en La Rioja, NOA y Cuyo.',
      'Mundial: remoto, con horario compatible con Europa y América.',
    ],
  },
  flow: {
    title: 'El flujo completo, conectado',
    subtitle: 'Un resultado viaja del analizador al informe sin transcripción manual y no sale si el control de calidad lo impide.',
    steps: [
      { slug: 'enlace', title: '1 · Enlace', text: 'El analizador envía ASTM o HL7; el mensaje se valida y se ingresa.' },
      { slug: 'qc', title: '2 · Control de calidad', text: 'Westgard evalúa la corrida; si se rechaza, bloquea.' },
      { slug: 'custodia', title: '3 · Custodia', text: 'Revisión y aprobación con firma electrónica y audit trail.' },
      { slug: 'informe', title: '4 · Informe', text: 'PDF con firmas y hashes de integridad.' },
    ],
  },
  modules: {
    title: 'Módulos',
    subtitle: 'Cada módulo funciona en el navegador, explica su ciencia y enlaza al test que lo verifica.',
    open: 'Abrir módulo →',
    comingTitle: 'Próximos módulos (en desarrollo)',
    coming: [
      'Stock y cadena de frío: reactivos FEFO, etiquetas QR, excursiones de temperatura y MKT',
      'Extractor de certificados de análisis con IA y revisión humana',
      'Cuenca: calidad de agua y arsénico en La Rioja (CAA art. 982)',
      'Enología: parámetros INV, límites legales y trazabilidad lote → análisis',
      'Geoquímica: datos SEGEMAR, QA/QC de ensayo y detección de anomalías',
      'Secuencia: FASTA/FASTQ, %GC y diseño de primers',
    ],
  },
  trajectory: {
    title: 'Del territorio y la gestión al laboratorio',
    text: 'Nueve años gestionando expedientes, plazos y normativa me enseñaron lo que exige un laboratorio regulado: que cada registro sea atribuible, trazable y auditable. Hoy lo aplico al software.',
    pillars: [
      { title: 'Gestión documental y normativa', text: 'Control de versiones, trazabilidad y cumplimiento: la base de ALCOA+ y de ISO/IEC 17025 §8.3.' },
      { title: 'Ciencia de datos y territorio', text: 'Profesor en Geografía con estadística, geología, climatología e hidrología; Python científico y GIS.' },
      { title: 'Software con IA responsable', text: 'Next.js, TypeScript, SQL y Claude API, con tests, integración continua y la IA fuera del camino crítico.' },
    ],
  },
  capabilities: {
    title: 'Qué más puedo construir para tu laboratorio',
    items: [
      'Migrar planillas Excel a un sistema con audit trail, roles y firmas.',
      'Informes y certificados de análisis automáticos a partir de datos auditados.',
      'Ingesta de archivos e interfaces de equipos (CSV, ASTM, HL7) a una base de datos.',
      'Asistentes de IA sobre SOP y normativa, con cita de la fuente y revisión humana.',
      'Documentación de validación: URS, análisis de riesgo, matriz de trazabilidad y protocolos.',
    ],
  },
  credentials: { title: 'Formación y credenciales', education: 'Formación', certs: 'Certificaciones', verify: 'Verificar' },
  contact: {
    title: 'Contacto',
    text: '¿Tu laboratorio tiene un proceso manual que duele? Escribime y lo vemos.',
    email: 'Email',
    whatsapp: 'WhatsApp',
    github: 'GitHub',
  },
};
```

`src/lib/i18n/dictionaries/en/home.ts`:

```ts
import type { home as esHome } from '../es/home';

export const home: typeof esHome = {
  hero: {
    eyebrow: 'Laboratory software · Data · Quality · Traceability',
    title: 'I build laboratory software with AI, knowing where not to put it.',
    subtitle:
      'Decision-making calculations are deterministic and verified against published references. AI only assists (it explains and drafts), with human review and an audit trail.',
    ctaFlow: 'Walk through the flow',
    ctaCv: 'View CV',
    ctaValidation: 'See validation evidence',
  },
  availability: {
    title: 'Availability',
    items: [
      'National: remote anywhere in Argentina (UTC−3).',
      'Local: on-site or remote in La Rioja, Northwest Argentina and Cuyo.',
      'Worldwide: remote, with hours compatible with Europe and the Americas.',
    ],
  },
  flow: {
    title: 'The complete flow, connected',
    subtitle: 'A result travels from analyzer to report with no manual transcription, and does not leave if quality control prevents it.',
    steps: [
      { slug: 'enlace', title: '1 · Enlace', text: 'The analyzer sends ASTM or HL7; the message is validated and loaded.' },
      { slug: 'qc', title: '2 · Quality control', text: 'Westgard evaluates the run; if rejected, it blocks.' },
      { slug: 'custodia', title: '3 · Custodia', text: 'Review and approval with electronic signature and audit trail.' },
      { slug: 'informe', title: '4 · Report', text: 'PDF with signatures and integrity hashes.' },
    ],
  },
  modules: {
    title: 'Modules',
    subtitle: 'Each module runs in the browser, explains its science and links to the test that verifies it.',
    open: 'Open module →',
    comingTitle: 'Upcoming modules (in development)',
    coming: [
      'Stock & cold chain: FEFO reagents, QR labels, temperature excursions and MKT',
      'AI certificate-of-analysis extractor with human review',
      'Cuenca: water quality and arsenic in La Rioja (Argentine Food Code art. 982)',
      'Enology: INV parameters, legal limits and lot → analysis traceability',
      'Geochemistry: SEGEMAR data, assay QA/QC and anomaly detection',
      'Sequence: FASTA/FASTQ, %GC and primer design',
    ],
  },
  trajectory: {
    title: 'From territory and administration to the laboratory',
    text: 'Nine years managing records, deadlines and regulations taught me what a regulated laboratory demands: every record must be attributable, traceable and auditable. Today I apply that to software.',
    pillars: [
      { title: 'Document control and regulation', text: 'Version control, traceability and compliance: the basis of ALCOA+ and ISO/IEC 17025 §8.3.' },
      { title: 'Data science and territory', text: 'Geography teacher with statistics, geology, climatology and hydrology; scientific Python and GIS.' },
      { title: 'Software with responsible AI', text: 'Next.js, TypeScript, SQL and Claude API, with tests, continuous integration and AI off the critical path.' },
    ],
  },
  capabilities: {
    title: 'What else I can build for your lab',
    items: [
      'Migrate Excel spreadsheets to a system with audit trail, roles and signatures.',
      'Automatic reports and certificates of analysis from audited data.',
      'Ingest instrument files and interfaces (CSV, ASTM, HL7) into a database.',
      'AI assistants over SOPs and regulations, with source citations and human review.',
      'Validation documentation: URS, risk assessment, traceability matrix and protocols.',
    ],
  },
  credentials: { title: 'Education and credentials', education: 'Education', certs: 'Certifications', verify: 'Verify' },
  contact: {
    title: 'Contact',
    text: 'Does your lab have a painful manual process? Write to me and let’s look at it.',
    email: 'Email',
    whatsapp: 'WhatsApp',
    github: 'GitHub',
  },
};
```

Registrar `home` a nivel superior en ambos índices.

- [ ] **Step 4: Secciones de la home**

`src/components/home/HomeSections.tsx`:

```tsx
import Link from 'next/link';
import { btnPrimary, btnSecondary, card, h2 } from '@/components/ui/styles';
import { moduleOrder, modules } from '@/content/modules';
import { certifications, education } from '@/content/credentials';
import { profile } from '@/content/profile';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

type P = { lang: Locale; dict: Dictionary };

export function Hero({ lang, dict }: P) {
  const t = dict.home.hero;
  return (
    <section className="py-12 md:py-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-accent">{t.eyebrow}</p>
      <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight md:text-5xl">{t.title}</h1>
      <p className="mt-4 max-w-3xl text-lg text-muted">{t.subtitle}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={`/${lang}/modulos/enlace`} className={btnPrimary}>
          {t.ctaFlow}
        </Link>
        <Link href={`/${lang}/cv/${lang === 'en' ? 'global' : 'nacional'}`} className={btnSecondary}>
          {t.ctaCv}
        </Link>
        <Link href={`/${lang}/validacion`} className={btnSecondary}>
          {t.ctaValidation}
        </Link>
      </div>
    </section>
  );
}

export function Availability({ dict }: P) {
  const t = dict.home.availability;
  return (
    <section className={`${card} grid gap-3 md:grid-cols-4`} aria-label={t.title}>
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">{t.title}</h2>
      {t.items.map((item) => (
        <p key={item} className="text-sm">
          {item}
        </p>
      ))}
    </section>
  );
}

export function Flow({ lang, dict }: P) {
  const t = dict.home.flow;
  return (
    <section className="mt-12">
      <h2 className={h2}>{t.title}</h2>
      <p className="mt-1 text-muted">{t.subtitle}</p>
      <ol className="mt-4 grid gap-3 md:grid-cols-4">
        {t.steps.map((step, i) => (
          <li key={step.slug} className="relative">
            <Link href={`/${lang}/modulos/${step.slug}`} className={`${card} block h-full hover:border-accent`}>
              <p className="font-semibold text-accent">{step.title}</p>
              <p className="mt-1 text-sm">{step.text}</p>
            </Link>
            {i < t.steps.length - 1 && (
              <span aria-hidden="true" className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-accent md:block">
                →
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function ModuleGrid({ lang, dict }: P) {
  const t = dict.home.modules;
  return (
    <section id="modulos" className="mt-12 scroll-mt-20">
      <h2 className={h2}>{t.title}</h2>
      <p className="mt-1 text-muted">{t.subtitle}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {moduleOrder.map((slug) => {
          const m = modules[slug][lang];
          return (
            <Link key={slug} href={`/${lang}/modulos/${slug}`} className={`${card} flex flex-col hover:border-accent`}>
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">{m.area}</p>
              <h3 className="mt-1 text-lg font-semibold">{m.name}</h3>
              <p className="mt-1 grow text-sm text-muted">{m.tagline}</p>
              <p className="mt-3 text-xs text-ok">✔ {m.verifiedAgainst.label}</p>
              <p className="mt-2 text-sm font-medium text-accent">{t.open}</p>
            </Link>
          );
        })}
      </div>
      <div className="mt-6 rounded-xl border border-dashed border-line p-4">
        <h3 className="text-sm font-semibold">{t.comingTitle}</h3>
        <ul className="mt-2 grid gap-1 text-sm text-muted sm:grid-cols-2">
          {t.coming.map((c) => (
            <li key={c}>◦ {c}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Trajectory({ dict }: P) {
  const t = dict.home.trajectory;
  return (
    <section className="mt-12">
      <h2 className={h2}>{t.title}</h2>
      <p className="mt-2 max-w-3xl">{t.text}</p>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {t.pillars.map((p) => (
          <div key={p.title} className={card}>
            <h3 className="font-semibold">{p.title}</h3>
            <p className="mt-1 text-sm text-muted">{p.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Capabilities({ dict }: P) {
  const t = dict.home.capabilities;
  return (
    <section className="mt-12">
      <h2 className={h2}>{t.title}</h2>
      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {t.items.map((item) => (
          <li key={item} className={`${card} text-sm`}>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Credentials({ lang, dict }: P) {
  const t = dict.home.credentials;
  return (
    <section className="mt-12">
      <h2 className={h2}>{t.title}</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className={card}>
          <h3 className="font-semibold">{t.education}</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {education.map((e) => (
              <li key={e.org}>
                <p className="font-medium">
                  {e.title[lang]} · {e.year}
                </p>
                <p className="text-muted">{e.org}</p>
                <p className="text-xs text-muted">{e.detail[lang]}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className={card}>
          <h3 className="font-semibold">{t.certs}</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {certifications.map((c) => (
              <li key={c.name.es}>
                {c.issuer} · {c.name[lang]} ({c.year})
                {c.url && (
                  <>
                    {' '}
                    <a className="text-accent hover:underline" href={c.url}>
                      {t.verify}
                    </a>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function Contact({ dict }: P) {
  const t = dict.home.contact;
  return (
    <section className={`${card} mt-12`}>
      <h2 className={h2}>{t.title}</h2>
      <p className="mt-1 text-muted">{t.text}</p>
      <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <li>
          {t.email}:{' '}
          <a className="text-accent hover:underline" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
        </li>
        <li>
          {t.whatsapp}:{' '}
          <a className="text-accent hover:underline" href={profile.whatsappUrl}>
            {profile.phone}
          </a>
        </li>
        <li>
          {t.github}:{' '}
          <a className="text-accent hover:underline" href={profile.github}>
            {profile.github.replace('https://', '')}
          </a>
        </li>
      </ul>
    </section>
  );
}
```

- [ ] **Step 5: Reemplazar la home**

`src/app/[lang]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import { Availability, Capabilities, Contact, Credentials, Flow, Hero, ModuleGrid, Trajectory } from '@/components/home/HomeSections';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const p = { lang, dict };
  return (
    <div className="mx-auto max-w-6xl px-4 pb-8">
      <Hero {...p} />
      <Availability {...p} />
      <Flow {...p} />
      <ModuleGrid {...p} />
      <Trajectory {...p} />
      <Capabilities {...p} />
      <Credentials {...p} />
      <Contact {...p} />
    </div>
  );
}
```

- [ ] **Step 6: Verificar y commit**

Run: `npx tsc --noEmit && npm run lint && npm run build:next`

En `npm run dev`, revisar `/es` y `/en` en escritorio y con el navegador a 400 px de ancho. Todo tiene que apilarse sin scroll horizontal.

```bash
git add -A
git commit -m "feat: página de inicio con flujo, módulos, trayectoria, capacidades y credenciales

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 32: CV en 3 audiencias × 2 idiomas

**Files:**
- Create: `src/content/cv.ts`, `src/lib/i18n/dictionaries/es/cv.ts`, `en/cv.ts`, `src/app/[lang]/cv/[audience]/page.tsx`
- Modify: `src/app/globals.css` (regla `@page`), ambos `index.ts`

Contenido **veraz**: nada inventado. Lo que Andrés debe confirmar está listado en T37.

- [ ] **Step 1: Contenido del CV**

`src/content/cv.ts`:

```ts
import type { Locale } from '@/lib/i18n/config';
import { certifications, education } from './credentials';
import { profile } from './profile';

export const audiences = ['nacional', 'local', 'global'] as const;
export type Audience = (typeof audiences)[number];

export function isAudience(value: string): value is Audience {
  return (audiences as readonly string[]).includes(value);
}

export function cvPdfName(audience: Audience, lang: Locale): string {
  return `CV-Andres-Nahuel-Paez-${audience}-${lang}.pdf`;
}

export interface CvEntry {
  title: string;
  meta?: string;
  link?: { label: string; href: string };
  bullets?: string[];
}

export interface CvSection {
  id: string;
  title: string;
  entries: CvEntry[];
}

export interface Cv {
  name: string;
  headline: string;
  contact: { label: string; href?: string }[];
  sections: CvSection[];
}

type L<T> = Record<Locale, T>;

const headline: L<string> = {
  es: 'Desarrollador de Software para Laboratorios | Datos · Calidad · Trazabilidad',
  en: 'Laboratory Software Developer | Data · Quality · Traceability',
};

const summary: L<string> = {
  es: 'Desarrollador de software y datos orientado a laboratorios. Construyo herramientas con cálculos deterministas verificados contra referencias publicadas (NIST StRD, EURACHEM/GUM, reglas de Westgard), audit trail encadenado por hash, firma electrónica con re-autenticación e integración de equipos por ASTM E1394 y HL7 v2. Uso IA (Claude API) solo fuera del camino crítico, con revisión humana y registro. Aporto más de 9 años de gestión documental, expedientes y cumplimiento normativo, y formación en estadística, geología e hidrología.',
  en: 'Software and data developer focused on laboratories. I build tools with deterministic calculations verified against published references (NIST StRD, EURACHEM/GUM, Westgard rules), hash-chained audit trails, electronic signatures with re-authentication, and instrument integration via ASTM E1394 and HL7 v2. I use AI (Claude API) only off the critical path, with human review and logging. I bring 9+ years of document control, records management and regulatory compliance, plus training in statistics, geology and hydrology.',
};

const availability: Record<Audience, L<string>> = {
  nacional: {
    es: 'Disponibilidad: remoto para toda Argentina (UTC−3), con viajes cuando se requiera. Incorporación inmediata.',
    en: 'Availability: remote across Argentina (UTC−3), travel as needed. Immediate start.',
  },
  local: {
    es: 'Disponibilidad: presencial en La Rioja y la región (NOA / Cuyo) o remoto. Incorporación inmediata.',
    en: 'Availability: on-site in La Rioja and the region (Northwest Argentina / Cuyo) or remote. Immediate start.',
  },
  global: {
    es: 'Disponibilidad: remoto internacional (UTC−3; solapamiento con las mañanas de Europa y con toda América). Abierto a reubicación. Incorporación inmediata.',
    en: 'Availability: remote worldwide (UTC−3; overlaps European mornings and all of the Americas). Open to relocation. Immediate start.',
  },
};

const regulatory: Record<Audience, L<string>> = {
  nacional: {
    es: 'ANMAT Disp. 4159/2023 (Anexo 6: sistemas informáticos) · ISO/IEC 17025 · ISO 15189 · ALCOA+ · GAMP 5 · 21 CFR Part 11 — aplicados en proyectos propios.',
    en: 'ANMAT Disp. 4159/2023 (Annex 6: computerized systems) · ISO/IEC 17025 · ISO 15189 · ALCOA+ · GAMP 5 · 21 CFR Part 11 — applied in personal projects.',
  },
  local: {
    es: 'ANMAT Disp. 4159/2023 (Anexo 6) · ISO/IEC 17025 · ISO 15189 · ALCOA+ · GAMP 5 · Código Alimentario Argentino (art. 982, agua de consumo) — aplicados en proyectos propios.',
    en: 'ANMAT Disp. 4159/2023 (Annex 6) · ISO/IEC 17025 · ISO 15189 · ALCOA+ · GAMP 5 · Argentine Food Code (art. 982, drinking water) — applied in personal projects.',
  },
  global: {
    es: 'FDA 21 CFR Part 11 · EU GMP Anexo 11 y borrador del Anexo 22 (IA) · GAMP 5 · ALCOA+ · ISO/IEC 17025 · ISO 15189 — aplicados en proyectos propios.',
    en: 'FDA 21 CFR Part 11 · EU GMP Annex 11 and draft Annex 22 (AI) · GAMP 5 · ALCOA+ · ISO/IEC 17025 · ISO 15189 — applied in personal projects.',
  },
};

const titles: L<Record<'profile' | 'projects' | 'regulatory' | 'skills' | 'experience' | 'education' | 'certifications' | 'capabilities' | 'languages', string>> = {
  es: {
    profile: 'Perfil',
    projects: 'Proyectos',
    regulatory: 'Conocimiento normativo',
    skills: 'Habilidades técnicas',
    experience: 'Experiencia',
    education: 'Formación',
    certifications: 'Certificaciones',
    capabilities: 'Qué puedo aportar',
    languages: 'Idiomas',
  },
  en: {
    profile: 'Profile',
    projects: 'Projects',
    regulatory: 'Regulatory knowledge',
    skills: 'Technical skills',
    experience: 'Experience',
    education: 'Education',
    certifications: 'Certifications',
    capabilities: 'What I can build',
    languages: 'Languages',
  },
};

const suite: L<string[]> = {
  es: [
    'Flujo integrado Enlace → Control de calidad → Custodia → Informe: parser ASTM E1394 / HL7 v2 con mapeo LOINC, multirreglas de Westgard que bloquean la liberación, audit trail SHA-256 y firma electrónica con segregación de funciones.',
    'Calibración (mínimos cuadrados ponderados, LOD/LOQ, predicción inversa con IC 95 %) verificada contra NIST StRD Norris; incertidumbre GUM + Monte Carlo verificada contra EURACHEM A1.',
    'Dossier de validación estilo GAMP 5: URS, análisis de riesgo y matriz de trazabilidad generada automáticamente desde los tests (Vitest + Playwright, CI en GitHub Actions).',
    'Esquema PostgreSQL con audit trail solo-agregado por triggers, probado con PGlite; asistente con Claude API bajo una política de uso de IA (EU GMP Anexo 22, borrador).',
  ],
  en: [
    'Integrated flow Enlace → Quality control → Custodia → Report: ASTM E1394 / HL7 v2 parser with LOINC mapping, Westgard multirules that block release, SHA-256 audit trail and electronic signatures with segregation of duties.',
    'Calibration (weighted least squares, LOD/LOQ, inverse prediction with 95 % CI) verified against NIST StRD Norris; GUM + Monte Carlo uncertainty verified against EURACHEM A1.',
    'GAMP 5-style validation dossier: URS, risk assessment and a traceability matrix generated automatically from the tests (Vitest + Playwright, CI on GitHub Actions).',
    'PostgreSQL schema with a trigger-enforced append-only audit trail, tested with PGlite; Claude API assistant under an AI use policy (draft EU GMP Annex 22).',
  ],
};

const localBullet: L<string> = {
  es: 'Próximos módulos regionales: arsénico en agua de consumo (La Rioja), enología (parámetros INV) y geoquímica (datos SEGEMAR).',
  en: 'Upcoming regional modules: arsenic in drinking water (La Rioja), enology (INV parameters) and geochemistry (SEGEMAR data).',
};

const otherProjects: L<CvEntry[]> = {
  es: [
    {
      title: 'NormaMina: asistente RAG sobre normativa minera',
      meta: 'Next.js · Supabase pgvector · Google Gemini',
      link: { label: 'normamina.vercel.app', href: 'https://normamina.vercel.app' },
      bullets: ['Responde con cita del documento y del artículo; si no hay información, lo dice.'],
    },
    {
      title: 'Pronóstico de generación solar con machine learning',
      meta: 'Python · scikit-learn',
      bullets: ['Random Forest con R² 0,977 y −70 % de error frente al baseline, sobre datos sintéticos con parámetros físicos reales.'],
    },
    {
      title: 'Simulador de salar de litio',
      meta: 'Python',
      bullets: ['Balance de salmuera en cascada de pozas (Mg/Li, sales precipitadas, LCE).'],
    },
  ],
  en: [
    {
      title: 'NormaMina: RAG assistant over mining regulations',
      meta: 'Next.js · Supabase pgvector · Google Gemini',
      link: { label: 'normamina.vercel.app', href: 'https://normamina.vercel.app' },
      bullets: ['Answers cite the document and article; when there is no information, it says so.'],
    },
    {
      title: 'Solar generation forecasting with machine learning',
      meta: 'Python · scikit-learn',
      bullets: ['Random Forest with R² 0.977 and −70 % error vs. baseline, on synthetic data built from real physical parameters.'],
    },
    {
      title: 'Lithium brine evaporation simulator',
      meta: 'Python',
      bullets: ['Brine balance across a cascade of ponds (Mg/Li, precipitated salts, LCE).'],
    },
  ],
};

const skills: L<string[]> = {
  es: [
    'Lenguajes y datos: Python (pandas, NumPy, scikit-learn, matplotlib), SQL (PostgreSQL, SQLite, Supabase), TypeScript.',
    'Web y calidad de software: Next.js, React, Tailwind, Vitest, Playwright, Git, GitHub Actions, Vercel.',
    'Laboratorio e integración: ASTM E1394 / LIS2-A2, HL7 v2 (ORU^R01), LOINC, Westgard, SPC, calibración, incertidumbre GUM.',
    'IA: Claude API, RAG con citas, Model Context Protocol (MCP), text-to-SQL, IA con barandas GxP.',
    'GIS: PostGIS, GeoPandas, MapLibre, Leaflet.',
  ],
  en: [
    'Languages and data: Python (pandas, NumPy, scikit-learn, matplotlib), SQL (PostgreSQL, SQLite, Supabase), TypeScript.',
    'Web and software quality: Next.js, React, Tailwind, Vitest, Playwright, Git, GitHub Actions, Vercel.',
    'Laboratory and integration: ASTM E1394 / LIS2-A2, HL7 v2 (ORU^R01), LOINC, Westgard, SPC, calibration, GUM uncertainty.',
    'AI: Claude API, RAG with citations, Model Context Protocol (MCP), text-to-SQL, AI with GxP guardrails.',
    'GIS: PostGIS, GeoPandas, MapLibre, Leaflet.',
  ],
};

const experience: L<CvEntry[]> = {
  es: [
    {
      title: 'Desarrollador independiente de software y datos',
      meta: 'La Rioja, Argentina (remoto) · 2025 – actualidad',
      bullets: [
        'Desarrollé Veritas Lab Suite, NormaMina (RAG sobre normativa minera) y proyectos de datos y machine learning para minería, energía y finanzas.',
        'Next.js/TypeScript, Python, SQL y Claude API, con tests automatizados, integración continua y despliegue en Vercel.',
      ],
    },
    {
      title: 'Secretario Administrativo',
      meta: 'Colegio Pbro. Virgilio Carlos Ferreyra, Anillaco (La Rioja) · 2017 – 2025',
      bullets: [
        'Gestión documental y de expedientes con información sensible, plazos y normativa.',
        'Coordinación de procesos administrativos y planificación operativa.',
      ],
    },
    {
      title: 'Coordinación Académica y Administrativa',
      meta: 'ISFD Madre Teresa de Calcuta, Anjullón (La Rioja) · 2019 – 2025',
      bullets: ['Seguimiento administrativo, coordinación de equipos y mejora de procesos.'],
    },
    {
      title: 'Docente de nivel secundario',
      meta: 'Instituciones educativas de La Rioja · 2015 – 2019',
      bullets: ['Planificación, dictado y evaluación de clases.'],
    },
  ],
  en: [
    {
      title: 'Independent software and data developer',
      meta: 'La Rioja, Argentina (remote) · 2025 – present',
      bullets: [
        'Built Veritas Lab Suite, NormaMina (RAG over mining regulations) and data/machine-learning projects for mining, energy and finance.',
        'Next.js/TypeScript, Python, SQL and Claude API, with automated tests, continuous integration and deployment on Vercel.',
      ],
    },
    {
      title: 'Administrative Secretary',
      meta: 'Colegio Pbro. Virgilio Carlos Ferreyra, Anillaco (La Rioja) · 2017 – 2025',
      bullets: [
        'Document and records management involving sensitive information, deadlines and regulations.',
        'Coordination of administrative processes and operational planning.',
      ],
    },
    {
      title: 'Academic and Administrative Coordinator',
      meta: 'ISFD Madre Teresa de Calcuta, Anjullón (La Rioja) · 2019 – 2025',
      bullets: ['Administrative follow-up, team coordination and process improvement.'],
    },
    {
      title: 'Secondary School Teacher',
      meta: 'Schools in La Rioja · 2015 – 2019',
      bullets: ['Lesson planning, teaching and assessment.'],
    },
  ],
};

const capabilities: L<string[]> = {
  es: [
    'Migrar planillas Excel a un sistema con audit trail, roles y firmas.',
    'Informes y certificados de análisis automáticos a partir de datos auditados.',
    'Ingesta de archivos e interfaces de equipos (CSV, ASTM, HL7) a una base de datos.',
    'Asistentes de IA sobre SOP y normativa, con cita de la fuente y revisión humana.',
    'Documentación de validación: URS, análisis de riesgo, matriz de trazabilidad y protocolos.',
  ],
  en: [
    'Migrate Excel spreadsheets to a system with audit trail, roles and signatures.',
    'Automatic reports and certificates of analysis from audited data.',
    'Ingest instrument files and interfaces (CSV, ASTM, HL7) into a database.',
    'AI assistants over SOPs and regulations, with source citations and human review.',
    'Validation documentation: URS, risk assessment, traceability matrix and protocols.',
  ],
};

const languages: L<string> = {
  es: 'Español: nativo · Inglés: intermedio (Técnico en Idioma Inglés, 2015).',
  en: 'Spanish: native · English: intermediate (English Language Technician, 2015).',
};

export function getCv(lang: Locale, audience: Audience): Cv {
  const t = titles[lang];
  const contact: Cv['contact'] = [
    { label: profile.email, href: `mailto:${profile.email}` },
    { label: `${profile.phone} (WhatsApp)`, href: profile.whatsappUrl },
    { label: `${profile.location} · ${profile.timezone}` },
    { label: profile.siteUrl.replace('https://', ''), href: profile.siteUrl },
    { label: profile.github.replace('https://', ''), href: profile.github },
  ];
  if (profile.linkedin) contact.push({ label: profile.linkedin.replace('https://', ''), href: profile.linkedin });

  const suiteBullets = audience === 'local' ? [...suite[lang], localBullet[lang]] : suite[lang];

  return {
    name: profile.name,
    headline: headline[lang],
    contact,
    sections: [
      { id: 'profile', title: t.profile, entries: [{ title: summary[lang] }, { title: availability[audience][lang] }] },
      {
        id: 'projects',
        title: t.projects,
        entries: [
          {
            title: 'Veritas Lab Suite',
            meta: 'Next.js · TypeScript · PostgreSQL · Claude API',
            link: { label: profile.siteUrl.replace('https://', ''), href: `${profile.siteUrl}/${lang}` },
            bullets: suiteBullets,
          },
          ...otherProjects[lang],
        ],
      },
      { id: 'regulatory', title: t.regulatory, entries: [{ title: regulatory[audience][lang] }] },
      { id: 'skills', title: t.skills, entries: [{ title: '', bullets: skills[lang] }] },
      { id: 'experience', title: t.experience, entries: experience[lang] },
      {
        id: 'education',
        title: t.education,
        entries: education.map((e) => ({ title: e.title[lang], meta: `${e.org} · ${e.year}`, bullets: [e.detail[lang]] })),
      },
      {
        id: 'certifications',
        title: t.certifications,
        entries: [{ title: '', bullets: certifications.map((c) => `${c.issuer}: ${c.name[lang]} (${c.year})`) }],
      },
      { id: 'capabilities', title: t.capabilities, entries: [{ title: '', bullets: capabilities[lang] }] },
      { id: 'languages', title: t.languages, entries: [{ title: languages[lang] }] },
    ],
  };
}
```

- [ ] **Step 2: Diccionario del CV**

`src/lib/i18n/dictionaries/es/cv.ts`:

```ts
export const cv = {
  variant: 'Versión',
  audiences: { nacional: 'Nacional (remoto)', local: 'Local (La Rioja / NOA)', global: 'Mundial (remoto)' },
  download: 'Descargar PDF',
  print: 'Imprimir',
};
```

`src/lib/i18n/dictionaries/en/cv.ts`:

```ts
import type { cv as esCv } from '../es/cv';

export const cv: typeof esCv = {
  variant: 'Version',
  audiences: { nacional: 'National (remote)', local: 'Local (La Rioja / NW Argentina)', global: 'Worldwide (remote)' },
  download: 'Download PDF',
  print: 'Print',
};
```

Registrar `cv` a nivel superior en ambos índices.

- [ ] **Step 3: Página del CV (HTML imprimible, apto ATS)**

`src/app/[lang]/cv/[audience]/page.tsx`:

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PrintButton } from '@/components/ui/PrintButton';
import { audiences, cvPdfName, getCv, isAudience } from '@/content/cv';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

type Params = Promise<{ lang: string; audience: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return audiences.map((audience) => ({ audience }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, audience } = await params;
  if (!isLocale(lang) || !isAudience(audience)) return {};
  return { title: `CV · ${getDictionary(lang).cv.audiences[audience]}` };
}

export default async function CvPage({ params }: { params: Params }) {
  const { lang, audience } = await params;
  if (!isLocale(lang) || !isAudience(audience)) notFound();
  const t = getDictionary(lang).cv;
  const cv = getCv(lang, audience);

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 text-[15px] leading-snug print:max-w-none print:px-0 print:py-0 print:text-[10pt]">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm print:hidden" aria-label={t.variant}>
        <span className="text-muted">{t.variant}:</span>
        {audiences.map((a) => (
          <Link
            key={a}
            href={`/${lang}/cv/${a}`}
            className={`rounded-full border px-3 py-1 ${a === audience ? 'border-accent bg-accent-soft text-accent' : 'border-line'}`}
          >
            {t.audiences[a]}
          </Link>
        ))}
        <a className="ml-auto text-accent underline" href={`/cv/${cvPdfName(audience, lang)}`} download>
          {t.download}
        </a>
        <PrintButton label={t.print} />
      </nav>

      <header>
        <h1 className="text-3xl font-semibold print:text-[20pt]">{cv.name}</h1>
        <p className="mt-1 text-lg font-medium text-accent print:text-[12pt]">{cv.headline}</p>
        <p className="mt-2 text-sm">
          {cv.contact.map((c, i) => (
            <span key={c.label}>
              {i > 0 && ' · '}
              {c.href ? (
                <a className="hover:underline" href={c.href}>
                  {c.label}
                </a>
              ) : (
                c.label
              )}
            </span>
          ))}
        </p>
      </header>

      {cv.sections.map((section) => (
        <section key={section.id} className="mt-5 break-inside-avoid-page">
          <h2 className="border-b border-line pb-1 text-sm font-semibold uppercase tracking-wider text-accent">{section.title}</h2>
          {section.entries.map((entry, i) => (
            <div key={`${section.id}-${i}`} className="mt-2">
              {(entry.title || entry.meta) && (
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  {entry.title && <h3 className={entry.bullets || entry.meta ? 'font-semibold' : ''}>{entry.title}</h3>}
                  {entry.meta && <span className="text-sm text-muted">{entry.meta}</span>}
                </div>
              )}
              {entry.link && (
                <a className="text-sm text-accent hover:underline" href={entry.link.href}>
                  {entry.link.label}
                </a>
              )}
              {entry.bullets && (
                <ul className="mt-1 list-disc space-y-0.5 pl-5">
                  {entry.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      ))}
    </article>
  );
}
```

- [ ] **Step 4: Márgenes de impresión**

En `src/app/globals.css`, dentro del bloque `@media print { … }` existente y después de la regla `:root`, agregar:

```css
  @page {
    size: A4;
    margin: 14mm;
  }
```

- [ ] **Step 5: Verificar y commit**

1. Run: `npx tsc --noEmit && npm run lint && npm run build:next`. Esperado: compila y genera 6 rutas `/[lang]/cv/[audience]`.
2. Revisar `/es/cv/nacional`, `/es/cv/local` y `/en/cv/global`:
   - La disponibilidad y la línea normativa cambian por audiencia.
   - La versión local agrega el bullet regional.
3. Vista de impresión del navegador: 2 páginas A4 como máximo, sin header ni footer del sitio.

```bash
git add -A
git commit -m "feat: CV veraz en 3 audiencias (nacional, local, mundial) y 2 idiomas

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 33: PDFs del CV listos para adjuntar

**Files:**
- Create: `scripts/export-cv-pdf.ts`, `public/cv/*.pdf` (6 archivos generados)

- [ ] **Step 1: Script**

`scripts/export-cv-pdf.ts`:

```ts
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';
import { audiences, cvPdfName } from '../src/content/cv';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const LANGS = ['es', 'en'] as const;

async function main() {
  mkdirSync('public/cv', { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const lang of LANGS) {
    for (const audience of audiences) {
      await page.goto(`${BASE}/${lang}/cv/${audience}`, { waitUntil: 'networkidle' });
      await page.emulateMedia({ media: 'print' });
      const path = `public/cv/${cvPdfName(audience, lang)}`;
      await page.pdf({ path, format: 'A4', printBackground: false, preferCSSPageSize: true });
      console.log(`✔ ${path}`);
    }
  }
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

`src/content/cv.ts` importa `@/lib/i18n/config` solo como tipo, así que `tsx` lo resuelve sin alias en tiempo de ejecución. Si `tsx` falla al resolver `@/`, cambiar esos imports en `src/content/cv.ts`, `credentials.ts` y `profile.ts` a `import type`, o a rutas relativas.

- [ ] **Step 2: Generar los PDFs**

```bash
npx playwright install chromium
npm run build:next && (npm run start &) && sleep 8 && npm run cv:pdf; kill %1 2>/dev/null || npx kill-port 3000
```

Esperado: 6 líneas `✔ public/cv/CV-Andres-Nahuel-Paez-<audiencia>-<es|en>.pdf`.

Abrir 2 de ellos y verificar:
- Texto seleccionable (apto ATS).
- 1–2 páginas.
- Links activos.
- Sin encabezado ni pie del sitio.

- [ ] **Step 3: Commit**

```bash
git add scripts/export-cv-pdf.ts public/cv
git commit -m "feat: PDFs del CV por audiencia e idioma listos para enviar

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 34: Pruebas de punta a punta (flujo completo y responsive)

**Files:**
- Create: `e2e/flow.spec.ts`, `e2e/responsive.spec.ts`

- [ ] **Step 1: Flujo completo**

`e2e/flow.spec.ts`:

```ts
import { expect, test, type Page } from '@playwright/test';

async function sign(page: Page, button: string, password: string) {
  await page.getByTestId(button).click();
  await page.getByTestId('sign-password').fill(password);
  await page.getByTestId('sign-confirm').click();
  await expect(page.getByRole('dialog')).toBeHidden();
}

test('flujo completo: analizador → control de calidad → firmas → informe PDF', async ({ page }) => {
  await page.goto('/es/modulos/enlace');
  await page.getByTestId('load-astm-example').click();
  await page.getByTestId('parse-message').click();
  await expect(page.getByTestId('parsed-row')).toHaveCount(4);
  await page.getByTestId('import-results').click();
  await expect(page.getByTestId('import-ok')).toBeVisible();

  await page.goto('/es/modulos/custodia');
  await page.getByTestId('sample-M-2026-0101').click();
  await expect(page.getByTestId('sample-status')).toHaveText('En análisis');
  await sign(page, 'sign-reviewed', 'analista123');
  await expect(page.getByTestId('sample-status')).toHaveText('Revisada');

  await page.getByTestId('user-switcher').selectOption('u-validador');
  await page.getByTestId('sign-approved').click();
  await page.getByTestId('sign-password').fill('validador123');
  await page.getByTestId('sign-confirm').click();
  await expect(page.getByTestId('sign-error')).toContainText('GLU-R021');
  await page.getByRole('dialog').getByRole('button', { name: 'Cancelar' }).click();

  await page.goto('/es/modulos/qc');
  await expect(page.getByTestId('run-status-GLU-R021')).toHaveText('Rechazada');
  await page.getByTestId('assist-explain_violation').click();
  await expect(page.getByTestId('assist-draft')).toContainText('sin IA');
  await page.getByTestId('new-run-N1').fill('95.5');
  await page.getByTestId('new-run-N2').fill('251');
  await page.getByTestId('corrective-action').fill('Recalibración y cambio de lote de reactivo');
  await page.getByTestId('add-run').click();
  await expect(page.getByTestId('run-status-GLU-R022')).toHaveText('Aceptada');

  await page.goto('/es/modulos/custodia');
  await page.getByTestId('sample-M-2026-0101').click();
  await page.getByTestId('rerun-sample').click();
  await page.getByTestId('rerun-reason').fill('Repetición tras recalibración');
  await page.getByTestId('rerun-confirm').click();
  await expect(page.getByTestId('sample-status')).toHaveText('En análisis');
  await page.getByTestId('user-switcher').selectOption('u-analista');
  await sign(page, 'sign-reviewed', 'analista123');
  await page.getByTestId('user-switcher').selectOption('u-validador');
  await sign(page, 'sign-approved', 'validador123');
  await expect(page.getByTestId('sample-status')).toHaveText('Liberada');
  await expect(page.getByTestId('audit-chain-status')).toContainText('íntegra');

  await page.goto('/es/modulos/informe');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('download-report-M-2026-0101').click(),
  ]);
  expect(download.suggestedFilename()).toBe('informe-M-2026-0101.pdf');
});

test('las páginas principales cargan en ambos idiomas', async ({ page }) => {
  for (const path of ['/es', '/en', '/es/validacion', '/en/ia', '/es/acerca', '/en/cv/global', '/es/modulos/curva', '/en/modulos/margen']) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(200);
    await expect(page.locator('h1').first()).toBeVisible();
  }
});
```

El test «flujo completo» asume que no hay `ANTHROPIC_API_KEY` en el entorno de CI, así que el asistente responde «sin IA». Es la configuración actual.

- [ ] **Step 2: Responsive (ancho de teléfono)**

`e2e/responsive.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

const PATHS = ['/es', '/es/modulos/qc', '/es/modulos/custodia', '/es/modulos/curva', '/es/modulos/margen', '/es/cv/nacional', '/en/validacion'];

for (const path of PATHS) {
  test(`sin scroll horizontal en ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}
```

- [ ] **Step 3: Ejecutar**

```bash
npx playwright install chromium
npm run test:e2e
```

Esperado: todos los tests en verde (chromium: 2, mobile: 7). Si falla el responsive, envolver la tabla o gráfico culpable en `overflow-x-auto` o hacer que el grid apile en móvil.

- [ ] **Step 4: Commit**

```bash
git add e2e
git commit -m "test: e2e del flujo completo del laboratorio y responsive móvil

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 35: Integración continua y README

**Files:**
- Create: `.github/workflows/ci.yml`
- Modify: `README.md` (reemplazo completo)

- [ ] **Step 1: Workflow**

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report
```

- [ ] **Step 2: README**

`README.md`:

````markdown
# Veritas Lab Suite

[![CI](https://github.com/nahuelpaez91-ux/veritas-lab-suite/actions/workflows/ci.yml/badge.svg)](https://github.com/nahuelpaez91-ux/veritas-lab-suite/actions/workflows/ci.yml)

Portfolio de software para laboratorios de **Andrés Nahuel Páez**: control de calidad, trazabilidad de muestras, integración de equipos y cálculos metrológicos, verificados contra referencias publicadas.

**Demo:** https://veritas-lab-suite.vercel.app · **Validación:** `/es/validacion` · **CV:** `/es/cv/nacional`

> Demo educativa, no validada para uso GxP. Diseñada considerando 21 CFR Part 11, EU GMP Anexo 11 y ANMAT Disp. 4159/2023 (Anexo 6). Datos de ejemplo o sintéticos.

## Flujo

Analizador (ASTM / HL7) → **Enlace** → **Control de calidad** (Westgard, bloquea la liberación) → **Custodia** (firma electrónica, audit trail SHA-256) → **Informe** (PDF con hashes)

## Módulos y verificación

| Módulo | Qué hace | Verificado contra |
|---|---|---|
| Enlace | Parser ASTM E1394 / HL7 v2 ORU^R01, LOINC | Estructura de los estándares y checksum LIS1-A |
| Control de calidad | Levey-Jennings, multirreglas de Westgard, Sigma | Definiciones de Westgard (Clin Chem 1981) |
| Custodia | Estados, firma con re-autenticación, segregación de funciones, audit trail encadenado | Tests de alteración y borrado |
| Informe | PDF solo para muestras liberadas | Tests de la regla de liberación |
| Curva | Mínimos cuadrados (ponderados), LOD/LOQ, predicción inversa | NIST StRD Norris |
| Margen | Incertidumbre GUM y Monte Carlo | EURACHEM/CITAC QUAM A1 |

## Principios

- Los cálculos que deciden son deterministas y tienen tests con datos de referencia.
- La IA solo asiste, con revisión humana y registro. Sin API key funciona en modo sin conexión por reglas (ver `/es/ia`).
- La trazabilidad requisito → test se genera desde los tests (`npm run traceability`).

## Desarrollo

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # Vitest (lógica científica, LIS, LIMS, SQL con PGlite)
npm run test:e2e     # Playwright (flujo completo y responsive)
npm run build        # tests + matriz de trazabilidad + build
npm run cv:pdf       # regenera los PDF del CV (requiere el servidor en marcha)
```

Opcional: copiar `.env.example` a `.env.local` y definir `ANTHROPIC_API_KEY` para activar la IA real.

## Estructura

- `src/lib/science`: estadística, Westgard, calibración, incertidumbre
- `src/lib/lis`: parsers ASTM y HL7
- `src/lib/lims`: audit trail, estados, firmas, liberación, informe
- `supabase/migrations`: esquema Postgres de referencia (audit trail append-only, RLS)
- `src/content`: textos de módulos, CV, credenciales y URS

---

Diseñado y desarrollado por **Andrés Nahuel Páez** · La Rioja, Argentina · nahuelpaez91@gmail.com
````

- [ ] **Step 3: Verificación completa local y commit**

```bash
npm run lint && npm run typecheck && npm run build && npm run test:e2e
```

Esperado: todo en verde.

```bash
git add -A
git commit -m "chore: integración continua y README del proyecto

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 36: Publicación (GitHub + Vercel) y verificación final

Esta tarea publica en servicios externos. **Confirmar con Andrés antes de ejecutar cada paso de publicación.**

- [ ] **Step 1: Repositorio en GitHub**

```bash
gh auth status
```

Si no hay sesión, pedirle a Andrés que ejecute `! gh auth login` en el prompt.

Luego, con su confirmación:

```bash
git branch -M main
gh repo create nahuelpaez91-ux/veritas-lab-suite --public --source . --remote origin --push
```

Esperado: URL del repo. En la pestaña Actions, la CI termina en verde.

- [ ] **Step 2: Proyecto en Vercel**

Opción A (recomendada, deploys automáticos en cada push):
1. Andrés entra a vercel.com → Add New → Project → importa `veritas-lab-suite`.
2. Deja el framework en Next.js y el nombre del proyecto `veritas-lab-suite`.
3. Deploy.

Opción B (CLI): pedir a Andrés `! npx vercel login` y luego:

```bash
npx vercel link --yes --project veritas-lab-suite
npx vercel deploy --prod --yes
```

- [ ] **Step 3: Ajustar la URL si Vercel asignó otra**

Si la URL final no es `https://veritas-lab-suite.vercel.app`:
1. Actualizar `siteUrl` en `src/content/profile.ts` y la URL del README.
2. Regenerar los PDF del CV (T33 Step 2).
3. Commit y push.

- [ ] **Step 4: Verificación en producción**

Con la URL de producción, comprobar:
- `/` → redirige a `/es`.
- Recorrer el flujo completo a mano (T24 Step 4 más la descarga del informe).
- Descargar los 6 PDF del CV desde `/es/cv/*` y `/en/cv/*`.
- `/es/validacion` → todos los requisitos aprobados con fecha y commit.
- `/en` completo en inglés.
- Modo oscuro del sistema: contraste legible.
- Lighthouse, con Performance y Accessibility ≥ 90:

```bash
npx lighthouse https://veritas-lab-suite.vercel.app/es --only-categories=performance,accessibility --chrome-flags="--headless" --output=json --output-path=reports/lighthouse.json && node -e "const r=require('./reports/lighthouse.json');for(const[k,v]of Object.entries(r.categories))console.log(k,Math.round(v.score*100))"
```

Si Lighthouse no encuentra Chrome, usar `CHROME_PATH` apuntando al Chromium de Playwright, o PageSpeed Insights en la web.

---

### Task 37: Checklist para Andrés (fuera del código) y cierre

- [ ] **Step 1: Entregar a Andrés esta lista y marcar lo que confirme**

1. **Confirmar datos del CV:**
   - Que «Desarrollador independiente · 2025 – actualidad» es correcto; si empezó antes, ajustar `src/content/cv.ts`.
   - Revisar las viñetas de experiencia.
2. **Tapar el DNI** en los PDF de títulos publicados en `credenciales-andresnahuelpaez.vercel.app`, antes de enviar postulaciones.
3. **GitHub:**
   - Borrar o completar los 4 repos vacíos.
   - Aclarar en el README de NormaMina que usa Gemini.
4. **LinkedIn (opcional, recomendado):** si lo crea, poner la URL en `profile.linkedin`. Aparece solo en el CV y hay que regenerar los PDF.
5. **API key de Anthropic (opcional):** cargar `ANTHROPIC_API_KEY` en Vercel → Settings → Environment Variables → Redeploy. El asistente pasa de «sin IA» a Claude.
6. **Formación corta sugerida:** ISO/IEC 17025 o incertidumbre (INTI / OAA) e integridad de datos ALCOA+ / GAMP 5. Al terminarlas, sumarlas a `src/content/credentials.ts`.
7. **Usuario piloto:** ofrecer QC o Custodia a un laboratorio de La Rioja (UNLaR, UNdeC, laboratorio de aguas) y pedir un testimonio.
8. **Próximos pasos:**
   - Aprobar el portfolio y los CV publicados.
   - Plan de la Fase 2: módulos regionales y extractor de certificados.
   - Sub-proyecto de envío de mails: personalizado, bajo volumen, con baja y registro.

- [ ] **Step 2: Cierre**

Correr la skill `superpowers:finishing-a-development-branch` para cerrar el trabajo e informar a Andrés:
- URL de producción.
- Links a los 6 PDF.
- Estado de la CI.
- Lista de pendientes de la checklist.
