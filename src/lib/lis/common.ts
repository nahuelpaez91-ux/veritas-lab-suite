// "20260929081500" → "2026-09-29T08:15:00" (hora local del equipo, sin zona)
export function parseTimestamp(raw: string): string | null {
  const m = raw.trim().match(/^(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?/);
  if (!m) return null;
  const [, y, mo, d, h = '00', mi = '00', s = '00'] = m;
  return `${y}-${mo}-${d}T${h}:${mi}:${s}`;
}

// Solo números simples; valores como "<5" o ">500" se conservan como texto (valor crudo).
export function parseNumeric(raw: string): number | null {
  const t = raw.trim();
  if (!/^[-+]?\d+([.,]\d+)?$/.test(t)) return null;
  return Number(t.replace(',', '.'));
}
