import type { aiPolicy as esAiPolicy } from '../es/aiPolicy';

export const aiPolicy: typeof esAiPolicy = {
  title: 'AI use policy',
  intro:
    'In this portfolio AI assists and never decides. It applies the principles of the draft EU GMP Annex 22 (AI in critical applications) and the ISPE GAMP guide on AI to a demo.',
  sections: [
    {
      title: 'Where there is NO AI',
      items: [
        'Westgard rule evaluation, calibration, detection limits, uncertainty, signature and release rules.',
        'All of it is deterministic code, tested against published references (NIST, EURACHEM, Westgard) with a public traceability matrix.',
      ],
    },
    {
      title: 'Where there IS AI',
      items: [
        'Explaining why a run violated a rule and drafting a CAPA.',
        'Output is always labeled as a draft and requires human approval.',
        'On approval, the audit trail records the model, prompt hash, text hash, approver and time.',
      ],
    },
    {
      title: 'Offline mode',
      items: [
        'The public demo currently has no API key: every assistant text is rule-based, with no AI.',
        'If the server has no AI credentials configured, or the AI fails, a rule-based automatic text is used.',
        'That text is labeled “no AI” and recorded as model “offline-rules”.',
      ],
    },
    {
      title: 'Data',
      items: [
        'The demo uses no real patient data.',
        'Only the analyte, run, rules, values and z-scores are sent to the assistant, validated and size-limited.',
        'Requests are rate-limited per IP.',
      ],
    },
  ],
  refsTitle: 'References',
  refs: [
    'EU GMP Annex 22 “Artificial Intelligence”, draft for consultation (2025).',
    'ISPE GAMP® Guide: Artificial Intelligence (2025).',
    'FDA and EMA: Good AI Practice principles for medicines development (2026).',
    'FDA: draft guidance on AI model credibility by context of use (2025).',
  ],
};
