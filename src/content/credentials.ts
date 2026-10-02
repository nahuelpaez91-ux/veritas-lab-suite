import type { Locale } from '@/lib/i18n/config';

type Localized = Record<Locale, string>;

/** `yearLabel`: texto de fecha localizado cuando el año solo no alcanza (p. ej. egreso y expedición). */
export const education: { title: Localized; org: string; year: string; yearLabel?: Localized; detail: Localized }[] = [
  {
    title: { es: 'Profesor en Geografía', en: 'Teaching Degree in Geography' },
    org: 'I.S.F.D. Albino G. Sánchez Barros, La Rioja',
    year: '2014',
    yearLabel: { es: 'Egreso 2014 · expedido 2016', en: 'Completed 2014 · issued 2016' },
    detail: {
      es: 'Estadística e informática aplicada, cartografía y fotogrametría, geología y geomorfología, climatología e hidrología, investigación cuantitativa.',
      en: 'Applied statistics and computing, cartography and photogrammetry, geology and geomorphology, climatology and hydrology, quantitative research.',
    },
  },
  {
    title: { es: 'Licenciado en Educación', en: 'Bachelor’s Degree in Education' },
    org: 'Universidad Siglo 21',
    year: '2017',
    detail: {
      es: 'Gestión de la calidad institucional, metodología de la investigación, planificación de proyectos.',
      en: 'Institutional quality management, research methodology, project planning.',
    },
  },
  {
    title: { es: 'Técnico en Idioma Inglés', en: 'English Language Technician' },
    org: 'Instituto English School, La Rioja',
    year: '2015',
    detail: {
      es: 'Tecnicatura en Idioma Inglés (2012–2014); nivel intermedio.',
      en: 'English Language Technician program (2012–2014); intermediate level.',
    },
  },
];

export const certifications: { issuer: string; year: string; name: Localized; url?: string }[] = [
  { issuer: 'Anthropic', year: '2026', name: { es: 'Claude Code in Action', en: 'Claude Code in Action' }, url: 'https://verify.skilljar.com/c/x6kitfnb74fd' },
  { issuer: 'Anthropic', year: '2026', name: { es: 'Claude with the Anthropic API', en: 'Claude with the Anthropic API' }, url: 'https://verify.skilljar.com/c/x43yh64wf9tw' },
  { issuer: 'Anthropic', year: '2026', name: { es: 'Introduction to Model Context Protocol', en: 'Introduction to Model Context Protocol' }, url: 'https://verify.skilljar.com/c/hck97yofrzpd' },
  { issuer: 'Anthropic', year: '2026', name: { es: 'AI Fluency: Framework & Foundations', en: 'AI Fluency: Framework & Foundations' }, url: 'https://verify.skilljar.com/c/ooauw3vzqwr9' },
  { issuer: 'Fundación YPF', year: '2026', name: { es: 'Instrumentación Industrial (16 h)', en: 'Industrial Instrumentation (16 h)' } },
  { issuer: 'Fundación YPF', year: '2026', name: { es: 'Salud y Seguridad en el Trabajo (16 h)', en: 'Occupational Health and Safety (16 h)' } },
  { issuer: 'Fundación YPF', year: '2026', name: { es: 'Energías Renovables (16 h)', en: 'Renewable Energy (16 h)' } },
  { issuer: 'Fundación YPF', year: '2026', name: { es: 'Introducción a la Inteligencia Artificial (3 h)', en: 'Introduction to Artificial Intelligence (3 h)' } },
  { issuer: 'Fundación YPF', year: '2026', name: { es: 'Excel (5 h)', en: 'Excel (5 h)' } },
];

// ---------------------------------------------------------------------------
// Catálogo de documentos (página /credenciales). Imágenes y PDF en public/credenciales/.
// Privacidad de terceros: en la certificación del Instituto English School se tachó el DNI
// de la directora (imagen y PDF reconstruido desde las imágenes), y del PDF de la Licenciatura
// se quitó la última hoja (ticket de pago de la tasa, con el nombre del cajero). El mismo ticket
// impreso sobre las legalizaciones (Licenciatura p. 2, Profesorado p. 2) lleva tapado el nombre del
// cajero; esos PDF también se reconstruyeron desde las imágenes.
// ---------------------------------------------------------------------------

export type CredentialKind = 'titulo' | 'analitico' | 'certificado';

export interface CredentialDoc {
  slug: string;
  kind: CredentialKind;
  title: Localized;
  issuer: Localized;
  year: number;
  /** Fecha localizada para mostrar en lugar de `year` cuando hace falta (p. ej. egreso y expedición). */
  yearLabel?: Localized;
  hours?: number;
  /** Rutas públicas de las páginas (WebP), en orden. */
  pages: string[];
  thumb: string;
  pdf: string;
  verifyUrl?: string;
  alt: Localized;
}

const DIR = '/credenciales';
const LAND: [number, number] = [1600, 1131];
const PORT: [number, number] = [1241, 1755];

/** Tamaño intrínseco (px) de cada imagen publicada, para reservar su espacio (width/height). */
export const imageSize: Record<string, [number, number]> = {};
function img(file: string, size: [number, number]): string {
  const src = `${DIR}/${file}`;
  imageSize[src] = size;
  return src;
}

const issuers = {
  siglo21: { es: 'Universidad Siglo 21', en: 'Universidad Siglo 21' },
  isfd: {
    es: 'I.S.F.D. «Inspector Profesor Albino G. Sánchez Barros», La Rioja',
    en: 'I.S.F.D. “Inspector Profesor Albino G. Sánchez Barros” (teacher training college), La Rioja',
  },
  english: { es: 'Instituto English School, La Rioja', en: 'Instituto English School, La Rioja' },
  ypf: { es: 'Fundación YPF', en: 'Fundación YPF' },
  anthropic: { es: 'Anthropic (Anthropic Education)', en: 'Anthropic (Anthropic Education)' },
} satisfies Record<string, Localized>;

function ypf(slug: string, title: Localized, hours: number, height: number): CredentialDoc {
  return {
    slug: `ypf-${slug}`,
    kind: 'certificado',
    title,
    issuer: issuers.ypf,
    year: 2026,
    hours,
    pages: [img(`ypf-${slug}-p1.webp`, [1600, height])],
    thumb: img(`ypf-${slug}-thumb.webp`, [480, 339]),
    pdf: `${DIR}/ypf-${slug}.pdf`,
    alt: {
      es: `Certificado de aprobación del curso «${title.es}» (${hours} h), Fundación YPF, 2026`,
      en: `Certificate of completion for the “${title.en}” course (${hours} h), Fundación YPF, 2026`,
    },
  };
}

function anthropic(slug: string, name: string, code: string, note?: Localized): CredentialDoc {
  return {
    slug: `anthropic-${slug}`,
    kind: 'certificado',
    title: note ? { es: `${name} ${note.es}`, en: `${name} ${note.en}` } : { es: name, en: name },
    issuer: issuers.anthropic,
    year: 2026,
    pages: [img(`anthropic-${slug}.webp`, [1600, 1236])],
    thumb: img(`anthropic-${slug}-thumb.webp`, [480, 371]),
    pdf: `${DIR}/anthropic-${slug}.pdf`,
    verifyUrl: `https://verify.skilljar.com/c/${code}`,
    alt: {
      es: `Certificado de finalización del curso «${name}», Anthropic Education, 2026`,
      en: `Certificate of completion for the “${name}” course, Anthropic Education, 2026`,
    },
  };
}

export const credentialDocs: CredentialDoc[] = [
  {
    slug: 'profesorado-geografia',
    kind: 'titulo',
    title: {
      es: 'Profesor de Tercer Ciclo de la EGB y de la Educación Polimodal en Geografía',
      en: 'Teaching Degree in Geography (lower and upper secondary)',
    },
    issuer: issuers.isfd,
    year: 2016,
    yearLabel: { es: 'Egreso 2014 · expedido 2016', en: 'Completed 2014 · issued 2016' },
    pages: [
      img('titulo-profesorado-geografia-p1.webp', LAND),
      img('titulo-profesorado-geografia-p2.webp', LAND),
      img('titulo-profesorado-geografia-p3.webp', LAND),
    ],
    thumb: img('titulo-profesorado-geografia-thumb.webp', [480, 339]),
    pdf: `${DIR}/titulo-profesorado-geografia.pdf`,
    alt: {
      es: 'Título de Profesor en Geografía otorgado en La Rioja en 2016, con firmas, legalización y constancia del Registro Provincial de Títulos',
      en: 'Teaching Degree in Geography issued in La Rioja in 2016, with signatures, legalization and the provincial registry record',
    },
  },
  {
    slug: 'licenciatura-educacion',
    kind: 'titulo',
    title: { es: 'Licenciado en Educación', en: 'Bachelor’s Degree in Education' },
    issuer: issuers.siglo21,
    year: 2017,
    pages: [img('titulo-licenciatura-educacion-p1.webp', LAND), img('titulo-licenciatura-educacion-p2.webp', LAND)],
    thumb: img('titulo-licenciatura-educacion-thumb.webp', [480, 339]),
    pdf: `${DIR}/titulo-licenciatura-educacion.pdf`,
    alt: {
      es: 'Diploma de Licenciado en Educación de la Universidad Siglo 21, dado en Buenos Aires en 2017, con sus legalizaciones al dorso',
      en: 'Bachelor’s diploma in Education from Universidad Siglo 21, issued in Buenos Aires in 2017, with its legalizations on the back',
    },
  },
  {
    slug: 'tecnico-ingles',
    kind: 'titulo',
    title: {
      es: 'Técnico en Idioma Inglés · certificación de estudios completos',
      en: 'English Language Technician · certificate of completed studies',
    },
    issuer: issuers.english,
    year: 2015,
    pages: [img('titulo-tecnico-ingles-p1.webp', PORT)],
    thumb: img('titulo-tecnico-ingles-thumb.webp', [480, 679]),
    pdf: `${DIR}/titulo-tecnico-ingles.pdf`,
    alt: {
      es: 'Certificación firmada por la directora del Instituto English School de que completé los estudios de Técnico en Idioma Inglés (DNI de la directora tachado)',
      en: 'Statement signed by the principal of Instituto English School certifying that I completed the English Language Technician studies (principal’s ID number redacted)',
    },
  },
  {
    slug: 'profesorado-geografia-analitico',
    kind: 'analitico',
    title: { es: 'Analítico · Profesorado en Geografía', en: 'Academic transcript · Teaching Degree in Geography' },
    issuer: issuers.isfd,
    year: 2016,
    yearLabel: { es: 'Egreso 2014 · expedido 2016', en: 'Completed 2014 · issued 2016' },
    pages: [img('titulo-profesorado-geografia-p4.webp', PORT), img('titulo-profesorado-geografia-p5.webp', PORT)],
    thumb: img('titulo-profesorado-geografia-analitico-thumb.webp', [480, 679]),
    pdf: `${DIR}/titulo-profesorado-geografia.pdf`,
    alt: {
      es: 'Analítico del Profesorado en Geografía: espacios curriculares de 1.º a 4.º año (2010-2014) con sus notas; promedio general 7,35',
      en: 'Transcript of the Teaching Degree in Geography: courses from 1st to 4th year (2010-2014) with grades; overall average 7.35',
    },
  },
  {
    slug: 'licenciatura-educacion-analitico',
    kind: 'analitico',
    title: { es: 'Certificado analítico · Licenciatura en Educación', en: 'Academic transcript · Bachelor’s Degree in Education' },
    issuer: issuers.siglo21,
    year: 2017,
    pages: [img('titulo-licenciatura-educacion-p3.webp', PORT), img('titulo-licenciatura-educacion-p4.webp', PORT)],
    thumb: img('titulo-licenciatura-educacion-analitico-thumb.webp', [480, 679]),
    pdf: `${DIR}/titulo-licenciatura-educacion.pdf`,
    alt: {
      es: 'Certificado analítico de la Licenciatura en Educación: 16 asignaturas (2015-2017) con sus notas; promedio general 7,25; con legalizaciones',
      en: 'Transcript of the Bachelor’s Degree in Education: 16 courses (2015-2017) with grades; overall average 7.25; with legalizations',
    },
  },
  {
    slug: 'tecnico-ingles-analitico',
    kind: 'analitico',
    title: { es: 'Certificado analítico completo · Tecnicatura en Idioma Inglés', en: 'Complete academic transcript · English Language Technician' },
    issuer: issuers.english,
    year: 2015,
    pages: [img('titulo-tecnico-ingles-p2.webp', PORT)],
    thumb: img('titulo-tecnico-ingles-analitico-thumb.webp', [480, 679]),
    pdf: `${DIR}/titulo-tecnico-ingles.pdf`,
    alt: {
      es: 'Certificado analítico completo de la Tecnicatura en Idioma Inglés (2012-2014): lengua, gramática, fonética, conversación, escritura y didáctica; promedio general 7,60',
      en: 'Complete transcript of the English Language Technician program (2012-2014): language, grammar, phonetics, conversation, writing and teaching methods; overall average 7.60',
    },
  },
  anthropic('claude-code-in-action', 'Claude Code in Action', 'x6kitfnb74fd'),
  anthropic('building-with-the-claude-api', 'Claude with the Anthropic API', 'x43yh64wf9tw', {
    es: '(hoy se ofrece como «Building with the Claude API»)',
    en: '(now offered as “Building with the Claude API”)',
  }),
  anthropic('introduction-to-mcp', 'Introduction to Model Context Protocol', 'hck97yofrzpd'),
  anthropic('ai-fluency-framework-foundations', 'AI Fluency: Framework & Foundations', 'ooauw3vzqwr9'),
  ypf('instrumentacion-industrial', { es: 'Instrumentación Industrial', en: 'Industrial Instrumentation' }, 16, 1130),
  ypf('salud-y-seguridad', { es: 'Salud y Seguridad en el Trabajo', en: 'Occupational Health and Safety' }, 16, 1131),
  ypf('energias-renovables', { es: 'Energías Renovables', en: 'Renewable Energy' }, 16, 1130),
  ypf('introduccion-ia', { es: 'Introducción a la Inteligencia Artificial', en: 'Introduction to Artificial Intelligence' }, 3, 1131),
  ypf('excel', { es: 'Excel', en: 'Excel' }, 5, 1130),
];
