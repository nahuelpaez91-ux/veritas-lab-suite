import { describe, expect, it } from 'vitest';
import { appendAudit, GENESIS_HASH, verifyChain, type AuditEntry } from './audit';

async function threeEntries(): Promise<AuditEntry[]> {
  let log: AuditEntry[] = [];
  log = await appendAudit(log, { at: '2026-09-29T08:00:00', actor: 'u1', action: 'sample.registered', entity: 'sample', entityId: 'M-1', after: { status: 'received' } });
  log = await appendAudit(log, { at: '2026-09-29T08:05:00', actor: 'u1', action: 'result.imported', entity: 'result', entityId: 'M-1:GLU', after: { value: 112 } });
  log = await appendAudit(log, { at: '2026-09-29T08:10:00', actor: 'u2', action: 'signature.reviewed', entity: 'sample', entityId: 'M-1', reason: 'ok' });
  return log;
}

describe('audit trail', () => {
  it('[CUS-URS-01] cada registro guarda el hash del anterior (cadena desde el génesis)', async () => {
    const log = await threeEntries();
    expect(log.map((e) => e.seq)).toEqual([1, 2, 3]);
    expect(log[0].prevHash).toBe(GENESIS_HASH);
    expect(log[1].prevHash).toBe(log[0].hash);
    expect(log[2].prevHash).toBe(log[1].hash);
    expect(await verifyChain(log)).toEqual({ valid: true });
  });

  it('[CUS-URS-02] detecta la alteración de un registro', async () => {
    const log = await threeEntries();
    const tampered = log.map((e) => (e.seq === 2 ? { ...e, after: { value: 99 } } : e));
    expect(await verifyChain(tampered)).toEqual({ valid: false, brokenAt: 2 });
  });

  it('[CUS-URS-03] detecta el borrado de un registro', async () => {
    const log = await threeEntries();
    expect(await verifyChain([log[0], log[2]])).toEqual({ valid: false, brokenAt: 3 });
  });
});
