import type { Locale } from '@/lib/i18n/config';

type Localized = Record<Locale, string>;

export const education: { title: Localized; org: string; year: string; detail: Localized }[] = [
  {
    title: { es: 'Profesor en Geografía', en: 'Teaching Degree in Geography' },
    org: 'I.S.F.D. Albino G. Sánchez Barros, La Rioja',
    year: '2014',
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
    detail: { es: 'Inglés técnico, nivel intermedio.', en: 'Technical English, intermediate level.' },
  },
];

export const certifications: { issuer: string; year: string; name: Localized; url?: string }[] = [
  { issuer: 'Anthropic', year: '2026', name: { es: 'Claude Code in Action', en: 'Claude Code in Action' }, url: 'https://verify.skilljar.com/c/x6kitfnb74fd' },
  { issuer: 'Anthropic', year: '2026', name: { es: 'Building with the Claude API', en: 'Building with the Claude API' }, url: 'https://verify.skilljar.com/c/x43yh64wf9tw' },
  { issuer: 'Anthropic', year: '2026', name: { es: 'Introduction to Model Context Protocol', en: 'Introduction to Model Context Protocol' }, url: 'https://verify.skilljar.com/c/hck97yofrzpd' },
  { issuer: 'Anthropic', year: '2026', name: { es: 'AI Fluency: Framework & Foundations', en: 'AI Fluency: Framework & Foundations' }, url: 'https://verify.skilljar.com/c/ooauw3vzqwr9' },
  { issuer: 'Fundación YPF', year: '2026', name: { es: 'Instrumentación Industrial (16 h)', en: 'Industrial Instrumentation (16 h)' } },
  { issuer: 'Fundación YPF', year: '2026', name: { es: 'Salud y Seguridad en el Trabajo (16 h)', en: 'Occupational Health and Safety (16 h)' } },
  { issuer: 'Fundación YPF', year: '2026', name: { es: 'Energías Renovables (16 h)', en: 'Renewable Energy (16 h)' } },
  { issuer: 'Fundación YPF', year: '2026', name: { es: 'Introducción a la Inteligencia Artificial (3 h)', en: 'Introduction to Artificial Intelligence (3 h)' } },
];
