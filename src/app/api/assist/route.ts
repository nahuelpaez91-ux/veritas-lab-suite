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
  if (hits.size > 1000) {
    for (const [key, entry] of hits) {
      if (entry.resetAt < now) hits.delete(key);
    }
  }
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
    if (!text || response.stop_reason === 'max_tokens') return NextResponse.json({ error: 'empty_output' }, { status: 502 });
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
