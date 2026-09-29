export interface ParsedResult {
  specimenId: string;
  patientId: string;
  patientName: string;
  testCode: string;
  loinc: string | null;
  rawValue: string;
  value: number | null;
  units: string;
  referenceRange: string;
  flag: string;
  status: string;
  completedAt: string | null;
}

export type ParseIssueCode =
  | 'missing_header'
  | 'no_specimen'
  | 'result_before_order'
  | 'no_test_code'
  | 'non_numeric'
  | 'unknown_record'
  | 'bad_checksum'
  | 'not_oru'
  | 'missing_msh';

export interface ParseIssue {
  line: number;
  severity: 'error' | 'warning';
  code: ParseIssueCode;
  detail?: string;
}

export interface ParseOutcome {
  format: 'astm' | 'hl7';
  sender: string;
  results: ParsedResult[];
  issues: ParseIssue[];
}
