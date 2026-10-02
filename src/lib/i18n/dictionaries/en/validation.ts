import type { validation as esValidation } from '../es/validation';

export const validation: typeof esValidation = {
  title: 'Validation dossier',
  intro:
    'Software verification evidence organized in GAMP 5 style: requirements, risks, traceability and test execution. It is a demonstration exercise, not a formal validation for GxP use.',
  scopeTitle: 'Scope and classification',
  scope: [
    'System: Veritas Lab Suite (educational demo), custom software → GAMP 5 category 5.',
    'Intended use: demonstrate quality control, sample traceability, instrument integration and metrology calculations.',
    'Out of scope: use with real patients or products, infrastructure, supplier qualification.',
  ],
  ursTitle: 'User requirements and risk assessment',
  riskLegend: 'S = severity, P = probability, D = detectability (1 to 3). RPN = S × P × D. High ≥ 12, medium 6–11, low ≤ 5.',
  cols: {
    id: 'ID',
    requirement: 'Requirement',
    s: 'S',
    p: 'P',
    d: 'D',
    rpn: 'RPN',
    risk: 'Risk',
    tests: 'Evidence (tests)',
    status: 'Result',
  },
  risk: { high: 'high', medium: 'medium', low: 'low' },
  matrixTitle: 'Requirement → test traceability matrix',
  noEvidence: 'no evidence',
  oqTitle: 'Execution summary (OQ)',
  oq: 'Automated tests run on {date} against commit {commit}: {passed} passed, {failed} failed, {total} total.',
  notRun: 'The test report has not been generated yet (run npm run traceability).',
  changeTitle: 'Change control',
  change: 'Every change is recorded in Git history with its commit. Continuous integration (GitHub Actions) runs unit, type and end-to-end tests on every change, and publishing re-runs the unit tests and the traceability matrix before building.',
  changeLink: 'View change history',
  print: 'Print or save as PDF',
  passed: 'passed',
  failed: 'failed',
};
