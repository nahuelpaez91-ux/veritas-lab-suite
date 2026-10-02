'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import { recordAuthFailure, signSample } from '@/lib/lims/actions';
import type { SignatureMeaning } from '@/lib/lims/model';
import { btnPrimary, btnSecondary, input, label } from '@/components/ui/styles';
import { formatLabError, useLab } from './LabStoreProvider';

// Se monta con key={meaning}: cada apertura empieza con estado limpio.
export function SignDialog({
  dict,
  sampleId,
  meaning,
  onClose,
}: {
  dict: Dictionary;
  sampleId: string;
  meaning: SignatureMeaning | null;
  onClose: (signed: boolean) => void;
}) {
  const t = dict.tools.custodia;
  const { run, user } = useLab();
  const ref = useRef<HTMLDialogElement>(null);
  const signedRef = useRef(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && meaning && !dialog.open) {
      signedRef.current = false;
      dialog.showModal();
    }
  }, [meaning]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!meaning) return;
    const res = await run((s, _u, at) => signSample(s, sampleId, meaning, user.id, password, at));
    if (res.ok) {
      signedRef.current = true;
      ref.current?.close();
      return;
    }
    setError(formatLabError(dict, res.error));
    // 21 CFR Part 11 §11.300(d): los intentos fallidos de re-autenticación quedan auditados
    if (res.error.code === 'bad_password') await run((s, _u, at) => recordAuthFailure(s, sampleId, user.id, at));
  }

  return (
    <dialog
      ref={ref}
      onClose={() => onClose(signedRef.current)}
      aria-label={t.signTitle}
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-xl border border-line bg-surface p-0 text-ink"
    >
      <form onSubmit={submit} className="space-y-3 p-6">
        <h2 className="text-lg font-semibold">{t.signTitle}</h2>
        <p className="text-sm">{meaning === 'approved' ? t.signMeaningApproved : t.signMeaningReviewed}</p>
        <p className="text-xs text-muted">
          {user.name} · {dict.roles[user.role]} · <span className="font-mono">{sampleId}</span>
        </p>
        <label className={label}>
          {t.password}
          <input
            type="password"
            data-testid="sign-password"
            autoComplete="off"
            className={`${input} mt-1`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && (
          <p role="alert" data-testid="sign-error" className="text-sm text-danger">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button type="button" className={btnSecondary} onClick={() => ref.current?.close()}>
            {t.cancel}
          </button>
          <button type="submit" data-testid="sign-confirm" className={btnPrimary}>
            {t.signConfirm}
          </button>
        </div>
      </form>
    </dialog>
  );
}
