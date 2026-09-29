import type { QcTarget } from '@/lib/science/westgard';
import type { AuditEntry } from './audit';

export type Role = 'analyst' | 'validator' | 'admin';
export type SampleStatus = 'received' | 'in_analysis' | 'reviewed' | 'released' | 'rejected';
export type SignatureMeaning = 'reviewed' | 'approved';

export interface Sample {
  id: string;
  patientId: string;
  patientName: string;
  matrix: string;
  status: SampleStatus;
  receivedAt: string;
  revision: number;
}

export interface ResultRow {
  id: string; // `${sampleId}:${testCode}`
  sampleId: string;
  testCode: string;
  loinc: string | null;
  value: number | null;
  rawValue: string;
  units: string;
  referenceRange: string;
  flag: string;
  runId: string; // '' si no hay corrida de control para el analito
  source: 'astm' | 'hl7' | 'manual';
  completedAt: string | null;
}

export interface QcRun {
  id: string;
  analyte: string;
  index: number;
  at: string;
  points: { level: string; value: number }[];
  correctiveAction?: string;
  createdBy: string;
}

export interface Signature {
  sampleId: string;
  revision: number;
  userId: string;
  userName: string;
  role: Role;
  meaning: SignatureMeaning;
  at: string;
  recordHash: string;
}

export interface LabState {
  version: 1;
  samples: Sample[];
  results: ResultRow[];
  qcRuns: QcRun[];
  qcTargets: QcTarget[];
  signatures: Signature[];
  audit: AuditEntry[];
}

export type LabErrorCode =
  | 'bad_password'
  | 'forbidden_role'
  | 'invalid_transition'
  | 'same_person'
  | 'release_blocked'
  | 'sample_not_found'
  | 'no_accepted_run'
  | 'no_results'
  | 'duplicate_sample'
  | 'invalid_run'
  | 'reason_required'
  | 'invalid_sample';

export class LabError extends Error {
  readonly code: LabErrorCode;
  readonly details: string[];

  constructor(code: LabErrorCode, details: string[] = []) {
    super(code);
    this.name = 'LabError';
    this.code = code;
    this.details = details;
  }
}
