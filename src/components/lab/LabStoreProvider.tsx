'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import { LabError, type LabState } from '@/lib/lims/model';
import { buildSeedState } from '@/lib/lims/seed';
import { clearState, loadState, loadUserId, saveState, saveUserId } from '@/lib/lims/storage';
import { DEMO_USERS, findUser, type DemoUser } from '@/lib/lims/users';

type Action = (state: LabState, user: DemoUser, at: string) => Promise<LabState>;
export type RunResult = { ok: true } | { ok: false; error: LabError };

interface LabStore {
  state: LabState | null;
  user: DemoUser;
  setUserId: (id: string) => void;
  run: (action: Action) => Promise<RunResult>;
  reset: () => Promise<void>;
}

const LabContext = createContext<LabStore | null>(null);

// Fecha/hora UTC sin milisegundos, p. ej. "2026-09-29T12:34:56"
export function nowIso(): string {
  return new Date().toISOString().slice(0, 19);
}

export function formatLabError(dict: Dictionary, error: LabError): string {
  const base = dict.errors[error.code];
  return error.details.length > 0 ? `${base}: ${error.details.join(', ')}` : base;
}

export function LabStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LabState | null>(null);
  const [userId, setUserIdState] = useState<string>(DEMO_USERS[0].id);
  const stateRef = useRef<LabState | null>(null);
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const loaded = loadState() ?? (await buildSeedState());
      if (cancelled) return;
      stateRef.current = loaded;
      saveState(loaded);
      setState(loaded);
      const storedUser = loadUserId();
      if (storedUser && findUser(storedUser)) setUserIdState(storedUser);
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  const user = findUser(userId) ?? DEMO_USERS[0];

  const setUserId = useCallback((id: string) => {
    if (!findUser(id)) return;
    setUserIdState(id);
    saveUserId(id);
  }, []);

  // Las acciones se encolan para que dos clics rápidos no pisen el estado.
  const run = useCallback(
    (action: Action): Promise<RunResult> => {
      const task = queue.current.then(async (): Promise<RunResult> => {
        const current = stateRef.current;
        if (!current) return { ok: false, error: new LabError('invalid_transition') };
        try {
          const next = await action(current, user, nowIso());
          stateRef.current = next;
          saveState(next);
          setState(next);
          return { ok: true };
        } catch (error) {
          if (error instanceof LabError) return { ok: false, error };
          throw error;
        }
      });
      queue.current = task.catch(() => undefined);
      return task;
    },
    [user],
  );

  const reset = useCallback((): Promise<void> => {
    const task = queue.current.then(async () => {
      clearState();
      const fresh = await buildSeedState();
      stateRef.current = fresh;
      saveState(fresh);
      setState(fresh);
    });
    queue.current = task.catch(() => undefined);
    return task;
  }, []);

  const value = useMemo(() => ({ state, user, setUserId, run, reset }), [state, user, setUserId, run, reset]);
  return <LabContext.Provider value={value}>{children}</LabContext.Provider>;
}

export function useLab(): LabStore {
  const ctx = useContext(LabContext);
  if (!ctx) throw new Error('useLab must be used inside LabStoreProvider');
  return ctx;
}
