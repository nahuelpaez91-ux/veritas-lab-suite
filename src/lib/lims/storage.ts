import type { LabState } from './model';

const STATE_KEY = 'veritas-lab-state-v1';
const USER_KEY = 'veritas-lab-user';

// localStorage puede no existir o fallar (modo privado, previews): la demo sigue en memoria.
export function loadState(): LabState | null {
  try {
    const raw = window.localStorage.getItem(STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LabState;
    return parsed.version === 1 ? parsed : null;
  } catch {
    return null;
  }
}

export function saveState(state: LabState): void {
  try {
    window.localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    // sin almacenamiento disponible
  }
}

export function clearState(): void {
  try {
    window.localStorage.removeItem(STATE_KEY);
  } catch {
    // sin almacenamiento disponible
  }
}

export function loadUserId(): string | null {
  try {
    return window.localStorage.getItem(USER_KEY);
  } catch {
    return null;
  }
}

export function saveUserId(id: string): void {
  try {
    window.localStorage.setItem(USER_KEY, id);
  } catch {
    // sin almacenamiento disponible
  }
}
