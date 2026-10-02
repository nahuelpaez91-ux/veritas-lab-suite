import type { ai as esAi } from '../es/ai';

export const ai: typeof esAi = {
  explain: 'Explain the run',
  draftCapa: 'Draft CAPA',
  loading: 'Generating draft…',
  aiLabel: 'AI-GENERATED DRAFT (Claude) · requires human review',
  offlineLabel: 'RULE-BASED AUTOMATIC TEXT (no AI) · requires human review',
  model: 'Model',
  approve: 'Approve and record in audit trail',
  discard: 'Discard',
  approved: 'Draft approved and recorded (model, prompt hash and text hash).',
  note: 'AI does not decide: it explains and drafts on a result the verified code already computed.',
};
