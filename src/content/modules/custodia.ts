import type { LocalizedModule } from '../types';

export const custodia: LocalizedModule = {
  es: {
    name: 'Custodia',
    area: 'Trazabilidad e integración',
    tagline:
      'Recepción, estados y liberación de muestras con audit trail encadenado por hash y firma electrónica con re-autenticación.',
    whatSolves:
      'La integridad de datos es una de las observaciones más frecuentes en inspecciones: registros editables sin rastro, firmas sin significado y resultados liberados sin revisión. Custodia implementa un núcleo mínimo de LIMS. Cada cambio queda en un audit trail que no se puede alterar sin que se note. Cada firma exige contraseña y declara su significado. La liberación se bloquea si el control de calidad no la permite.',
    howItWorks: [
      'Cada muestra pasa por los estados recibida → en análisis → revisada → liberada, y cada transición queda auditada.',
      'El audit trail es solo-agregado y a prueba de manipulaciones (tamper-evident): cada registro guarda el hash SHA-256 del anterior. Si alguien edita, inserta, reordena o borra un registro, la verificación marca dónde se rompió la cadena. El truncado del final se detecta guardando aparte el último hash, como hace el esquema de base de datos.',
      'La firma electrónica pide volver a ingresar la contraseña y registra quién firmó, cuándo y con qué significado (revisado / aprobado). Queda ligada al hash del contenido firmado.',
      'Segregación de funciones: quien revisó una versión no puede aprobarla, y solo el rol validador aprueba.',
      'Antes de aprobar se consulta el estado de las corridas de control: si alguna está rechazada, la muestra no se libera.',
    ],
    dataSources: [
      { variable: 'Muestras', source: 'Recepción con lector de código de barras / QR y órdenes del sistema de gestión' },
      { variable: 'Usuarios y roles', source: 'Directorio corporativo (SSO) con los roles del laboratorio' },
      { variable: 'Audit trail', source: 'Tabla solo-agregado en PostgreSQL con triggers (supabase/migrations en el repo)' },
      { variable: 'Firmas', source: 'Módulo de firma con re-autenticación y política de contraseñas' },
    ],
    whereElse: [
      'LIMS de laboratorios farmacéuticos, de alimentos y ambientales',
      'Biobancos y cadena de custodia forense',
      'Gestión documental con aprobación (SOP, certificados)',
    ],
    steps: [
      'Seleccioná la muestra M-2026-0101 (llega desde Enlace).',
      'Como Analista, firmá «revisado» con la contraseña que muestra la barra de demo.',
      'Cambiá a la Validadora e intentá aprobar: el sistema bloquea por la corrida GLU-R021.',
      'Registrá una corrida aceptada en Control de calidad, repetí la muestra, revisá y aprobá con dos usuarios distintos.',
    ],
    science: {
      formula:
        'hashₙ = SHA-256( JSON canónico de { seq, fecha, actor, acción, entidad, antes, después, prevHash = hashₙ₋₁ } )\nhash₀ = 000…0 (64 ceros)\nVerificación: recalcular cada hash y compararlo con el guardado y con el prevHash del siguiente.',
      standard:
        'FDA 21 CFR Part 11 (§11.10(e) audit trail, §11.50 significado de la firma, §11.200 re-autenticación); EU GMP Anexo 11; ANMAT Disp. 4159/2023 Anexo 6; ALCOA+ (MHRA / PIC/S). Diseñado considerando estas normas; no validado.',
      workedExample:
        'El registro #2 guarda prevHash = hash del #1.\nSi se edita un valor del #2, su hash recalculado cambia → «cadena alterada en el registro #2».\nSi se borra el #2, el #3 apunta a un hash que ya no existe → se detecta en el #3.',
    },
    glossary: [
      { term: 'Audit trail', definition: 'Registro cronológico y seguro, generado por el sistema, de quién hizo qué, cuándo y por qué.' },
      { term: 'ALCOA+', definition: 'Atribuible, Legible, Contemporáneo, Original, Exacto; + Completo, Consistente, Perdurable y Disponible.' },
      { term: 'Firma electrónica', definition: 'Firma con identificación del firmante, fecha y significado, ligada al registro firmado.' },
      { term: 'Segregación de funciones', definition: 'Separar a quien ejecuta de quien aprueba, para prevenir errores y fraudes.' },
      { term: 'SHA-256', definition: 'Huella digital de 64 caracteres: cualquier cambio en el contenido la modifica.' },
    ],
    verifiedAgainst: {
      label: 'tests de integridad (alteración y borrado detectados) y de reglas de firma',
      testPath: 'src/lib/lims/actions.test.ts',
    },
  },
  en: {
    name: 'Custodia (Custody)',
    area: 'Traceability & integration',
    tagline:
      'Sample receipt, status and release with a hash-chained audit trail and electronic signatures with re-authentication.',
    whatSolves:
      'Data integrity is one of the most frequent inspection findings: editable records with no trace, signatures without meaning and results released without review. Custodia implements a minimal LIMS core. Every change goes into an audit trail that cannot be altered without detection. Every signature requires a password and states its meaning. Release is blocked when quality control does not allow it.',
    howItWorks: [
      'Each sample moves through received → in analysis → reviewed → released, and every transition is audited.',
      'The audit trail is append-only and tamper-evident: each record stores the SHA-256 hash of the previous one. If anyone edits, inserts, reorders or deletes a record, verification shows where the chain broke. Tail truncation is detected by storing the latest hash separately, as the database schema does.',
      'The electronic signature asks for the password again and records who signed, when and with what meaning (reviewed / approved). It is bound to the hash of the signed content.',
      'Segregation of duties: whoever reviewed a revision cannot approve it, and only the approver role approves.',
      'Before approval, the control-run status is checked: if any run is rejected, the sample is not released.',
    ],
    dataSources: [
      { variable: 'Samples', source: 'Receipt with barcode / QR reader and orders from the management system' },
      { variable: 'Users and roles', source: 'Corporate directory (SSO) with laboratory roles' },
      { variable: 'Audit trail', source: 'Append-only PostgreSQL table with triggers (supabase/migrations in the repo)' },
      { variable: 'Signatures', source: 'Signature module with re-authentication and password policy' },
    ],
    whereElse: [
      'LIMS for pharmaceutical, food and environmental laboratories',
      'Biobanks and forensic chain of custody',
      'Document control with approval (SOPs, certificates)',
    ],
    steps: [
      'Select sample M-2026-0101 (it comes from Enlace).',
      'As the Analyst, sign “reviewed” with the password shown in the demo bar.',
      'Switch to the Approver and try to approve: the system blocks it because of run GLU-R021.',
      'Log an accepted run in Quality control, repeat the sample, then review and approve with two different users.',
    ],
    science: {
      formula:
        'hashₙ = SHA-256( canonical JSON of { seq, date, actor, action, entity, before, after, prevHash = hashₙ₋₁ } )\nhash₀ = 000…0 (64 zeros)\nVerification: recompute each hash and compare it with the stored one and with the next record’s prevHash.',
      standard:
        'FDA 21 CFR Part 11 (§11.10(e) audit trail, §11.50 signature manifestation, §11.200 re-authentication); EU GMP Annex 11; ANMAT Disp. 4159/2023 Annex 6; ALCOA+ (MHRA / PIC/S). Designed with these in mind; not validated.',
      workedExample:
        'Record #2 stores prevHash = hash of #1.\nIf a value in #2 is edited, its recomputed hash changes → “chain altered at record #2”.\nIf #2 is deleted, #3 points to a hash that no longer exists → detected at #3.',
    },
    glossary: [
      { term: 'Audit trail', definition: 'Secure, computer-generated, time-stamped record of who did what, when and why.' },
      { term: 'ALCOA+', definition: 'Attributable, Legible, Contemporaneous, Original, Accurate; + Complete, Consistent, Enduring, Available.' },
      { term: 'Electronic signature', definition: 'Signature with signer identity, date and meaning, bound to the signed record.' },
      { term: 'Segregation of duties', definition: 'Separating who performs from who approves, to prevent errors and fraud.' },
      { term: 'SHA-256', definition: '64-character fingerprint: any change in the content changes it.' },
    ],
    verifiedAgainst: {
      label: 'integrity tests (tampering and deletion detected) and signature-rule tests',
      testPath: 'src/lib/lims/actions.test.ts',
    },
  },
};
