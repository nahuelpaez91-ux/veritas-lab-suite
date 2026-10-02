import type { credentials as esCredentials } from '../es/credentials';

export const credentials: typeof esCredentials = {
  title: 'Degrees and certificates',
  metaDescription: 'Degrees, transcripts and certificates of Andrés Nahuel Páez, published as images and PDFs so they can be checked.',
  eyebrow: 'Credentials · Andrés Nahuel Páez',
  intro:
    'Every degree and certificate I list on my CV, in plain view: an image of each page and the PDF. The Anthropic courses can be verified on the issuer’s page. The documents are in Spanish, as issued in Argentina.',
  doc: {
    label: 'Document header',
    document: 'Document',
    code: 'Code',
    revision: 'Revision',
    effective: 'Effective',
    contents: 'Contents',
  },
  contentsValue: '{t} degrees · {a} transcripts · {c} certificates',
  privacy:
    'Third-party data: I covered the principal’s ID number on the Instituto English School statement and the cashier’s name on the fee payment stamps, and removed the payment receipt page from the Bachelor’s PDF. My own details stay visible on purpose.',
  filterLabel: 'Filter documents by type',
  filters: { all: 'All', titulo: 'Degrees', analitico: 'Transcripts', certificado: 'Certificates' },
  kind: { titulo: 'Degree', analitico: 'Transcript', certificado: 'Certificate' },
  hours: 'h',
  pageOne: '1 page',
  pageMany: '{n} pages',
  actions: {
    view: 'View document',
    pdf: 'PDF',
    pdfLabel: 'Open the PDF of “{title}”',
    verify: 'Verify',
    verifyLabel: 'Verify “{title}” on the issuer’s page',
  },
  viewer: {
    close: 'Close',
    page: 'Page {n} of {total}',
    openPdf: 'Open PDF',
  },
};
