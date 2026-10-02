export const home = {
  hero: {
    eyebrow: 'Software para laboratorios · Datos · Calidad · Trazabilidad',
    title: 'Construyo software de laboratorio con IA, sabiendo dónde no ponerla.',
    subtitle:
      'Los cálculos que deciden son deterministas y están verificados contra referencias publicadas. La IA solo asiste —explica y redacta— con revisión humana y audit trail.',
    ctaFlow: 'Recorrer el flujo',
    ctaCv: 'Ver CV',
    ctaValidation: 'Ver evidencia de validación',
  },
  availability: {
    title: 'Disponibilidad',
    items: [
      'Nacional: remoto para toda Argentina (UTC−3).',
      'Local: presencial o remoto en La Rioja, NOA y Cuyo.',
      'Mundial: remoto, con horario compatible con Europa y América.',
    ],
  },
  flow: {
    title: 'El flujo completo, conectado',
    subtitle: 'Un resultado viaja del analizador al informe sin transcripción manual y no sale si el control de calidad lo impide.',
    steps: [
      { slug: 'enlace', title: '1 · Enlace', text: 'El analizador envía ASTM o HL7; el mensaje se valida y se ingresa.' },
      { slug: 'qc', title: '2 · Control de calidad', text: 'Westgard evalúa la corrida; si se rechaza, bloquea.' },
      { slug: 'custodia', title: '3 · Custodia', text: 'Revisión y aprobación con firma electrónica y audit trail.' },
      { slug: 'informe', title: '4 · Informe', text: 'PDF con firmas y hashes de integridad.' },
    ],
  },
  modules: {
    title: 'Módulos',
    subtitle: 'Cada módulo funciona en el navegador, explica su ciencia y enlaza al test que lo verifica.',
    open: 'Abrir módulo →',
    comingTitle: 'Próximos módulos (en desarrollo)',
    coming: [
      'Stock y cadena de frío: reactivos FEFO, etiquetas QR, excursiones de temperatura y MKT',
      'Extractor de certificados de análisis con IA y revisión humana',
      'Cuenca: calidad de agua y arsénico en La Rioja (CAA art. 982)',
      'Enología: parámetros INV, límites legales y trazabilidad lote → análisis',
      'Geoquímica: datos SEGEMAR, QA/QC de ensayo y detección de anomalías',
      'Secuencia: FASTA/FASTQ, %GC y diseño de primers',
    ],
  },
  trajectory: {
    title: 'Del territorio y la gestión al laboratorio',
    text: 'Más de ocho años gestionando expedientes, plazos y normativa en instituciones educativas me enseñaron lo que exige un laboratorio regulado: que cada registro sea atribuible, trazable y auditable. Hoy lo aplico al software.',
    pillars: [
      { title: 'Gestión de expedientes y normativa', text: 'Control de versiones, trazabilidad y cumplimiento: la base de ALCOA+ y de ISO/IEC 17025 §8.3.' },
      { title: 'Ciencia de datos y territorio', text: 'Profesor en Geografía con estadística, geología, climatología e hidrología; Python científico y GIS.' },
      { title: 'Software con IA responsable', text: 'Next.js, TypeScript, SQL y Claude API, con tests, integración continua y la IA fuera del camino crítico.' },
    ],
  },
  capabilities: {
    title: 'Qué más puedo construir para tu laboratorio',
    items: [
      'Migrar planillas Excel a un sistema con audit trail, roles y firmas.',
      'Informes y certificados de análisis automáticos a partir de datos auditados.',
      'Ingesta de archivos e interfaces de equipos (CSV, ASTM, HL7) a una base de datos.',
      'Asistentes de IA sobre SOP y normativa, con cita de la fuente y revisión humana.',
      'Documentación de validación: URS, análisis de riesgo, matriz de trazabilidad y protocolos.',
    ],
  },
  credentials: { title: 'Formación y credenciales', education: 'Formación', certs: 'Certificaciones', verify: 'Verificar' },
  contact: {
    title: 'Contacto',
    text: '¿Tu laboratorio tiene un proceso manual que duele? Escribime y lo vemos.',
    email: 'Email',
    whatsapp: 'WhatsApp',
    github: 'GitHub',
  },
};
