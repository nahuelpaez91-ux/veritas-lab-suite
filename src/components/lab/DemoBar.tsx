'use client';

import { useState } from 'react';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import { DEMO_USERS } from '@/lib/lims/users';
import { btnSecondary } from '@/components/ui/styles';
import { useLab } from './LabStoreProvider';

export function DemoBar({ dict }: { dict: Dictionary }) {
  const { user, setUserId, reset } = useLab();
  const [confirming, setConfirming] = useState(false);
  return (
    <div
      data-testid="demo-bar"
      className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-dashed border-warn bg-surface px-4 py-2 text-xs"
    >
      <span className="font-mono font-semibold tracking-widest text-warn">{dict.demoBar.env} · A. N. Páez</span>
      <label className="flex flex-wrap items-center gap-2">
        <span>{dict.demoBar.user}</span>
        <select
          data-testid="user-switcher"
          value={user.id}
          onChange={(e) => setUserId(e.target.value)}
          className="border border-muted bg-surface px-2 py-1 font-mono"
        >
          {DEMO_USERS.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} — {dict.roles[u.role]}
            </option>
          ))}
        </select>
        <span className="text-muted">
          {dict.demoBar.passwordHint}: <code className="font-mono">{user.password}</code>
        </span>
      </label>
      {confirming ? (
        <span className="flex flex-wrap items-center gap-2">
          <span>{dict.demoBar.resetConfirm}</span>
          <button
            type="button"
            className={btnSecondary}
            onClick={async () => {
              await reset();
              setConfirming(false);
            }}
          >
            {dict.demoBar.yes}
          </button>
          <button type="button" className={btnSecondary} onClick={() => setConfirming(false)}>
            {dict.demoBar.no}
          </button>
        </span>
      ) : (
        <button type="button" data-testid="reset-data" className={btnSecondary} onClick={() => setConfirming(true)}>
          {dict.demoBar.reset}
        </button>
      )}
    </div>
  );
}
