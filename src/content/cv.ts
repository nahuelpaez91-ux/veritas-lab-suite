import type { Locale } from '@/lib/i18n/config';
import { certifications, education } from './credentials';
import { profile } from './profile';

export const audiences = ['nacional', 'local', 'global'] as const;
export type Audience = (typeof audiences)[number];

export function isAudience(value: string): value is Audience {
  return (audiences as readonly string[]).includes(value);
}

export function cvPdfName(audience: Audience, lang: Locale): string {
  return `CV-Andres-Nahuel-Paez-${audience}-${lang}.pdf`;
}

export interface CvEntry {
  title: string;
  meta?: string;
  link?: { label: string; href: string };
  bullets?: string[];
}

export interface CvSection {
  id: string;
  title: string;
  entries: CvEntry[];
}

export interface Cv {
  name: string;
  headline: string;
  contact: { label: string; href?: string }[];
  sections: CvSection[];
}

type L<T> = Record<Locale, T>;

const headline: L<string> = {
  es: 'Desarrollador de Software para Laboratorios | Datos · Calidad · Trazabilidad',
  en: 'Laboratory Software Developer | Data · Quality · Traceability',
};

const summary: L<string> = {
  es: 'Desarrollador de software y datos orientado a laboratorios. Construyo herramientas con cálculos deterministas verificados contra referencias publicadas (NIST StRD, EURACHEM/GUM, reglas de Westgard), audit trail encadenado por hash, firma electrónica con re-autenticación e integración de equipos por ASTM E1394 y HL7 v2. Uso IA (Claude API) solo fuera del camino crítico, con revisión humana y registro. Aporto más de 8 años de gestión administrativa y de expedientes en instituciones educativas (información sensible, plazos y normativa), y formación en estadística, geología e hidrología.',
  en: 'Software and data developer focused on laboratories. I build tools with deterministic calculations verified against published references (NIST StRD, EURACHEM/GUM, Westgard rules), hash-chained audit trails, electronic signatures with re-authentication, and instrument integration via ASTM E1394 and HL7 v2. I use AI (Claude API) only off the critical path, with human review and logging. I bring 8+ years of administrative and records management at educational institutions (sensitive files, deadlines and regulations), plus training in statistics, geology and hydrology.',
};

const availability: Record<Audience, L<string>> = {
  nacional: {
    es: 'Disponibilidad: remoto para toda Argentina (UTC−3), con viajes cuando se requiera. Incorporación inmediata.',
    en: 'Availability: remote across Argentina (UTC−3), travel as needed. Immediate start.',
  },
  local: {
    es: 'Disponibilidad: presencial en La Rioja y la región (NOA / Cuyo) o remoto. Incorporación inmediata.',
    en: 'Availability: on-site in La Rioja and the region (Northwest Argentina / Cuyo) or remote. Immediate start.',
  },
  global: {
    es: 'Disponibilidad: remoto internacional (UTC−3; solapamiento con las mañanas de Europa y con toda América). Abierto a reubicación. Incorporación inmediata.',
    en: 'Availability: remote worldwide (UTC−3; overlaps European mornings and all of the Americas). Open to relocation. Immediate start.',
  },
};

const regulatory: Record<Audience, L<string>> = {
  nacional: {
    es: 'ANMAT Disp. 4159/2023 (Anexo 6: sistemas informáticos) · ISO/IEC 17025 · ISO 15189 · ALCOA+ · GAMP 5 · 21 CFR Part 11 — aplicados en proyectos propios.',
    en: 'ANMAT Disp. 4159/2023 (Annex 6: computerized systems) · ISO/IEC 17025 · ISO 15189 · ALCOA+ · GAMP 5 · 21 CFR Part 11 — applied in personal projects.',
  },
  local: {
    es: 'ANMAT Disp. 4159/2023 (Anexo 6) · ISO/IEC 17025 · ISO 15189 · ALCOA+ · GAMP 5 — aplicados en proyectos propios · Código Alimentario Argentino (art. 982, agua de consumo): próximo módulo.',
    en: 'ANMAT Disp. 4159/2023 (Annex 6) · ISO/IEC 17025 · ISO 15189 · ALCOA+ · GAMP 5 — applied in personal projects · Argentine Food Code (art. 982, drinking water): upcoming module.',
  },
  global: {
    es: 'FDA 21 CFR Part 11 · EU GMP Anexo 11 y borrador del Anexo 22 (IA) · GAMP 5 · ALCOA+ · ISO/IEC 17025 · ISO 15189 — aplicados en proyectos propios.',
    en: 'FDA 21 CFR Part 11 · EU GMP Annex 11 and draft Annex 22 (AI) · GAMP 5 · ALCOA+ · ISO/IEC 17025 · ISO 15189 — applied in personal projects.',
  },
};

const titles: L<Record<'profile' | 'projects' | 'regulatory' | 'skills' | 'experience' | 'education' | 'certifications' | 'capabilities' | 'languages', string>> = {
  es: {
    profile: 'Perfil',
    projects: 'Proyectos',
    regulatory: 'Conocimiento normativo',
    skills: 'Habilidades técnicas',
    experience: 'Experiencia',
    education: 'Formación',
    certifications: 'Certificaciones',
    capabilities: 'Qué puedo aportar',
    languages: 'Idiomas',
  },
  en: {
    profile: 'Profile',
    projects: 'Projects',
    regulatory: 'Regulatory knowledge',
    skills: 'Technical skills',
    experience: 'Experience',
    education: 'Education',
    certifications: 'Certifications',
    capabilities: 'What I can build',
    languages: 'Languages',
  },
};

const suite: L<string[]> = {
  es: [
    'Flujo integrado Enlace → Control de calidad → Custodia → Informe: parser ASTM E1394 / HL7 v2 con mapeo LOINC, multirreglas de Westgard que bloquean la liberación, audit trail SHA-256 y firma electrónica con segregación de funciones.',
    'Calibración (mínimos cuadrados ponderados, LOD/LOQ, predicción inversa con IC 95 %) verificada contra NIST StRD Norris; incertidumbre GUM + Monte Carlo verificada contra EURACHEM A1.',
    'Dossier de validación estilo GAMP 5: URS, análisis de riesgo y matriz de trazabilidad generada automáticamente desde los tests (Vitest + Playwright, CI en GitHub Actions).',
    'Esquema PostgreSQL con audit trail solo-agregado por triggers, probado con PGlite; asistente con Claude API bajo una política de uso de IA (EU GMP Anexo 22, borrador).',
  ],
  en: [
    'Integrated flow Enlace → Quality control → Custodia → Report: ASTM E1394 / HL7 v2 parser with LOINC mapping, Westgard multirules that block release, SHA-256 audit trail and electronic signatures with segregation of duties.',
    'Calibration (weighted least squares, LOD/LOQ, inverse prediction with 95 % CI) verified against NIST StRD Norris; GUM + Monte Carlo uncertainty verified against EURACHEM A1.',
    'GAMP 5-style validation dossier: URS, risk assessment and a traceability matrix generated automatically from the tests (Vitest + Playwright, CI on GitHub Actions).',
    'PostgreSQL schema with a trigger-enforced append-only audit trail, tested with PGlite; Claude API assistant under an AI use policy (draft EU GMP Annex 22).',
  ],
};

const localBullet: L<string> = {
  es: 'Próximos módulos regionales: arsénico en agua de consumo (La Rioja), enología (parámetros INV) y geoquímica (datos SEGEMAR).',
  en: 'Upcoming regional modules: arsenic in drinking water (La Rioja), enology (INV parameters) and geochemistry (SEGEMAR data).',
};

const otherProjects: L<CvEntry[]> = {
  es: [
    {
      title: 'NormaMina: asistente RAG sobre normativa minera',
      meta: 'Next.js · Supabase pgvector · Google Gemini',
      link: { label: 'normamina.vercel.app', href: 'https://normamina.vercel.app' },
      bullets: ['Responde con cita del documento y del artículo; si no hay información, lo dice.'],
    },
    {
      title: 'Pronóstico de generación solar con machine learning',
      meta: 'Python · scikit-learn',
      bullets: ['Random Forest con R² 0,977 y −70 % de error frente al baseline, sobre datos sintéticos con parámetros físicos reales.'],
    },
    {
      title: 'Simulador de salar de litio',
      meta: 'Python',
      bullets: ['Balance de salmuera en cascada de pozas (Mg/Li, sales precipitadas, LCE).'],
    },
  ],
  en: [
    {
      title: 'NormaMina: RAG assistant over mining regulations',
      meta: 'Next.js · Supabase pgvector · Google Gemini',
      link: { label: 'normamina.vercel.app', href: 'https://normamina.vercel.app' },
      bullets: ['Answers cite the document and article; when there is no information, it says so.'],
    },
    {
      title: 'Solar generation forecasting with machine learning',
      meta: 'Python · scikit-learn',
      bullets: ['Random Forest with R² 0.977 and −70 % error vs. baseline, on synthetic data built from real physical parameters.'],
    },
    {
      title: 'Lithium brine evaporation simulator',
      meta: 'Python',
      bullets: ['Brine balance across a cascade of ponds (Mg/Li, precipitated salts, LCE).'],
    },
  ],
};

const skills: L<string[]> = {
  es: [
    'Lenguajes y datos: Python (pandas, NumPy, scikit-learn, matplotlib), SQL (PostgreSQL, SQLite, Supabase), TypeScript.',
    'Web y calidad de software: Next.js, React, Tailwind, Vitest, Playwright, Git, GitHub Actions, Vercel.',
    'Laboratorio e integración: ASTM E1394 / LIS2-A2, HL7 v2 (ORU^R01), LOINC, Westgard, SPC, calibración, incertidumbre GUM.',
    'IA: Claude API, RAG con citas, Model Context Protocol (MCP), text-to-SQL, IA con barandas GxP.',
    'GIS: PostGIS, GeoPandas, MapLibre, Leaflet.',
  ],
  en: [
    'Languages and data: Python (pandas, NumPy, scikit-learn, matplotlib), SQL (PostgreSQL, SQLite, Supabase), TypeScript.',
    'Web and software quality: Next.js, React, Tailwind, Vitest, Playwright, Git, GitHub Actions, Vercel.',
    'Laboratory and integration: ASTM E1394 / LIS2-A2, HL7 v2 (ORU^R01), LOINC, Westgard, SPC, calibration, GUM uncertainty.',
    'AI: Claude API, RAG with citations, Model Context Protocol (MCP), text-to-SQL, AI with GxP guardrails.',
    'GIS: PostGIS, GeoPandas, MapLibre, Leaflet.',
  ],
};

const experience: L<CvEntry[]> = {
  es: [
    {
      title: 'Desarrollador independiente de software y datos',
      meta: 'La Rioja, Argentina (remoto) · 2025 – actualidad',
      bullets: [
        'Desarrollé Veritas Lab Suite, NormaMina (RAG sobre normativa minera) y proyectos de datos y machine learning para minería, energía y finanzas.',
        'Next.js/TypeScript, Python, SQL y Claude API, con tests automatizados, integración continua y despliegue en Vercel.',
      ],
    },
    {
      title: 'Secretario Administrativo',
      meta: 'Colegio Pbro. Virgilio Carlos Ferreyra, Anillaco (La Rioja) · 2017 – 2025',
      bullets: [
        'Gestión documental y de expedientes con información sensible, plazos y normativa.',
        'Coordinación de procesos administrativos y planificación operativa.',
      ],
    },
    {
      title: 'Coordinación Académica y Administrativa',
      meta: 'ISFD Madre Teresa de Calcuta, Anjullón (La Rioja) · 2019 – 2025',
      bullets: ['Seguimiento administrativo, coordinación de equipos y mejora de procesos.'],
    },
    {
      title: 'Docente de nivel secundario',
      meta: 'Instituciones educativas de La Rioja · 2015 – 2019',
      bullets: ['Planificación, dictado y evaluación de clases.'],
    },
  ],
  en: [
    {
      title: 'Independent software and data developer',
      meta: 'La Rioja, Argentina (remote) · 2025 – present',
      bullets: [
        'Built Veritas Lab Suite, NormaMina (RAG over mining regulations) and data/machine-learning projects for mining, energy and finance.',
        'Next.js/TypeScript, Python, SQL and Claude API, with automated tests, continuous integration and deployment on Vercel.',
      ],
    },
    {
      title: 'Administrative Secretary',
      meta: 'Colegio Pbro. Virgilio Carlos Ferreyra, Anillaco (La Rioja) · 2017 – 2025',
      bullets: [
        'Document and records management involving sensitive information, deadlines and regulations.',
        'Coordination of administrative processes and operational planning.',
      ],
    },
    {
      title: 'Academic and Administrative Coordinator',
      meta: 'ISFD Madre Teresa de Calcuta, Anjullón (La Rioja) · 2019 – 2025',
      bullets: ['Administrative follow-up, team coordination and process improvement.'],
    },
    {
      title: 'Secondary School Teacher',
      meta: 'Schools in La Rioja · 2015 – 2019',
      bullets: ['Lesson planning, teaching and assessment.'],
    },
  ],
};

const capabilities: L<string[]> = {
  es: [
    'Migrar planillas Excel a un sistema con audit trail, roles y firmas.',
    'Informes y certificados de análisis automáticos a partir de datos auditados.',
    'Ingesta de archivos e interfaces de equipos (CSV, ASTM, HL7) a una base de datos.',
    'Asistentes de IA sobre SOP y normativa, con cita de la fuente y revisión humana.',
    'Documentación de validación: URS, análisis de riesgo, matriz de trazabilidad y protocolos.',
  ],
  en: [
    'Migrate Excel spreadsheets to a system with audit trail, roles and signatures.',
    'Automatic reports and certificates of analysis from audited data.',
    'Ingest instrument files and interfaces (CSV, ASTM, HL7) into a database.',
    'AI assistants over SOPs and regulations, with source citations and human review.',
    'Validation documentation: URS, risk assessment, traceability matrix and protocols.',
  ],
};

const languages: L<string> = {
  es: 'Español: nativo · Inglés: intermedio (Técnico en Idioma Inglés, 2015).',
  en: 'Spanish: native · English: intermediate (English Language Technician, 2015).',
};

export function getCv(lang: Locale, audience: Audience): Cv {
  const t = titles[lang];
  const contact: Cv['contact'] = [
    { label: profile.email, href: `mailto:${profile.email}` },
    { label: `${profile.phone} (WhatsApp)`, href: profile.whatsappUrl },
    { label: `${profile.location} · ${profile.timezone}` },
    { label: profile.siteUrl.replace('https://', ''), href: profile.siteUrl },
    { label: profile.github.replace('https://', ''), href: profile.github },
  ];
  if (profile.linkedin) contact.push({ label: profile.linkedin.replace('https://', ''), href: profile.linkedin });

  const suiteBullets = audience === 'local' ? [...suite[lang], localBullet[lang]] : suite[lang];

  return {
    name: profile.name,
    headline: headline[lang],
    contact,
    sections: [
      { id: 'profile', title: t.profile, entries: [{ title: summary[lang] }, { title: availability[audience][lang] }] },
      {
        id: 'projects',
        title: t.projects,
        entries: [
          {
            title: 'Veritas Lab Suite',
            meta: 'Next.js · TypeScript · PostgreSQL · Claude API',
            link: { label: profile.siteUrl.replace('https://', ''), href: `${profile.siteUrl}/${lang}` },
            bullets: suiteBullets,
          },
          ...otherProjects[lang],
        ],
      },
      { id: 'regulatory', title: t.regulatory, entries: [{ title: regulatory[audience][lang] }] },
      { id: 'skills', title: t.skills, entries: [{ title: '', bullets: skills[lang] }] },
      { id: 'experience', title: t.experience, entries: experience[lang] },
      {
        id: 'education',
        title: t.education,
        entries: education.map((e) => ({ title: e.title[lang], meta: `${e.org} · ${e.year}`, bullets: [e.detail[lang]] })),
      },
      {
        id: 'certifications',
        title: t.certifications,
        entries: [{ title: '', bullets: certifications.map((c) => `${c.issuer}: ${c.name[lang]} (${c.year})`) }],
      },
      { id: 'capabilities', title: t.capabilities, entries: [{ title: '', bullets: capabilities[lang] }] },
      { id: 'languages', title: t.languages, entries: [{ title: languages[lang] }] },
    ],
  };
}
