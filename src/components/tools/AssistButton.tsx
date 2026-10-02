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
