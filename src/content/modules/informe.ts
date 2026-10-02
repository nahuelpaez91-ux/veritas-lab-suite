import type { LocalizedModule } from '../types';

export const informe: LocalizedModule = {
  es: {
    name: 'Informe',
    area: 'Trazabilidad e integración',
    tagline: 'Genera el informe de resultados en PDF con estado del control de calidad, firmas y huellas de integridad.',
    whatSolves:
      'El informe es lo que sale del laboratorio. Debe mostrar solo resultados liberados, quién los aprobó y con qué evidencia. Este módulo genera el PDF a partir de los datos auditados, sin copiar y pegar, e incluye los hashes que permiten comprobar que no fue alterado.',
    howItWorks: [
      'Solo habilita el informe de muestras liberadas: firma de aprobación válida para la revisión vigente.',
      'Incluye los resultados con unidades, rango y marca, y el estado de la corrida de control de cada prueba.',
      'Lista las firmas electrónicas con nombre, rol, significado y fecha UTC.',
      'Imprime el hash del registro firmado y el último hash del audit trail como evidencia de integridad.',
    ],
    dataSources: [
      { variable: 'Resultados liberados', source: 'Base de datos del LIMS / LIS' },
      { variable: 'Datos del paciente', source: 'Sistema de gestión hospitalaria o de recepción' },
      { variable: 'Firmas', source: 'Módulo de firma electrónica' },
      { variable: 'Plantilla', source: 'Formato aprobado por el laboratorio (control documental)' },
    ],
    whereElse: [
      'Certificados de análisis (CoA) en control de calidad farmacéutico y de alimentos',
      'Informes de ensayo ISO/IEC 17025',
      'Informes ambientales para autoridades de control',
    ],
    steps: [
      'Completá el flujo hasta liberar una muestra en Custodia.',
      'Volvé acá: la muestra aparece como lista.',
      'Descargá el PDF y revisá firmas y hashes.',
    ],
    science: {
      formula:
        'Informe habilitado ⇔ estado = liberada ∧ ∃ firma «aprobado» de la revisión vigente\nhash del registro = SHA-256( JSON canónico de { muestra, revisión, resultados } )',
      standard:
        'ISO/IEC 17025:2017 §7.8 (informe de resultados); ISO 15189:2022 §7.4; 21 CFR Part 11 §11.50 (manifestación de la firma).',
      workedExample:
        'M-2026-0101 rev. 2 → firmas: revisado (M. Gómez) y aprobado (L. Herrera) → informe habilitado.\nSi la muestra se repitiera (rev. 3), las firmas de la rev. 2 dejarían de valer hasta volver a firmar.',
    },
    glossary: [
      { term: 'CoA', definition: 'Certificado de análisis: resultados y conformidad con la especificación.' },
      { term: 'Revisión', definition: 'Versión de los resultados de una muestra; cambia cuando se repite el análisis.' },
      { term: 'Liberación', definition: 'Autorización formal para que un resultado salga del laboratorio.' },
    ],
    verifiedAgainst: { label: 'regla de liberación y datos del informe', testPath: 'src/lib/lims/report.test.ts' },
  },
  en: {
    name: 'Report',
    area: 'Traceability & integration',
    tagline: 'Generates the PDF results report with quality-control status, signatures and integrity fingerprints.',
    whatSolves:
      'The report is what leaves the laboratory. It must show only released results, who approved them and on what evidence. This module builds the PDF from audited data, with no copy-paste, and includes the hashes that let anyone check it was not altered.',
    howItWorks: [
      'Only released samples get a report: an approval signature valid for the current revision.',
      'Includes results with units, range and flag, plus the control-run status of each test.',
      'Lists electronic signatures with name, role, meaning and UTC date.',
      'Prints the signed-record hash and the latest audit-trail hash as integrity evidence.',
    ],
    dataSources: [
      { variable: 'Released results', source: 'LIMS / LIS database' },
      { variable: 'Patient data', source: 'Hospital or front-desk management system' },
      { variable: 'Signatures', source: 'Electronic signature module' },
      { variable: 'Template', source: 'Format approved by the laboratory (document control)' },
    ],
    whereElse: [
      'Certificates of analysis (CoA) in pharmaceutical and food QC',
      'ISO/IEC 17025 test reports',
      'Environmental reports for regulators',
    ],
    steps: [
      'Complete the flow until a sample is released in Custodia.',
      'Come back here: the sample shows as ready.',
      'Download the PDF and check signatures and hashes.',
    ],
    science: {
      formula:
        'Report enabled ⇔ status = released ∧ ∃ “approved” signature for the current revision\nrecord hash = SHA-256( canonical JSON of { sample, revision, results } )',
      standard:
        'ISO/IEC 17025:2017 §7.8 (reporting results); ISO 15189:2022 §7.4; 21 CFR Part 11 §11.50 (signature manifestation).',
      workedExample:
        'M-2026-0101 rev. 2 → signatures: reviewed (M. Gómez) and approved (L. Herrera) → report enabled.\nIf the sample were repeated (rev. 3), rev. 2 signatures would no longer count until signed again.',
    },
    glossary: [
      { term: 'CoA', definition: 'Certificate of analysis: results and conformity with the specification.' },
      { term: 'Revision', definition: 'Version of a sample’s results; changes when the analysis is repeated.' },
      { term: 'Release', definition: 'Formal authorization for a result to leave the laboratory.' },
    ],
    verifiedAgainst: { label: 'release rule and report data', testPath: 'src/lib/lims/report.test.ts' },
  },
};
