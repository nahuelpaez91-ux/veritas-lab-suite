import type { RunStatus } from '@/lib/science/westgard';
import { LabError, type LabState, type Signature } from './model';
import { statusOfRun } from './qc';

export interface ReportData {
  sampleId: string;
  patientId: string;
  patientName: string;
  matrix: string;
  revision: number;
  receivedAt: string;
  results: {
    testCode: string;
    loinc: string | null;
    rawValue: string;
    units: string;
    referenceRange: string;
    flag: string;
    runId: string;
    runStatus: RunStatus | null;
  }[];
  signatures: Signature[];
  recordHash: string;
  auditHead: string;
  generatedAt: string;
}

export function buildReportData(state: LabState, sampleId: string, generatedAt: string): ReportData {
  const sample = state.samples.find((s) => s.id === sampleId);
  if (!sample || sample.status !== 'released') throw new LabError('invalid_transition', [sampleId]);
  const signatures = state.signatures.filter((g) => g.sampleId === sampleId && g.revision === sample.revision);
  return {
    sampleId,
    patientId: sample.patientId,
    patientName: sample.patientName,
    matrix: sample.matrix,
    revision: sample.revision,
    receivedAt: sample.receivedAt,
    results: state.results
      .filter((r) => r.sampleId === sampleId)
      .map((r) => ({
        testCode: r.testCode,
        loinc: r.loinc,
        rawValue: r.rawValue,
        units: r.units,
        referenceRange: r.referenceRange,
        flag: r.flag,
        runId: r.runId,
        runStatus: r.runId ? statusOfRun(state, r.runId) : null,
      })),
    signatures,
    recordHash: signatures.find((g) => g.meaning === 'approved')?.recordHash ?? '',
    auditHead: state.audit[state.audit.length - 1]?.hash ?? '',
    generatedAt,
  };
}
