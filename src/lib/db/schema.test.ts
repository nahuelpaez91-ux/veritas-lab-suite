import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeEach, describe, expect, it } from 'vitest';

const schema = readFileSync('supabase/migrations/0001_schema.sql', 'utf8');
let db: PGlite;

async function log(actor: string, action: string) {
  await db.query(
    `insert into audit_log (actor, action, entity, entity_id, payload) values ($1, $2, 'sample', 'M-1', $3)`,
    [actor, action, JSON.stringify({ action })],
  );
}

beforeEach(async () => {
  db = new PGlite();
  await db.exec(schema);
});

describe('esquema Postgres', () => {
  it('[DB-URS-01] el audit trail se encadena por SHA-256 dentro de la base', async () => {
    await log('u1', 'a');
    await log('u2', 'b');
    await log('u1', 'c');
    const { rows } = await db.query<{ prev_hash: string; hash: string }>('select prev_hash, hash from audit_log order by seq');
    expect(rows).toHaveLength(3);
    expect(rows[0].prev_hash).toBe('0'.repeat(64));
    expect(rows[1].prev_hash).toBe(rows[0].hash);
    expect(rows[2].prev_hash).toBe(rows[1].hash);
    expect(rows[0].hash).toMatch(/^[0-9a-f]{64}$/);
    const check = await db.query<{ broken: unknown }>('select audit_log_verify() as broken');
    expect(check.rows[0].broken).toBeNull();
  });

  it('[DB-URS-02] UPDATE, DELETE y TRUNCATE sobre el audit trail están prohibidos', async () => {
    await log('u1', 'a');
    await expect(db.exec(`update audit_log set actor = 'x'`)).rejects.toThrow(/append-only/);
    await expect(db.exec('delete from audit_log')).rejects.toThrow(/append-only/);
    await expect(db.exec('truncate audit_log')).rejects.toThrow(/append-only/);
  });

  it('[DB-URS-03] la verificación detecta una alteración hecha desactivando los triggers', async () => {
    await log('u1', 'a');
    await log('u2', 'b');
    await log('u1', 'c');
    await db.exec(`
      alter table audit_log disable trigger audit_log_no_update;
      update audit_log set actor = 'intruso' where seq = 2;
      alter table audit_log enable trigger audit_log_no_update;
    `);
    const check = await db.query<{ broken: unknown }>('select audit_log_verify() as broken');
    expect(Number(check.rows[0].broken)).toBe(2);
  });
});
