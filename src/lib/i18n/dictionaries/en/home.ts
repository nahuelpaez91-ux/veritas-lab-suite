import type { home as esHome } from '../es/home';

export const home: typeof esHome = {
  hero: {
    eyebrow: 'Laboratory software · Data · Quality · Traceability',
    title: 'I build laboratory software with AI, knowing where not to put it.',
    subtitle:
      'Decision-making calculations are deterministic and verified against published references. AI only assists (it explains and drafts), with human review and an audit trail.',
    ctaFlow: 'Walk through the flow',
    ctaCv: 'View CV',
    ctaValidation: 'See validation evidence',
  },
  availability: {
    title: 'Availability',
    items: [
      'National: remote anywhere in Argentina (UTC−3).',
      'Local: on-site or remote in La Rioja, Northwest Argentina and Cuyo.',
      'Worldwide: remote, with hours compatible with Europe and the Americas.',
    ],
  },
  flow: {
    title: 'The complete flow, connected',
    subtitle: 'A result travels from analyzer to report with no manual transcription, and does not leave if quality control prevents it.',
    steps: [
      { slug: 'enlace', title: '1 · Enlace', text: 'The analyzer sends ASTM or HL7; the message is validated and loaded.' },
      { slug: 'qc', title: '2 · Quality control', text: 'Westgard evaluates the run; if rejected, it blocks.' },
      { slug: 'custodia', title: '3 · Custodia', text: 'Review and approval with electronic signature and audit trail.' },
      { slug: 'informe', title: '4 · Report', text: 'PDF with signatures and integrity hashes.' },
    ],
  },
  modules: {
    title: 'Modules',
    subtitle: 'Each module runs in the browser, explains its science and links to the test that verifies it.',
    open: 'Open module →',
    comingTitle: 'Upcoming modules (in development)',
    coming: [
      'Stock & cold chain: FEFO reagents, QR labels, temperature excursions and MKT',
      'AI certificate-of-analysis extractor with human review',
      'Cuenca: water quality and arsenic in La Rioja (Argentine Food Code art. 982)',
      'Enology: INV parameters, legal limits and lot → analysis traceability',
      'Geochemistry: SEGEMAR data, assay QA/QC and anomaly detection',
      'Sequence: FASTA/FASTQ, %GC and primer design',
    ],
  },
  trajectory: {
    title: 'From territory and administration to the laboratory',
    text: 'More than eight years managing records, deadlines and regulations at educational institutions taught me what a regulated laboratory demands: every record must be attributable, traceable and auditable. Today I apply that to software.',
    pillars: [
      { title: 'Records and regulatory administration', text: 'Version control, traceability and compliance: the basis of ALCOA+ and ISO/IEC 17025 §8.3.' },
      { title: 'Data science and territory', text: 'Geography teacher with statistics, geology, climatology and hydrology; scientific Python and GIS.' },
      { title: 'Software with responsible AI', text: 'Next.js, TypeScript, SQL and Claude API, with tests, continuous integration and AI off the critical path.' },
    ],
  },
  capabilities: {
    title: 'What else I can build for your lab',
    items: [
      'Migrate Excel spreadsheets to a system with audit trail, roles and signatures.',
      'Automatic reports and certificates of analysis from audited data.',
      'Ingest instrument files and interfaces (CSV, ASTM, HL7) into a database.',
      'AI assistants over SOPs and regulations, with source citations and human review.',
      'Validation documentation: URS, risk assessment, traceability matrix and protocols.',
    ],
  },
  credentials: { title: 'Education and credentials', education: 'Education', certs: 'Certifications', verify: 'Verify' },
  contact: {
    title: 'Contact',
    text: 'Does your lab have a painful manual process? Write to me and let’s look at it.',
    email: 'Email',
    whatsapp: 'WhatsApp',
    github: 'GitHub',
  },
};
