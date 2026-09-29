import type { QcTarget } from '@/lib/science/westgard';
import { appendAudit } from './audit';
import type { LabState, QcRun } from './model';

// Puntajes z diseñados para 20 corridas en control (sin violar ninguna regla de Westgard).
const Z_A = [0.3, -0.8, 1.1, -0.4, 0.6, -1.2, 0.2, 0.9, -0.5, -0.1, 1.4, -0.9, 0.4, -0.3, 0.7, -1.0, 0.1, 0.5, -0.6, 0.8];
const Z_B = [-0.2, 0.7, -1.1, 0.4, -0.6, 0.9, -0.3, 0.2, 1.2, -0.8, 0.5, -0.4, -1.3, 0.6, 0.1, -0.7, 0.9, -0.2, 0.3, -0.5];

export const SEED_TARGETS: QcTarget[] = [
  { analyte: 'GLU', level: 'N1', mean: 95, sd: 2.5 },
  { analyte: 'GLU', level: 'N2', mean: 250, sd: 6 },
  { analyte: 'CHOL', level: 'N1', mean: 150, sd: 4 },
  { analyte: 'CHOL', level: 'N2', mean: 240, sd: 6 },
];

const round2 = (v: number) => Math.round(v * 100) / 100;

function runsOf(analyte: string, zN1: number[], zN2: number[], today: [number, number]): QcRun[] {
  const t1 = SEED_TARGETS.find((t) => t.analyte === analyte && t.level === 'N1');
  const t2 = SEED_TARGETS.find((t) => t.analyte === analyte && t.level === 'N2');
  if (!t1 || !t2) throw new Error(`seed: missing targets for ${analyte}`);
  const rows: [number, number][] = [...zN1.map((z, i): [number, number] => [z, zN2[i]]), today];
  return rows.map(([a, b], i) => {
    const index = i + 1;
    const day = String(index === rows.length ? 29 : index).padStart(2, '0');
    return {
      id: `${analyte}-R${String(index).padStart(3, '0')}`,
      analyte,
      index,
      at: `2026-09-${day}T07:30:00`,
      points: [
        { level: 'N1', value: round2(t1.mean + a * t1.sd) },
        { level: 'N2', value: round2(t2.mean + b * t2.sd) },
      ],
      createdBy: 'u-analista',
    };
  });
}

// La corrida de hoy de glucosa (R021) sale +2,4 DE y +2,33 DE: 2-2s entre niveles → rechazo.
export async function buildSeedState(at = '2026-09-29T07:00:00'): Promise<LabState> {
  const qcRuns = [...runsOf('GLU', Z_A, Z_B, [2.4, 2.3334]), ...runsOf('CHOL', Z_B, Z_A, [0.5, -0.4])];
  const audit = await appendAudit([], {
    at,
    actor: 'system',
    action: 'seed.loaded',
    entity: 'system',
    entityId: 'seed',
    after: { qcRuns: qcRuns.length, qcTargets: SEED_TARGETS.length },
  });
  return { version: 1, samples: [], results: [], qcRuns, qcTargets: SEED_TARGETS, signatures: [], audit };
}
