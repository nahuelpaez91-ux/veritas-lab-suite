import { canonicalJson, sha256Hex } from '@/lib/crypto';

export interface AuditInput {
  at: string;
  actor: string;
  action: string;
  entity: string;
  entityId: string;
  reason?: string;
  before?: unknown;
  after?: unknown;
}

export interface AuditEntry extends AuditInput {
  seq: number;
  prevHash: string;
  hash: string;
}

export const GENESIS_HASH = '0'.repeat(64);

function hashOf(entry: Omit<AuditEntry, 'hash'>): Promise<string> {
  return sha256Hex(canonicalJson(entry));
}

// Solo-agregado: devuelve un log nuevo con el registro encadenado al final.
export async function appendAudit(log: AuditEntry[], input: AuditInput): Promise<AuditEntry[]> {
  const last = log[log.length - 1];
  const base = { ...input, seq: (last?.seq ?? 0) + 1, prevHash: last?.hash ?? GENESIS_HASH };
  return [...log, { ...base, hash: await hashOf(base) }];
}

export type ChainCheck = { valid: true } | { valid: false; brokenAt: number };

// La cadena es a prueba de alteraciones: detecta la modificación, inserción, reordenamiento y
// borrado de cualquier registro, excepto el truncado de la cola (eliminar los últimos N registros
// deja una cadena interna perfectamente válida). En producción, la cabeza (seq + hash del último
// registro) debe persistirse aparte del log para detectar también ese caso — ver
// supabase/migrations/0002_rls.sql — y pasarse aquí como `expectedHead`.
export async function verifyChain(log: AuditEntry[], expectedHead?: { seq: number; hash: string }): Promise<ChainCheck> {
  let prev = GENESIS_HASH;
  for (const entry of log) {
    const { hash, ...rest } = entry;
    if (entry.prevHash !== prev || (await hashOf(rest)) !== hash) return { valid: false, brokenAt: entry.seq };
    prev = hash;
  }
  if (expectedHead) {
    const tail = log[log.length - 1];
    if (!tail || tail.seq !== expectedHead.seq || tail.hash !== expectedHead.hash) {
      return { valid: false, brokenAt: expectedHead.seq };
    }
  }
  return { valid: true };
}
