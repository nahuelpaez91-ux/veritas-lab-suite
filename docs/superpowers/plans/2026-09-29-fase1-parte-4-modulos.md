# Fase 1 · Parte 4: Contenido y herramientas de los módulos (T21–T27)

> Parte del plan `2026-09-29-fase1-veritas-lab-suite.md`.
>
> **Patrón para agregar el diccionario de cada herramienta:** crear `src/lib/i18n/dictionaries/es/<tool>.ts` y `.../en/<tool>.ts` (tipado con `typeof`), y registrar la clave en el objeto `tools` de **ambos** `index.ts`. Ejemplo para `enlace`:
>
> ```ts
> // es/index.ts
> import { base } from './base';
> import { enlace } from './enlace';
> export const es = { ...base, tools: { enlace } };
> ```
>
> ```ts
> // en/index.ts
> import type { Dictionary } from '../types';
> import { base } from './base';
> import { enlace } from './enlace';
> export const en: Dictionary = { ...base, tools: { enlace } };
> ```
>
> Cada tarea siguiente agrega su import y su clave (`tools: { enlace, qc }`, etc.).

---

### Task 21: Contenido explicativo de los 6 módulos, registro y ruta

**Files:**
- Create: `src/content/modules/enlace.ts`, `qc.ts`, `custodia.ts`, `informe.ts`, `curva.ts`, `margen.ts`, `src/content/modules/index.ts`, `src/components/tools/registry.ts`, `src/app/[lang]/modulos/[slug]/page.tsx`

- [ ] **Step 1: Enlace**

`src/content/modules/enlace.ts`:

```ts
import type { LocalizedModule } from '../types';

export const enlace: LocalizedModule = {
  es: {
    name: 'Enlace',
    area: 'Trazabilidad e integración',
    tagline:
      'Interpreta mensajes de analizadores (ASTM E1394 y HL7 v2), los valida y los ingresa al sistema sin transcripción manual.',
    whatSolves:
      'En muchos laboratorios los resultados todavía se copian a mano del equipo al sistema, y cada transcripción es una oportunidad de error. Enlace lee el mensaje que emite el analizador, valida su estructura, mapea cada prueba a su código LOINC y la ingresa con trazabilidad completa.',
    howItWorks: [
      'Detecta el formato: si el mensaje empieza con MSH es HL7 v2; si no, ASTM E1394 (LIS2-A2).',
      'En ASTM quita las tramas (STX…ETX), verifica el checksum de cada una y separa los registros H, P, O, R y L.',
      'Toma los delimitadores del propio encabezado y extrae muestra, paciente, prueba, valor, unidades, rango, marca y estado.',
      'Conserva el valor crudo tal como llegó (ALCOA+: original) y, por separado, el numérico interpretado.',
      'Al ingresar, cada resultado queda asociado a la última corrida de control del analito y registrado en el audit trail.',
    ],
    dataSources: [
      { variable: 'Mensaje ASTM', source: 'Puerto serie RS-232 o TCP/IP del analizador, vía middleware o conector del LIS' },
      { variable: 'Mensaje HL7 v2 ORU^R01', source: 'Interfaz HL7 del equipo o del middleware (MLLP sobre TCP/IP)' },
      { variable: 'Códigos de prueba locales', source: 'Tabla de configuración del LIS por equipo' },
      { variable: 'Códigos LOINC', source: 'Base LOINC (Regenstrief) mapeada por el laboratorio' },
    ],
    whereElse: [
      'Laboratorios de análisis clínicos y hospitales (interfaces LIS)',
      'Laboratorios de alimentos o ambientales con equipos que exportan resultados',
      'Migración de datos históricos de equipos a un LIMS nuevo',
    ],
    steps: [
      'Presioná «Cargar ejemplo ASTM E1394» (o el de HL7).',
      'Presioná «Interpretar mensaje» y revisá la tabla y las observaciones.',
      'Presioná «Ingresar resultados al sistema».',
      'Seguí en Control de calidad: ¿la corrida asociada está aceptada?',
    ],
    science: {
      formula:
        'Checksum ASTM (LIS1-A):\n  suma = Σ bytes desde el N° de trama hasta ETX/ETB inclusive\n  checksum = (suma mod 256) en 2 dígitos hexadecimales\n\nRegistro R (resultado), campos separados por «|»:\n  R | secuencia | ^^^código | valor | unidades | rango | marca | naturaleza | estado | … | fecha/hora',
      standard:
        'ASTM E1394-97 / CLSI LIS2-A2 (registros), ASTM E1381 / CLSI LIS1-A (tramas y checksum), HL7 v2.5.1 ORU^R01, LOINC.',
      workedExample:
        'Trama: <STX>1H|\\^&<CR><ETX>\n  1(49) + H(72) + |(124) + \\(92) + ^(94) + &(38) + CR(13) + ETX(3) = 485\n  485 mod 256 = 229 = 0xE5  →  checksum «E5»',
    },
    glossary: [
      { term: 'LIS', definition: 'Sistema de información de laboratorio: gestiona órdenes, resultados e informes.' },
      { term: 'ASTM E1394', definition: 'Estándar de mensajes entre analizadores y sistemas informáticos (registros H, P, O, R, L).' },
      { term: 'HL7 v2', definition: 'Estándar de mensajería en salud; ORU^R01 transporta resultados de observaciones.' },
      { term: 'LOINC', definition: 'Códigos universales para identificar pruebas de laboratorio.' },
      { term: 'Checksum', definition: 'Suma de control que permite detectar tramas corruptas en la transmisión.' },
    ],
    verifiedAgainst: {
      label: 'estructura ASTM E1394 / HL7 v2.5.1 y checksum LIS1-A calculado a mano',
      testPath: 'src/lib/lis/astm.test.ts',
    },
  },
  en: {
    name: 'Enlace (Link)',
    area: 'Traceability & integration',
    tagline:
      'Parses analyzer messages (ASTM E1394 and HL7 v2), validates them and loads them into the system with no manual transcription.',
    whatSolves:
      'Many labs still copy results by hand from the instrument into the system, and every transcription is a chance for error. Enlace reads the message the analyzer emits, validates its structure, maps each test to its LOINC code and loads it with full traceability.',
    howItWorks: [
      'Detects the format: a message starting with MSH is HL7 v2; otherwise ASTM E1394 (LIS2-A2).',
      'For ASTM it strips frames (STX…ETX), verifies each checksum and splits H, P, O, R and L records.',
      'Reads delimiters from the header itself and extracts specimen, patient, test, value, units, range, flag and status.',
      'Keeps the raw value exactly as received (ALCOA+: original) and, separately, the parsed number.',
      'On import, each result is linked to the latest control run for its analyte and recorded in the audit trail.',
    ],
    dataSources: [
      { variable: 'ASTM message', source: 'Analyzer RS-232 serial port or TCP/IP, via middleware or LIS connector' },
      { variable: 'HL7 v2 ORU^R01 message', source: 'Instrument or middleware HL7 interface (MLLP over TCP/IP)' },
      { variable: 'Local test codes', source: 'LIS configuration table per instrument' },
      { variable: 'LOINC codes', source: 'LOINC database (Regenstrief) mapped by the laboratory' },
    ],
    whereElse: [
      'Clinical laboratories and hospitals (LIS interfaces)',
      'Food or environmental labs with instruments that export results',
      'Migrating historical instrument data into a new LIMS',
    ],
    steps: [
      'Click “Load ASTM E1394 example” (or the HL7 one).',
      'Click “Parse message” and review the table and findings.',
      'Click “Load results into the system”.',
      'Continue in Quality control: is the linked run accepted?',
    ],
    science: {
      formula:
        'ASTM checksum (LIS1-A):\n  sum = Σ bytes from the frame number through ETX/ETB inclusive\n  checksum = (sum mod 256) as 2 hexadecimal digits\n\nR (result) record, fields separated by “|”:\n  R | sequence | ^^^code | value | units | range | flag | nature | status | … | date/time',
      standard:
        'ASTM E1394-97 / CLSI LIS2-A2 (records), ASTM E1381 / CLSI LIS1-A (frames and checksum), HL7 v2.5.1 ORU^R01, LOINC.',
      workedExample:
        'Frame: <STX>1H|\\^&<CR><ETX>\n  1(49) + H(72) + |(124) + \\(92) + ^(94) + &(38) + CR(13) + ETX(3) = 485\n  485 mod 256 = 229 = 0xE5  →  checksum “E5”',
    },
    glossary: [
      { term: 'LIS', definition: 'Laboratory information system: manages orders, results and reports.' },
      { term: 'ASTM E1394', definition: 'Message standard between analyzers and computer systems (H, P, O, R, L records).' },
      { term: 'HL7 v2', definition: 'Healthcare messaging standard; ORU^R01 carries observation results.' },
      { term: 'LOINC', definition: 'Universal codes to identify laboratory tests.' },
      { term: 'Checksum', definition: 'Control sum that detects corrupted frames in transmission.' },
    ],
    verifiedAgainst: {
      label: 'ASTM E1394 / HL7 v2.5.1 structure and a hand-computed LIS1-A checksum',
      testPath: 'src/lib/lis/astm.test.ts',
    },
  },
};
```

- [ ] **Step 2: Control de calidad**

`src/content/modules/qc.ts`:

```ts
import type { LocalizedModule } from '../types';

export const qc: LocalizedModule = {
  es: {
    name: 'Control de calidad',
    area: 'Calidad analítica',
    tagline:
      'Cartas de Levey-Jennings y multirreglas de Westgard que bloquean la liberación de resultados de una corrida rechazada.',
    whatSolves:
      'Aplicar las reglas de Westgard a mano es lento y propenso a errores. Usada sola, la regla 1-2s rechaza entre 9 y 18 % de corridas buenas, y las reglas entre niveles se pasan por alto. Este módulo evalúa cada corrida con las multirreglas y la marca como aceptada, en advertencia o rechazada. El sistema no deja liberar resultados de una corrida rechazada hasta documentar la acción correctiva.',
    howItWorks: [
      'Convierte cada valor de control a unidades z = (x − media) / DE con los valores objetivo del lote.',
      'Evalúa 1-2s (advertencia) y las reglas de rechazo 1-3s, 2-2s, R-4s, 4-1s y 10x, dentro de cada nivel y entre niveles (materiales). Como es habitual en implementaciones por computadora, las reglas de rechazo se evalúan en todas las corridas, sin esperar a que 1-2s dispare la inspección.',
      'El estado de la corrida lo decide código determinista y testeado. La IA solo puede explicar o redactar un borrador.',
      'Si la corrida anterior fue rechazada, exige documentar la acción correctiva para registrar la siguiente.',
      'Calcula la métrica Sigma para decidir cuántas reglas conviene usar según el desempeño del método.',
    ],
    dataSources: [
      { variable: 'Valores de control', source: 'Corridas del analizador con material de control de 2 niveles (vía Enlace)' },
      { variable: 'Media y DE objetivo', source: 'Período de establecimiento del lote (≥ 20 corridas) o inserto del fabricante' },
      { variable: 'TEa', source: 'CLIA, variación biológica (EFLM) o requisito del laboratorio' },
      { variable: 'Sesgo', source: 'Programa de evaluación externa de la calidad (p. ej. PEEC)' },
    ],
    whereElse: [
      'Laboratorios de control de calidad farmacéutico y de alimentos (cartas de control)',
      'Laboratorios de ensayo acreditados ISO/IEC 17025',
      'Control estadístico de procesos en planta',
    ],
    steps: [
      'Elegí el analito (Glucosa trae una corrida rechazada de ejemplo).',
      'Mirá el gráfico: las líneas marcan ±1, ±2 y ±3 DE.',
      'En la tabla, GLU-R021 figura rechazada por 2-2s entre niveles.',
      'Registrá una corrida nueva con su acción correctiva y verificá que quede aceptada.',
    ],
    science: {
      formula:
        'z = (x − x̄) / DE\n1-2s: |z| > 2 en un control                  → advertencia\n1-3s: |z| > 3                                → rechazo (error aleatorio)\n2-2s: dos z > 2 (o < −2), seguidos o en 2 niveles → rechazo (sistemático)\nR-4s: un nivel > +2 y otro < −2 en la corrida → rechazo (aleatorio)\n4-1s: cuatro z > 1 (o < −1) seguidos           → rechazo (sistemático)\n10x : diez valores del mismo lado de la media  → rechazo (sistemático)\nSigma = (TEa − |sesgo|) / CV',
      standard:
        'Westgard JO et al., Clin Chem 1981;27:493-501; CLSI C24 (control estadístico de la calidad); ISO 15189:2022 §7.3.7.',
      workedExample:
        'Glucosa N1: media 95 mg/dL, DE 2,5 → valor 101 → z = (101 − 95) / 2,5 = +2,40\nGlucosa N2: media 250 mg/dL, DE 6   → valor 264 → z = +2,33\nDos niveles > +2 DE en la misma corrida → 2-2s → corrida RECHAZADA (error sistemático)\nSigma con TEa 10 %, sesgo 1 %, CV 1,5 %: (10 − 1) / 1,5 = 6,0',
    },
    glossary: [
      { term: 'DE', definition: 'Desvío estándar del material de control en el período de referencia.' },
      { term: 'CV', definition: 'Coeficiente de variación: DE / media × 100.' },
      { term: 'Corrida', definition: 'Conjunto de mediciones de pacientes y controles bajo las mismas condiciones.' },
      { term: 'TEa', definition: 'Error total admisible: cuánto puede apartarse un resultado sin afectar la decisión clínica.' },
      { term: 'Error sistemático', definition: 'Desplazamiento en una misma dirección (p. ej. calibración o reactivo).' },
    ],
    verifiedAgainst: {
      label: 'definiciones de las reglas de Westgard (Clin Chem 1981), un test por regla',
      testPath: 'src/lib/science/westgard.test.ts',
    },
  },
  en: {
    name: 'Quality control',
    area: 'Analytical quality',
    tagline: 'Levey-Jennings charts and Westgard multirules that block the release of results from a rejected run.',
    whatSolves:
      'Applying Westgard rules by hand is slow and error-prone. Used alone, the 1-2s rule rejects 9–18 % of good runs, and across-level rules get missed. This module evaluates every run with the multirules and marks it accepted, warning or rejected. The system will not release results from a rejected run until the corrective action is documented.',
    howItWorks: [
      'Converts each control value to z units = (x − mean) / SD using the lot’s target values.',
      'Evaluates 1-2s (warning) and the rejection rules 1-3s, 2-2s, R-4s, 4-1s and 10x, within each level and across levels (materials). As usual in computer implementations, rejection rules are checked on every run instead of waiting for a 1-2s warning.',
      'The run status is decided by deterministic, tested code. AI can only explain or draft.',
      'If the previous run was rejected, a documented corrective action is required before logging the next one.',
      'Computes the Sigma metric to decide how many rules the method’s performance calls for.',
    ],
    dataSources: [
      { variable: 'Control values', source: 'Analyzer runs with 2-level control material (via Enlace)' },
      { variable: 'Target mean and SD', source: 'Lot establishment period (≥ 20 runs) or manufacturer insert' },
      { variable: 'TEa', source: 'CLIA, biological variation (EFLM) or laboratory requirement' },
      { variable: 'Bias', source: 'External quality assessment / proficiency testing' },
    ],
    whereElse: [
      'Pharmaceutical and food QC laboratories (control charts)',
      'ISO/IEC 17025 accredited testing laboratories',
      'Statistical process control in manufacturing',
    ],
    steps: [
      'Pick the analyte (Glucose ships with a rejected example run).',
      'Read the chart: lines mark ±1, ±2 and ±3 SD.',
      'In the table, GLU-R021 is rejected by across-level 2-2s.',
      'Log a new run with its corrective action and check that it is accepted.',
    ],
    science: {
      formula:
        'z = (x − x̄) / SD\n1-2s: |z| > 2 on one control                   → warning\n1-3s: |z| > 3                                  → reject (random error)\n2-2s: two z > 2 (or < −2), consecutive or across levels → reject (systematic)\nR-4s: one level > +2 and another < −2 in a run → reject (random)\n4-1s: four consecutive z > 1 (or < −1)         → reject (systematic)\n10x : ten values on the same side of the mean  → reject (systematic)\nSigma = (TEa − |bias|) / CV',
      standard:
        'Westgard JO et al., Clin Chem 1981;27:493-501; CLSI C24 (statistical quality control); ISO 15189:2022 §7.3.7.',
      workedExample:
        'Glucose L1: mean 95 mg/dL, SD 2.5 → value 101 → z = (101 − 95) / 2.5 = +2.40\nGlucose L2: mean 250 mg/dL, SD 6   → value 264 → z = +2.33\nTwo levels > +2 SD in the same run → 2-2s → run REJECTED (systematic error)\nSigma with TEa 10 %, bias 1 %, CV 1.5 %: (10 − 1) / 1.5 = 6.0',
    },
    glossary: [
      { term: 'SD', definition: 'Standard deviation of the control material over the reference period.' },
      { term: 'CV', definition: 'Coefficient of variation: SD / mean × 100.' },
      { term: 'Run', definition: 'Set of patient and control measurements under the same conditions.' },
      { term: 'TEa', definition: 'Total allowable error: how far a result may deviate without affecting the clinical decision.' },
      { term: 'Systematic error', definition: 'A shift in one direction (e.g. calibration or reagent).' },
    ],
    verifiedAgainst: {
      label: 'Westgard rule definitions (Clin Chem 1981), one test per rule',
      testPath: 'src/lib/science/westgard.test.ts',
    },
  },
};
```

- [ ] **Step 3: Custodia**

`src/content/modules/custodia.ts`:

```ts
import type { LocalizedModule } from '../types';

export const custodia: LocalizedModule = {
  es: {
    name: 'Custodia',
    area: 'Trazabilidad e integración',
    tagline:
      'Recepción, estados y liberación de muestras con audit trail encadenado por hash y firma electrónica con re-autenticación.',
    whatSolves:
      'La integridad de datos aparece en la mayoría de las observaciones regulatorias: registros editables sin rastro, firmas sin significado y resultados liberados sin revisión. Custodia implementa el núcleo de un LIMS. Cada cambio queda en un audit trail que no se puede alterar sin que se note. Cada firma exige contraseña y declara su significado. La liberación se bloquea si el control de calidad no la permite.',
    howItWorks: [
      'Cada muestra pasa por los estados recibida → en análisis → revisada → liberada, y cada transición queda auditada.',
      'El audit trail es solo-agregado: cada registro guarda el hash SHA-256 del anterior. Si alguien edita o borra uno, la verificación marca dónde se rompió la cadena.',
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
      'Data integrity shows up in most regulatory observations: editable records with no trace, signatures without meaning and results released without review. Custodia implements the core of a LIMS. Every change goes into an audit trail that cannot be altered without detection. Every signature requires a password and states its meaning. Release is blocked when quality control does not allow it.',
    howItWorks: [
      'Each sample moves through received → in analysis → reviewed → released, and every transition is audited.',
      'The audit trail is append-only: each record stores the SHA-256 hash of the previous one. If anyone edits or deletes a record, verification shows where the chain broke.',
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
```

- [ ] **Step 4: Informe**

`src/content/modules/informe.ts`:

```ts
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
```

- [ ] **Step 5: Curva**

`src/content/modules/curva.ts`:

```ts
import type { LocalizedModule } from '../types';

export const curva: LocalizedModule = {
  es: {
    name: 'Curva',
    area: 'Calidad analítica',
    tagline:
      'Curvas de calibración por mínimos cuadrados (con o sin ponderación), límites de detección y cuantificación, y concentración de muestras con intervalo de confianza.',
    whatSolves:
      'La curva de calibración convierte una señal (absorbancia, área de pico) en concentración. Una regresión mal hecha o una extrapolación fuera de rango producen resultados equivocados sin que nadie lo note. Curva calcula la recta, muestra los residuos para detectar falta de linealidad, estima LOD y LOQ, y advierte cuando una muestra cae fuera del rango calibrado.',
    howItWorks: [
      'Ajusta y = a + b·x por mínimos cuadrados. Opcionalmente pondera por 1/x o 1/x² cuando la varianza crece con la concentración.',
      'Informa pendiente, ordenada, R², error estándar de la regresión (s y/x) y errores de a y de b.',
      'Estima LOD = 3,3·s/b y LOQ = 10·s/b (ICH Q2), solo en regresión sin ponderar: con ponderación, s y/x no representa el desvío del blanco.',
      'Para una muestra calcula x₀ = (y₀ − a)/b, su desvío y el intervalo de confianza del 95 % (t de Student).',
      'El cálculo está verificado contra el conjunto certificado Norris del NIST (StRD).',
    ],
    dataSources: [
      { variable: 'Concentración de estándares', source: 'Soluciones patrón preparadas desde material de referencia certificado' },
      { variable: 'Señal', source: 'Espectrofotómetro UV-Vis, cromatógrafo (áreas), ICP-OES' },
      { variable: 'Señal de muestras', source: 'Exportación del software del equipo (CSV) o interfaz' },
      { variable: 'Criterios de aceptación', source: 'Procedimiento validado del método' },
    ],
    whereElse: [
      'Química analítica en laboratorios de alimentos, aguas y ambiente',
      'Control de calidad farmacéutico (HPLC)',
      'Laboratorios mineros (ICP-OES / absorción atómica)',
    ],
    steps: [
      'Revisá los estándares precargados (señal contra mg/L) o pegá los tuyos.',
      'Elegí la ponderación y mirá el gráfico de residuos.',
      'Ingresá la señal de una muestra para obtener su concentración con IC 95 %.',
      'Exportá los datos a CSV.',
    ],
    science: {
      formula:
        'b = Σwᵢ(xᵢ − x̄)(yᵢ − ȳ) / Σwᵢ(xᵢ − x̄)²      a = ȳ − b·x̄\ns y/x = √( Σwᵢ(yᵢ − ŷᵢ)² / (n − 2) )\nLOD = 3,3·s/b       LOQ = 10·s/b\nx₀ = (y₀ − a)/b      s x₀ = (s y/x / b)·√( 1/m + 1/n + (y₀ − ȳ)² / (b²·Σ(xᵢ − x̄)²) )',
      standard:
        'ICH Q2(R2) Validación de procedimientos analíticos; Miller & Miller, Statistics and Chemometrics for Analytical Chemistry; NIST StRD (Norris).',
      workedExample:
        'x = 0, 1, 2, 3, 4      y = 0,1  2,1  3,9  6,1  7,9\nb = 19,6 / 10 = 1,96     a = 4,02 − 1,96·2 = 0,10\ns y/x = √(0,032 / 3) = 0,1033      R² = 0,99917\nLOD = 3,3·0,1033 / 1,96 = 0,174     LOQ = 0,527\ny₀ = 5 → x₀ = (5 − 0,10) / 1,96 = 2,50   (s x₀ = 0,058)',
    },
    glossary: [
      { term: 'LOD', definition: 'Límite de detección: menor concentración distinguible del blanco.' },
      { term: 'LOQ', definition: 'Límite de cuantificación: menor concentración medible con precisión aceptable.' },
      { term: 'Residuo', definition: 'Diferencia entre la señal medida y la que predice la recta.' },
      { term: 'Ponderación', definition: 'Dar menos peso a los puntos más variables (en general, las concentraciones altas).' },
      { term: 'NIST StRD', definition: 'Conjuntos de datos con resultados certificados para verificar software estadístico.' },
    ],
    verifiedAgainst: {
      label: 'NIST StRD Norris (valores certificados) y ejemplo resuelto',
      testPath: 'src/lib/science/calibration.test.ts',
    },
  },
  en: {
    name: 'Curva (Curve)',
    area: 'Analytical quality',
    tagline:
      'Least-squares calibration curves (weighted or not), detection and quantitation limits, and sample concentration with a confidence interval.',
    whatSolves:
      'A calibration curve turns a signal (absorbance, peak area) into concentration. A poor regression or an out-of-range extrapolation produces wrong results nobody notices. Curva fits the line, shows residuals to reveal non-linearity, estimates LOD and LOQ, and warns when a sample falls outside the calibrated range.',
    howItWorks: [
      'Fits y = a + b·x by least squares. It can optionally weight by 1/x or 1/x² when variance grows with concentration.',
      'Reports slope, intercept, R², the regression standard error (s y/x) and the errors of a and b.',
      'Estimates LOD = 3.3·s/b and LOQ = 10·s/b (ICH Q2), for unweighted regression only: with weighting, s y/x does not represent the blank SD.',
      'For a sample it computes x₀ = (y₀ − a)/b, its standard deviation and the 95 % confidence interval (Student’s t).',
      'The calculation is verified against NIST’s certified Norris dataset (StRD).',
    ],
    dataSources: [
      { variable: 'Standard concentrations', source: 'Standard solutions prepared from certified reference material' },
      { variable: 'Signal', source: 'UV-Vis spectrophotometer, chromatograph (areas), ICP-OES' },
      { variable: 'Sample signal', source: 'Instrument software export (CSV) or interface' },
      { variable: 'Acceptance criteria', source: 'Validated method procedure' },
    ],
    whereElse: [
      'Analytical chemistry in food, water and environmental labs',
      'Pharmaceutical QC (HPLC)',
      'Mining laboratories (ICP-OES / atomic absorption)',
    ],
    steps: [
      'Review the preloaded standards (signal vs mg/L) or paste your own.',
      'Choose the weighting and check the residual plot.',
      'Enter a sample signal to get its concentration with a 95 % CI.',
      'Export the data to CSV.',
    ],
    science: {
      formula:
        'b = Σwᵢ(xᵢ − x̄)(yᵢ − ȳ) / Σwᵢ(xᵢ − x̄)²      a = ȳ − b·x̄\ns y/x = √( Σwᵢ(yᵢ − ŷᵢ)² / (n − 2) )\nLOD = 3.3·s/b       LOQ = 10·s/b\nx₀ = (y₀ − a)/b      s x₀ = (s y/x / b)·√( 1/m + 1/n + (y₀ − ȳ)² / (b²·Σ(xᵢ − x̄)²) )',
      standard:
        'ICH Q2(R2) Validation of analytical procedures; Miller & Miller, Statistics and Chemometrics for Analytical Chemistry; NIST StRD (Norris).',
      workedExample:
        'x = 0, 1, 2, 3, 4      y = 0.1  2.1  3.9  6.1  7.9\nb = 19.6 / 10 = 1.96     a = 4.02 − 1.96·2 = 0.10\ns y/x = √(0.032 / 3) = 0.1033      R² = 0.99917\nLOD = 3.3·0.1033 / 1.96 = 0.174     LOQ = 0.527\ny₀ = 5 → x₀ = (5 − 0.10) / 1.96 = 2.50   (s x₀ = 0.058)',
    },
    glossary: [
      { term: 'LOD', definition: 'Limit of detection: lowest concentration distinguishable from the blank.' },
      { term: 'LOQ', definition: 'Limit of quantitation: lowest concentration measurable with acceptable precision.' },
      { term: 'Residual', definition: 'Difference between the measured signal and the one predicted by the line.' },
      { term: 'Weighting', definition: 'Giving less weight to the most variable points (usually high concentrations).' },
      { term: 'NIST StRD', definition: 'Datasets with certified results for verifying statistical software.' },
    ],
    verifiedAgainst: {
      label: 'NIST StRD Norris (certified values) and a worked example',
      testPath: 'src/lib/science/calibration.test.ts',
    },
  },
};
```

- [ ] **Step 6: Margen**

`src/content/modules/margen.ts`:

```ts
import type { LocalizedModule } from '../types';

export const margen: LocalizedModule = {
  es: {
    name: 'Margen',
    area: 'Calidad analítica',
    tagline: 'Incertidumbre de medición: presupuesto GUM con coeficientes de sensibilidad y verificación por Monte Carlo.',
    whatSolves:
      'ISO/IEC 17025 exige estimar la incertidumbre de medición, y es uno de los puntos que más cuesta en las auditorías. Margen arma el presupuesto paso a paso y muestra qué fuente pesa más, que es donde conviene invertir para mejorar. Después lo confirma con una simulación de Monte Carlo.',
    howItWorks: [
      'Cada magnitud de entrada tiene un valor, una incertidumbre estándar y una distribución (normal, rectangular o triangular).',
      'Calcula los coeficientes de sensibilidad derivando numéricamente el modelo de medición.',
      'Combina las contribuciones con u_c = √Σ(cᵢ·uᵢ)² y expande con k = 2 (≈ 95 %).',
      'Simula 100 000 valores con la distribución de cada entrada (GUM Suplemento 1) y compara el intervalo con el de la GUM.',
      'Incluye una calculadora tipo A a partir de réplicas.',
    ],
    dataSources: [
      { variable: 'Masa', source: 'Certificado de calibración de la balanza (incertidumbre y deriva)' },
      { variable: 'Pureza', source: 'Certificado del material de referencia' },
      { variable: 'Volumen', source: 'Tolerancia del material volumétrico clase A y efecto de la temperatura' },
      { variable: 'Repetibilidad', source: 'Réplicas del propio laboratorio (tipo A)' },
    ],
    whereElse: [
      'Laboratorios de ensayo y calibración acreditados ISO/IEC 17025',
      'Metrología industrial',
      'Declaraciones de conformidad con reglas de decisión (ILAC G8)',
    ],
    steps: [
      'Revisá el ejemplo precargado: preparación de un patrón de cadmio (EURACHEM A1).',
      'Cambiá una incertidumbre y mirá cómo cambia la contribución de cada fuente.',
      'Presioná «Simular 100 000 valores» y compará con la GUM.',
      'Usá la calculadora tipo A con tus réplicas.',
    ],
    science: {
      formula:
        'y = f(x₁, …, xₙ)        cᵢ = ∂f/∂xᵢ\nu_c(y) = √Σ (cᵢ·u(xᵢ))²        U = k·u_c,  k = 2\nTipo A: u = s/√n      Rectangular: u = a/√3      Triangular: u = a/√6',
      standard:
        'JCGM 100:2008 (GUM); JCGM 101:2008 (Suplemento 1, Monte Carlo); EURACHEM/CITAC Guide CG4 (QUAM), ejemplo A1.',
      workedExample:
        'c = 1000·m·P/V = 1000·100,28·0,9999 / 100,0 = 1002,7 mg/L\nu(m) = 0,05 mg    u(P) = 0,000058    u(V) = 0,07 mL\nu_c = √(0,49995² + 0,05816² + 0,70189²) = 0,864 mg/L\nU (k = 2) = 1,7 mg/L   →   c = (1002,7 ± 1,7) mg/L\nLa mayor contribución es el volumen (≈ 66 % de u²).',
    },
    glossary: [
      { term: 'Incertidumbre estándar', definition: 'Incertidumbre expresada como un desvío estándar.' },
      { term: 'Coeficiente de sensibilidad', definition: 'Cuánto cambia el resultado por cada unidad de cambio en una entrada.' },
      { term: 'Factor de cobertura k', definition: 'Multiplicador para obtener la incertidumbre expandida; k = 2 ≈ 95 %.' },
      { term: 'Monte Carlo', definition: 'Propagación por simulación: se muestrean las entradas y se obtiene la distribución del resultado.' },
    ],
    verifiedAgainst: {
      label: 'EURACHEM/CITAC QUAM, ejemplo A1 (GUM y Monte Carlo)',
      testPath: 'src/lib/science/uncertainty.test.ts',
    },
  },
  en: {
    name: 'Margen (Margin)',
    area: 'Analytical quality',
    tagline: 'Measurement uncertainty: GUM budget with sensitivity coefficients and Monte Carlo verification.',
    whatSolves:
      'ISO/IEC 17025 requires estimating measurement uncertainty, and it is one of the hardest points in audits. Margen builds the budget step by step and shows which source weighs most, which is where improvement pays off. Then it confirms the result with a Monte Carlo simulation.',
    howItWorks: [
      'Each input quantity has a value, a standard uncertainty and a distribution (normal, rectangular or triangular).',
      'Computes sensitivity coefficients by numerically differentiating the measurement model.',
      'Combines contributions as u_c = √Σ(cᵢ·uᵢ)² and expands with k = 2 (≈ 95 %).',
      'Simulates 100,000 values from each input distribution (GUM Supplement 1) and compares the interval with the GUM one.',
      'Includes a Type A calculator from replicates.',
    ],
    dataSources: [
      { variable: 'Mass', source: 'Balance calibration certificate (uncertainty and drift)' },
      { variable: 'Purity', source: 'Reference material certificate' },
      { variable: 'Volume', source: 'Class A glassware tolerance and temperature effect' },
      { variable: 'Repeatability', source: 'The laboratory’s own replicates (Type A)' },
    ],
    whereElse: [
      'ISO/IEC 17025 accredited testing and calibration laboratories',
      'Industrial metrology',
      'Conformity statements with decision rules (ILAC G8)',
    ],
    steps: [
      'Review the preloaded example: preparing a cadmium standard (EURACHEM A1).',
      'Change an uncertainty and watch each source’s contribution change.',
      'Click “Simulate 100,000 values” and compare with the GUM.',
      'Use the Type A calculator with your replicates.',
    ],
    science: {
      formula:
        'y = f(x₁, …, xₙ)        cᵢ = ∂f/∂xᵢ\nu_c(y) = √Σ (cᵢ·u(xᵢ))²        U = k·u_c,  k = 2\nType A: u = s/√n      Rectangular: u = a/√3      Triangular: u = a/√6',
      standard:
        'JCGM 100:2008 (GUM); JCGM 101:2008 (Supplement 1, Monte Carlo); EURACHEM/CITAC Guide CG4 (QUAM), example A1.',
      workedExample:
        'c = 1000·m·P/V = 1000·100.28·0.9999 / 100.0 = 1002.7 mg/L\nu(m) = 0.05 mg    u(P) = 0.000058    u(V) = 0.07 mL\nu_c = √(0.49995² + 0.05816² + 0.70189²) = 0.864 mg/L\nU (k = 2) = 1.7 mg/L   →   c = (1002.7 ± 1.7) mg/L\nThe largest contribution is the volume (≈ 66 % of u²).',
    },
    glossary: [
      { term: 'Standard uncertainty', definition: 'Uncertainty expressed as a standard deviation.' },
      { term: 'Sensitivity coefficient', definition: 'How much the result changes per unit change in an input.' },
      { term: 'Coverage factor k', definition: 'Multiplier giving the expanded uncertainty; k = 2 ≈ 95 %.' },
      { term: 'Monte Carlo', definition: 'Propagation by simulation: inputs are sampled and the output distribution is obtained.' },
    ],
    verifiedAgainst: {
      label: 'EURACHEM/CITAC QUAM example A1 (GUM and Monte Carlo)',
      testPath: 'src/lib/science/uncertainty.test.ts',
    },
  },
};
```

- [ ] **Step 7: Índice de módulos, registro de herramientas y ruta**

`src/content/modules/index.ts`:

```ts
import type { LocalizedModule, ModuleSlug } from '../types';
import { curva } from './curva';
import { custodia } from './custodia';
import { enlace } from './enlace';
import { informe } from './informe';
import { margen } from './margen';
import { qc } from './qc';

export const moduleOrder: ModuleSlug[] = ['enlace', 'qc', 'custodia', 'informe', 'curva', 'margen'];

export const modules: Record<ModuleSlug, LocalizedModule> = { enlace, qc, custodia, informe, curva, margen };

export function isModuleSlug(value: string): value is ModuleSlug {
  return (moduleOrder as string[]).includes(value);
}
```

`src/components/tools/registry.ts`:

```ts
import type { ComponentType } from 'react';
import type { ModuleSlug } from '@/content/types';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

export type ToolProps = { dict: Dictionary; lang: Locale };

// Cada tarea de herramienta (T22–T27) agrega su entrada.
export const toolRegistry: Partial<Record<ModuleSlug, ComponentType<ToolProps>>> = {};
```

`src/app/[lang]/modulos/[slug]/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ModuleShell } from '@/components/module/ModuleShell';
import { toolRegistry } from '@/components/tools/registry';
import { isModuleSlug, moduleOrder, modules } from '@/content/modules';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

type Params = Promise<{ lang: string; slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return moduleOrder.filter((slug) => toolRegistry[slug]).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang) || !isModuleSlug(slug)) return {};
  const content = modules[slug][lang];
  return { title: content.name, description: content.tagline };
}

export default async function ModulePage({ params }: { params: Params }) {
  const { lang, slug } = await params;
  if (!isLocale(lang) || !isModuleSlug(slug)) notFound();
  const Tool = toolRegistry[slug];
  if (!Tool) notFound();
  const dict = getDictionary(lang);
  return (
    <ModuleShell lang={lang} dict={dict} content={modules[slug][lang]}>
      <Tool dict={dict} lang={lang} />
    </ModuleShell>
  );
}
```

- [ ] **Step 8: Verificar y commit**

Run: `npx tsc --noEmit && npm run lint`
Esperado: sin errores. La ruta todavía no genera páginas porque el registro está vacío.

```bash
git add -A
git commit -m "feat: contenido explicativo ES/EN de los 6 módulos y ruta de módulos

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 22: Herramienta Enlace (ASTM / HL7 → sistema)

**Files:**
- Create: `src/lib/i18n/dictionaries/es/enlace.ts`, `src/lib/i18n/dictionaries/en/enlace.ts`, `src/components/tools/EnlaceTool.tsx`
- Modify: `src/lib/i18n/dictionaries/es/index.ts`, `src/lib/i18n/dictionaries/en/index.ts`, `src/components/tools/registry.ts`

- [ ] **Step 1: Diccionarios**

`src/lib/i18n/dictionaries/es/enlace.ts`:

```ts
export const enlace = {
  loadAstm: 'Cargar ejemplo ASTM E1394',
  loadHl7: 'Cargar ejemplo HL7 v2 ORU^R01',
  messageLabel: 'Mensaje del analizador (podés pegar el tuyo)',
  frames: 'Acepta registros sueltos o tramas LIS1-A (STX…ETX + checksum).',
  parse: 'Interpretar mensaje',
  empty: 'Cargá un ejemplo o pegá un mensaje y presioná «Interpretar mensaje».',
  format: 'Formato',
  sender: 'Equipo emisor',
  issuesTitle: 'Observaciones de validación',
  noIssues: 'Sin observaciones: estructura válida.',
  line: 'Línea',
  cols: {
    specimen: 'Muestra',
    patient: 'Paciente',
    test: 'Prueba',
    loinc: 'LOINC',
    value: 'Valor (crudo)',
    units: 'Unidades',
    range: 'Rango ref.',
    flag: 'Marca',
    completed: 'Fecha/hora',
  },
  import: 'Ingresar resultados al sistema',
  imported: '{n} resultados ingresados.',
  next: 'Ir a Control de calidad →',
  issues: {
    missing_header: 'Falta el registro H (encabezado)',
    no_specimen: 'Registro de orden sin ID de muestra',
    result_before_order: 'Resultado antes de cualquier orden',
    no_test_code: 'Resultado sin código de prueba',
    non_numeric: 'Valor no numérico (se conserva el texto original)',
    unknown_record: 'Tipo de registro desconocido',
    bad_checksum: 'Checksum de trama inválido',
    not_oru: 'El mensaje no es ORU^R01',
    missing_msh: 'Falta el segmento MSH',
  },
};
```

`src/lib/i18n/dictionaries/en/enlace.ts`:

```ts
import type { enlace as esEnlace } from '../es/enlace';

export const enlace: typeof esEnlace = {
  loadAstm: 'Load ASTM E1394 example',
  loadHl7: 'Load HL7 v2 ORU^R01 example',
  messageLabel: 'Analyzer message (you can paste your own)',
  frames: 'Accepts plain records or LIS1-A frames (STX…ETX + checksum).',
  parse: 'Parse message',
  empty: 'Load an example or paste a message and click “Parse message”.',
  format: 'Format',
  sender: 'Sending instrument',
  issuesTitle: 'Validation findings',
  noIssues: 'No findings: valid structure.',
  line: 'Line',
  cols: {
    specimen: 'Specimen',
    patient: 'Patient',
    test: 'Test',
    loinc: 'LOINC',
    value: 'Value (raw)',
    units: 'Units',
    range: 'Ref. range',
    flag: 'Flag',
    completed: 'Date/time',
  },
  import: 'Load results into the system',
  imported: '{n} results loaded.',
  next: 'Go to Quality control →',
  issues: {
    missing_header: 'Missing H (header) record',
    no_specimen: 'Order record without specimen ID',
    result_before_order: 'Result before any order',
    no_test_code: 'Result without test code',
    non_numeric: 'Non-numeric value (original text kept)',
    unknown_record: 'Unknown record type',
    bad_checksum: 'Invalid frame checksum',
    not_oru: 'The message is not ORU^R01',
    missing_msh: 'Missing MSH segment',
  },
};
```

Registrar `enlace` en `tools` de `es/index.ts` y `en/index.ts` (ver el patrón al inicio de esta parte).

- [ ] **Step 2: Componente**

`src/components/tools/EnlaceTool.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatLabError, useLab } from '@/components/lab/LabStoreProvider';
import { StatusChip } from '@/components/lab/StatusChip';
import { btnPrimary, btnSecondary, card, label, table, tableWrap } from '@/components/ui/styles';
import { ASTM_EXAMPLE, HL7_EXAMPLE } from '@/lib/lis/examples';
import { parseMessage } from '@/lib/lis/parse';
import type { ParseOutcome } from '@/lib/lis/types';
import { importResults } from '@/lib/lims/actions';
import type { ToolProps } from './registry';

export function EnlaceTool({ dict, lang }: ToolProps) {
  const t = dict.tools.enlace;
  const { state, run } = useLab();
  const [raw, setRaw] = useState('');
  const [outcome, setOutcome] = useState<ParseOutcome | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const hasErrors = outcome?.issues.some((i) => i.severity === 'error') ?? false;

  function load(example: string) {
    setRaw(example.replace(/\r/g, '\n'));
    setOutcome(null);
    setNotice(null);
  }

  async function onImport() {
    if (!outcome) return;
    const parsed = outcome;
    const res = await run((s, u, at) => importResults(s, parsed.results, parsed.format, u, at));
    setNotice(
      res.ok
        ? { ok: true, text: t.imported.replace('{n}', String(parsed.results.length)) }
        : { ok: false, text: formatLabError(dict, res.error) },
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className={card}>
        <div className="flex flex-wrap gap-2">
          <button type="button" data-testid="load-astm-example" className={btnSecondary} onClick={() => load(ASTM_EXAMPLE)}>
            {t.loadAstm}
          </button>
          <button type="button" data-testid="load-hl7-example" className={btnSecondary} onClick={() => load(HL7_EXAMPLE)}>
            {t.loadHl7}
          </button>
        </div>
        <label htmlFor="raw-message" className={`${label} mt-4`}>
          {t.messageLabel}
        </label>
        <textarea
          id="raw-message"
          data-testid="raw-message"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={12}
          spellCheck={false}
          className="mt-1 w-full rounded-md border border-line bg-bg p-2 font-mono text-xs"
        />
        <p className="mt-1 text-xs text-muted">{t.frames}</p>
        <button
          type="button"
          data-testid="parse-message"
          className={`${btnPrimary} mt-3`}
          disabled={!raw.trim()}
          onClick={() => {
            setOutcome(parseMessage(raw));
            setNotice(null);
          }}
        >
          {t.parse}
        </button>
      </div>

      <div className={card}>
        {!outcome ? (
          <p className="text-sm text-muted">{t.empty}</p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <StatusChip tone="neutral">
                {t.format}: {outcome.format === 'astm' ? 'ASTM E1394' : 'HL7 v2'}
              </StatusChip>
              {outcome.sender && (
                <StatusChip tone="neutral">
                  {t.sender}: {outcome.sender}
                </StatusChip>
              )}
            </div>
            <section>
              <h2 className="text-sm font-semibold">{t.issuesTitle}</h2>
              {outcome.issues.length === 0 ? (
                <p className="mt-1 text-sm text-ok">{t.noIssues}</p>
              ) : (
                <ul className="mt-1 space-y-1 text-sm" data-testid="parse-issues">
                  {outcome.issues.map((issue, k) => (
                    <li key={k} className={issue.severity === 'error' ? 'text-danger' : 'text-warn'}>
                      {t.line} {issue.line}: {t.issues[issue.code]}
                      {issue.detail ? ` (${issue.detail})` : ''}
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <div className={tableWrap}>
              <table className={table}>
                <thead>
                  <tr>
                    <th>{t.cols.specimen}</th>
                    <th>{t.cols.patient}</th>
                    <th>{t.cols.test}</th>
                    <th>{t.cols.loinc}</th>
                    <th>{t.cols.value}</th>
                    <th>{t.cols.units}</th>
                    <th>{t.cols.range}</th>
                    <th>{t.cols.flag}</th>
                    <th>{t.cols.completed}</th>
                  </tr>
                </thead>
                <tbody>
                  {outcome.results.map((r) => (
                    <tr key={`${r.specimenId}:${r.testCode}`} data-testid="parsed-row">
                      <td className="font-mono">{r.specimenId}</td>
                      <td>
                        {r.patientName} <span className="text-muted">({r.patientId})</span>
                      </td>
                      <td className="font-mono">{r.testCode}</td>
                      <td className="font-mono">{r.loinc ?? '—'}</td>
                      <td className="font-mono">{r.rawValue}</td>
                      <td>{r.units}</td>
                      <td>{r.referenceRange}</td>
                      <td>{r.flag}</td>
                      <td className="font-mono text-xs">{r.completedAt ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              data-testid="import-results"
              className={btnPrimary}
              disabled={hasErrors || outcome.results.length === 0 || !state}
              onClick={onImport}
            >
              {t.import}
            </button>
            {notice && (
              <p role="status" data-testid={notice.ok ? 'import-ok' : 'import-error'} className={`text-sm ${notice.ok ? 'text-ok' : 'text-danger'}`}>
                {notice.text}{' '}
                {notice.ok && (
                  <Link className="underline" href={`/${lang}/modulos/qc`}>
                    {t.next}
                  </Link>
                )}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Registrar la herramienta**

En `src/components/tools/registry.ts`, agregar `import { EnlaceTool } from './EnlaceTool';` y dejar el objeto así:

```ts
export const toolRegistry: Partial<Record<ModuleSlug, ComponentType<ToolProps>>> = {
  enlace: EnlaceTool,
};
```

- [ ] **Step 4: Verificar en el navegador**

1. Run: `npx tsc --noEmit && npm run lint`. Esperado: sin errores.
2. Con `npm run dev`, abrir `http://localhost:3000/es/modulos/enlace` y comprobar:
   - Barra de demo visible.
   - Ficha «¿Qué es esto?» abre y cierra.
   - «Cargar ejemplo ASTM» → «Interpretar» → 4 filas y «Sin observaciones».
   - «Ingresar resultados» → mensaje «4 resultados ingresados».
   - `/en/modulos/enlace` muestra los textos en inglés.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: módulo Enlace (ASTM/HL7 → sistema) con ficha explicativa

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 23: Herramienta de Control de calidad (Levey-Jennings + Westgard + Sigma)

**Files:**
- Create: `src/lib/i18n/dictionaries/es/qc.ts`, `src/lib/i18n/dictionaries/en/qc.ts`, `src/components/tools/LeveyJenningsChart.tsx`, `src/components/tools/QcTool.tsx`
- Modify: ambos `index.ts` de diccionarios, `src/components/tools/registry.ts`

- [ ] **Step 1: Diccionarios**

`src/lib/i18n/dictionaries/es/qc.ts`:

```ts
export const qc = {
  analyte: 'Analito',
  analytes: { GLU: 'Glucosa', CHOL: 'Colesterol' } as Record<string, string>,
  targets: 'Valores objetivo del material de control',
  level: 'Nivel',
  mean: 'Media',
  sd: 'DE',
  sdDef: 'Desvío estándar del material de control',
  cv: 'CV %',
  cvDef: 'Coeficiente de variación = DE / media × 100',
  chartTitle: 'Gráfico de Levey-Jennings en unidades z (todas las corridas)',
  runs: 'Últimas 10 corridas',
  run: 'Corrida',
  date: 'Fecha (UTC)',
  rules: 'Reglas',
  status: 'Estado',
  corrective: 'Acción correctiva',
  none: '—',
  newRun: 'Registrar una nueva corrida de control',
  correctiveLabel: 'Acción correctiva (obligatoria si la corrida anterior fue rechazada)',
  correctivePlaceholder: 'p. ej. recalibración y cambio de lote de reactivo',
  addRun: 'Evaluar y registrar corrida',
  added: 'Corrida registrada: su estado figura en la tabla.',
  sigmaTitle: 'Métrica Sigma del método',
  tea: 'TEa % (error total admisible)',
  bias: 'Sesgo %',
  cvFromTarget: 'CV % del nivel 1 (según valores objetivo)',
  sigmaResult: 'Sigma',
  sigmaHigh: '≥ 6: clase mundial; alcanza con 1-3s.',
  sigmaMid: '4 a 6: adecuado; usar multirreglas.',
  sigmaLow: '< 4: desempeño pobre; más controles por corrida y revisar el método.',
  export: 'Exportar corridas (CSV)',
  aiTitle: 'Asistente sobre la corrida más reciente',
};
```

`src/lib/i18n/dictionaries/en/qc.ts`:

```ts
import type { qc as esQc } from '../es/qc';

export const qc: typeof esQc = {
  analyte: 'Analyte',
  analytes: { GLU: 'Glucose', CHOL: 'Cholesterol' },
  targets: 'Control material target values',
  level: 'Level',
  mean: 'Mean',
  sd: 'SD',
  sdDef: 'Standard deviation of the control material',
  cv: 'CV %',
  cvDef: 'Coefficient of variation = SD / mean × 100',
  chartTitle: 'Levey-Jennings chart in z units (all runs)',
  runs: 'Last 10 runs',
  run: 'Run',
  date: 'Date (UTC)',
  rules: 'Rules',
  status: 'Status',
  corrective: 'Corrective action',
  none: '—',
  newRun: 'Log a new control run',
  correctiveLabel: 'Corrective action (required if the previous run was rejected)',
  correctivePlaceholder: 'e.g. recalibration and reagent lot change',
  addRun: 'Evaluate and log run',
  added: 'Run logged: its status is shown in the table.',
  sigmaTitle: 'Method Sigma metric',
  tea: 'TEa % (total allowable error)',
  bias: 'Bias %',
  cvFromTarget: 'Level 1 CV % (from target values)',
  sigmaResult: 'Sigma',
  sigmaHigh: '≥ 6: world class; 1-3s is enough.',
  sigmaMid: '4 to 6: adequate; use multirules.',
  sigmaLow: '< 4: poor performance; more controls per run and review the method.',
  export: 'Export runs (CSV)',
  aiTitle: 'Assistant for the latest run',
};
```

Registrar `qc` en `tools` de ambos índices.

- [ ] **Step 2: Gráfico de Levey-Jennings**

`src/components/tools/LeveyJenningsChart.tsx`:

```tsx
'use client';

import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export type LjDatum = { run: string } & Record<string, number | string>;

const COLORS = ['var(--color-accent)', '#7c3aed'];

export function LeveyJenningsChart({ data, levels, title }: { data: LjDatum[]; levels: string[]; title: string }) {
  return (
    <figure className="w-full">
      <figcaption className="mb-2 text-sm font-semibold">{title}</figcaption>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 16, bottom: 4, left: -16 }}>
            <CartesianGrid stroke="var(--color-line)" strokeDasharray="3 3" />
            <XAxis dataKey="run" tick={{ fontSize: 10 }} stroke="var(--color-muted)" interval="preserveStartEnd" />
            <YAxis domain={[-4, 4]} ticks={[-3, -2, -1, 0, 1, 2, 3]} tick={{ fontSize: 10 }} stroke="var(--color-muted)" />
            <ReferenceLine y={3} stroke="var(--color-danger)" strokeDasharray="4 2" />
            <ReferenceLine y={-3} stroke="var(--color-danger)" strokeDasharray="4 2" />
            <ReferenceLine y={2} stroke="var(--color-warn)" strokeDasharray="4 2" />
            <ReferenceLine y={-2} stroke="var(--color-warn)" strokeDasharray="4 2" />
            <ReferenceLine y={1} stroke="var(--color-line)" />
            <ReferenceLine y={-1} stroke="var(--color-line)" />
            <ReferenceLine y={0} stroke="var(--color-muted)" />
            <Tooltip formatter={(v) => (typeof v === 'number' ? v.toFixed(2) : String(v))} />
            <Legend />
            {levels.map((level, i) => (
              <Line
                key={level}
                type="linear"
                dataKey={level}
                stroke={COLORS[i % COLORS.length]}
                dot={{ r: 3 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
```

- [ ] **Step 3: Herramienta**

`src/components/tools/QcTool.tsx`:

```tsx
'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { formatLabError, useLab } from '@/components/lab/LabStoreProvider';
import { runTone, StatusChip } from '@/components/lab/StatusChip';
import { Term } from '@/components/module/Term';
import { btnPrimary, btnSecondary, card, input, label, table, tableWrap } from '@/components/ui/styles';
import { downloadText, toCsv } from '@/lib/export/csv';
import { addQcRun } from '@/lib/lims/actions';
import { analytesOf, runsFor, targetsFor, violationsFor } from '@/lib/lims/qc';
import { runStatus, sigmaMetric, zScore } from '@/lib/science/westgard';
import { LeveyJenningsChart, type LjDatum } from './LeveyJenningsChart';
import type { ToolProps } from './registry';

export function QcTool({ dict }: ToolProps) {
  const t = dict.tools.qc;
  const { state, run } = useLab();
  const [analyte, setAnalyte] = useState('GLU');
  const [values, setValues] = useState<Record<string, string>>({});
  const [corrective, setCorrective] = useState('');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [tea, setTea] = useState('10');
  const [bias, setBias] = useState('1');

  const view = useMemo(() => {
    if (!state) return null;
    const targets = targetsFor(state, analyte);
    const runs = runsFor(state, analyte);
    const violations = violationsFor(state, analyte);
    const chart: LjDatum[] = runs.map((r) => {
      const d: LjDatum = { run: r.id.slice(analyte.length + 1) };
      for (const p of r.points) {
        const target = targets.find((x) => x.level === p.level);
        if (target) d[p.level] = Math.max(-4, Math.min(4, zScore(p.value, target)));
      }
      return d;
    });
    const rows = runs
      .slice(-10)
      .reverse()
      .map((r) => ({
        run: r,
        status: runStatus(violations, r.id),
        rules: [...new Set(violations.filter((v) => v.runId === r.id).map((v) => v.rule))],
      }));
    return { analytes: analytesOf(state), targets, runs, chart, rows };
  }, [state, analyte]);

  if (!state || !view) return <p className="text-muted">{dict.demoBar.loading}</p>;

  const first = view.targets[0];
  const cvTarget = first ? (first.sd / first.mean) * 100 : null;
  const teaN = Number(tea.replace(',', '.'));
  const biasN = Number(bias.replace(',', '.'));
  const sigma = cvTarget && Number.isFinite(teaN) && Number.isFinite(biasN) ? sigmaMetric(teaN, biasN, cvTarget) : null;
  const sigmaText = sigma === null ? '' : sigma >= 6 ? t.sigmaHigh : sigma >= 4 ? t.sigmaMid : t.sigmaLow;

  async function onAddRun(e: FormEvent) {
    e.preventDefault();
    if (!view) return;
    const points = view.targets.map((tg) => {
      const raw = (values[tg.level] ?? '').trim().replace(',', '.');
      return { level: tg.level, value: raw === '' ? Number.NaN : Number(raw) };
    });
    const res = await run((s, u, at) => addQcRun(s, { analyte, points, correctiveAction: corrective }, u, at));
    if (res.ok) {
      setValues({});
      setCorrective('');
      setMessage({ ok: true, text: t.added });
    } else {
      setMessage({ ok: false, text: formatLabError(dict, res.error) });
    }
  }

  function exportRuns() {
    if (!view) return;
    const headers = ['run', 'date', ...view.targets.map((tg) => tg.level), 'status', 'corrective_action'];
    const violations = violationsFor(state!, analyte);
    const rows = view.runs.map((r) => [
      r.id,
      r.at,
      ...view.targets.map((tg) => r.points.find((p) => p.level === tg.level)?.value ?? null),
      runStatus(violations, r.id),
      r.correctiveAction ?? '',
    ]);
    downloadText(`qc-${analyte}.csv`, toCsv(headers, rows));
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className={`${card} space-y-4`}>
          <label className={label}>
            {t.analyte}
            <select
              data-testid="qc-analyte"
              className={`${input} mt-1`}
              value={analyte}
              onChange={(e) => {
                setAnalyte(e.target.value);
                setValues({});
                setMessage(null);
              }}
            >
              {view.analytes.map((a) => (
                <option key={a} value={a}>
                  {t.analytes[a] ?? a} ({a})
                </option>
              ))}
            </select>
          </label>
          <div>
            <h2 className="text-sm font-semibold">{t.targets}</h2>
            <div className={tableWrap}>
              <table className={`${table} mt-1`}>
                <thead>
                  <tr>
                    <th>{t.level}</th>
                    <th>{t.mean}</th>
                    <th>
                      <Term definition={t.sdDef}>{t.sd}</Term>
                    </th>
                    <th>
                      <Term definition={t.cvDef}>{t.cv}</Term>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {view.targets.map((tg) => (
                    <tr key={tg.level}>
                      <td>{tg.level}</td>
                      <td className="font-mono">{tg.mean}</td>
                      <td className="font-mono">{tg.sd}</td>
                      <td className="font-mono">{((tg.sd / tg.mean) * 100).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className={card}>
          <LeveyJenningsChart data={view.chart} levels={view.targets.map((tg) => tg.level)} title={t.chartTitle} />
        </div>
      </div>

      <div className={card}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">{t.runs}</h2>
          <button type="button" className={btnSecondary} onClick={exportRuns}>
            {t.export}
          </button>
        </div>
        <div className={`${tableWrap} mt-2`}>
          <table className={table}>
            <thead>
              <tr>
                <th>{t.run}</th>
                <th>{t.date}</th>
                {view.targets.map((tg) => (
                  <th key={tg.level}>{tg.level} (z)</th>
                ))}
                <th>{t.rules}</th>
                <th>{t.status}</th>
                <th>{t.corrective}</th>
              </tr>
            </thead>
            <tbody>
              {view.rows.map(({ run: r, status, rules }) => (
                <tr key={r.id}>
                  <td className="font-mono">{r.id}</td>
                  <td className="font-mono text-xs">{r.at.replace('T', ' ')}</td>
                  {view.targets.map((tg) => {
                    const p = r.points.find((x) => x.level === tg.level);
                    return (
                      <td key={tg.level} className="font-mono">
                        {p ? `${p.value} (${zScore(p.value, tg).toFixed(2)})` : t.none}
                      </td>
                    );
                  })}
                  <td className="font-mono">{rules.join(', ') || t.none}</td>
                  <td>
                    <StatusChip tone={runTone(status)} testId={`run-status-${r.id}`}>
                      {dict.runStatus[status]}
                    </StatusChip>
                  </td>
                  <td className="text-xs">{r.correctiveAction ?? t.none}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={onAddRun} className={`${card} space-y-3`}>
          <h2 className="font-semibold">{t.newRun}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {view.targets.map((tg) => (
              <label key={tg.level} className={label}>
                {t.level} {tg.level} ({t.mean} {tg.mean})
                <input
                  data-testid={`new-run-${tg.level}`}
                  inputMode="decimal"
                  className={`${input} mt-1`}
                  value={values[tg.level] ?? ''}
                  onChange={(e) => setValues({ ...values, [tg.level]: e.target.value })}
                  required
                />
              </label>
            ))}
          </div>
          <label className={label}>
            {t.correctiveLabel}
            <textarea
              data-testid="corrective-action"
              className={`${input} mt-1`}
              rows={2}
              placeholder={t.correctivePlaceholder}
              value={corrective}
              onChange={(e) => setCorrective(e.target.value)}
            />
          </label>
          <button type="submit" data-testid="add-run" className={btnPrimary}>
            {t.addRun}
          </button>
          {message && (
            <p role="status" data-testid="qc-message" className={`text-sm ${message.ok ? 'text-ok' : 'text-danger'}`}>
              {message.text}
            </p>
          )}
        </form>

        <div className={`${card} space-y-3`}>
          <h2 className="font-semibold">{t.sigmaTitle}</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className={label}>
              {t.tea}
              <input className={`${input} mt-1`} inputMode="decimal" value={tea} onChange={(e) => setTea(e.target.value)} />
            </label>
            <label className={label}>
              {t.bias}
              <input className={`${input} mt-1`} inputMode="decimal" value={bias} onChange={(e) => setBias(e.target.value)} />
            </label>
            <div className="text-sm">
              <p className="font-medium">{t.cvFromTarget}</p>
              <p className="mt-2 font-mono">{cvTarget?.toFixed(2) ?? t.none}</p>
            </div>
          </div>
          {sigma !== null && (
            <p className="text-sm">
              <span className="font-semibold">
                {t.sigmaResult} = {sigma.toFixed(2)}
              </span>{' '}
              — {sigmaText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Registrar y verificar**

En `registry.ts`, agregar `import { QcTool } from './QcTool';` y la entrada `qc: QcTool`.

1. Run: `npx tsc --noEmit && npm run lint`. Esperado: sin errores.
2. Con `npm run dev`, abrir `/es/modulos/qc` y comprobar:
   - El gráfico muestra 21 corridas por nivel.
   - GLU-R021 aparece **Rechazada** con reglas `1-2s, 2-2s`.
3. Registrar una corrida sin acción correctiva (95,5 y 251). Esperado: error «Se requiere un motivo…: GLU-R021».
4. Registrarla con acción correctiva. Esperado: GLU-R022 **Aceptada**.
5. Sigma con TEa 10 y sesgo 1: CV 2,63 → Sigma ≈ 3,42 con el texto de desempeño pobre.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: módulo de control de calidad con Levey-Jennings, Westgard y Sigma

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 24: Herramienta Custodia (muestras, firmas, audit trail)

**Files:**
- Create: `src/lib/i18n/dictionaries/es/custodia.ts`, `src/lib/i18n/dictionaries/en/custodia.ts`, `src/components/lab/SignDialog.tsx`, `src/components/tools/CustodiaTool.tsx`
- Modify: ambos `index.ts` de diccionarios, `src/components/tools/registry.ts`

- [ ] **Step 1: Diccionarios**

`src/lib/i18n/dictionaries/es/custodia.ts`:

```ts
export const custodia = {
  register: 'Registrar muestra manualmente',
  sampleId: 'ID de muestra',
  patientId: 'ID de paciente',
  patientName: 'Paciente',
  matrix: 'Matriz',
  matrices: { suero: 'Suero', plasma: 'Plasma', sangre: 'Sangre entera', orina: 'Orina' } as Record<string, string>,
  registerBtn: 'Registrar',
  registered: 'Muestra registrada.',
  samples: 'Muestras',
  noSamples: 'Todavía no hay muestras: ingresá resultados desde Enlace o registrá una muestra.',
  select: 'Seleccioná una muestra para ver su detalle.',
  status: 'Estado',
  revision: 'Rev.',
  results: 'Resultados',
  test: 'Prueba',
  value: 'Valor',
  flag: 'Marca',
  qcRun: 'Corrida QC',
  noRun: 'sin corrida',
  releaseCheck: 'Verificación previa a la liberación',
  releaseOk: 'Todas las corridas de control asociadas están aceptadas.',
  blockingRuns: 'Corridas rechazadas',
  missingQc: 'Pruebas sin corrida de control',
  signReviewed: 'Firmar: revisado',
  signApproved: 'Firmar: aprobado y liberar',
  rerun: 'Repetir en corrida aceptada',
  rerunReason: 'Motivo de la repetición',
  rerunConfirm: 'Confirmar repetición',
  rerunDone: 'Resultados reasignados a la corrida aceptada: la muestra vuelve a «En análisis» con una nueva revisión.',
  cancel: 'Cancelar',
  timeline: 'Línea de tiempo de la muestra (audit trail)',
  auditAll: 'Audit trail completo',
  chainOk: 'Cadena de auditoría íntegra ({n} registros)',
  chainBroken: 'Cadena alterada en el registro #{seq}',
  exportAudit: 'Exportar audit trail (CSV)',
  qrLabel: 'Etiqueta QR de la muestra',
  alcoaTitle: 'Cómo se cubre ALCOA+ en este módulo',
  alcoa: [
    'Atribuible: cada acción guarda el usuario que la hizo.',
    'Legible: registros en texto claro, exportables a CSV.',
    'Contemporáneo: fecha y hora UTC al momento de la acción.',
    'Original: el valor del equipo se conserva tal cual llegó (valor crudo).',
    'Exacto: los cálculos que deciden son código determinista y testeado.',
    'Completo: el audit trail es solo-agregado; nada se borra.',
    'Consistente: secuencia numerada y encadenada por SHA-256.',
    'Perdurable y disponible: exportación CSV y PDF; en producción, base de datos con respaldo.',
  ],
  signTitle: 'Firma electrónica',
  signMeaningReviewed: 'Declaro que revisé los resultados de esta muestra.',
  signMeaningApproved: 'Apruebo y libero los resultados de esta muestra.',
  password: 'Contraseña (re-autenticación)',
  signConfirm: 'Firmar',
  signed: 'Firma registrada.',
  cols: { seq: '#', at: 'Fecha (UTC)', actor: 'Usuario', action: 'Acción', entity: 'Entidad', reason: 'Motivo', hash: 'Hash' },
};
```

`src/lib/i18n/dictionaries/en/custodia.ts`:

```ts
import type { custodia as esCustodia } from '../es/custodia';

export const custodia: typeof esCustodia = {
  register: 'Register a sample manually',
  sampleId: 'Sample ID',
  patientId: 'Patient ID',
  patientName: 'Patient',
  matrix: 'Matrix',
  matrices: { suero: 'Serum', plasma: 'Plasma', sangre: 'Whole blood', orina: 'Urine' },
  registerBtn: 'Register',
  registered: 'Sample registered.',
  samples: 'Samples',
  noSamples: 'No samples yet: load results from Enlace or register a sample.',
  select: 'Select a sample to see its details.',
  status: 'Status',
  revision: 'Rev.',
  results: 'Results',
  test: 'Test',
  value: 'Value',
  flag: 'Flag',
  qcRun: 'QC run',
  noRun: 'no run',
  releaseCheck: 'Pre-release check',
  releaseOk: 'All linked control runs are accepted.',
  blockingRuns: 'Rejected runs',
  missingQc: 'Tests without a control run',
  signReviewed: 'Sign: reviewed',
  signApproved: 'Sign: approved and release',
  rerun: 'Repeat on accepted run',
  rerunReason: 'Reason for repeating',
  rerunConfirm: 'Confirm repeat',
  rerunDone: 'Results reassigned to the accepted run: the sample goes back to “In analysis” with a new revision.',
  cancel: 'Cancel',
  timeline: 'Sample timeline (audit trail)',
  auditAll: 'Full audit trail',
  chainOk: 'Audit chain intact ({n} records)',
  chainBroken: 'Chain altered at record #{seq}',
  exportAudit: 'Export audit trail (CSV)',
  qrLabel: 'Sample QR label',
  alcoaTitle: 'How this module covers ALCOA+',
  alcoa: [
    'Attributable: every action stores the user who did it.',
    'Legible: plain-text records, exportable to CSV.',
    'Contemporaneous: UTC date and time at the moment of the action.',
    'Original: the instrument value is kept exactly as received (raw value).',
    'Accurate: decision-making calculations are deterministic, tested code.',
    'Complete: the audit trail is append-only; nothing is deleted.',
    'Consistent: numbered sequence chained with SHA-256.',
    'Enduring and available: CSV and PDF export; in production, a backed-up database.',
  ],
  signTitle: 'Electronic signature',
  signMeaningReviewed: 'I declare that I reviewed the results of this sample.',
  signMeaningApproved: 'I approve and release the results of this sample.',
  password: 'Password (re-authentication)',
  signConfirm: 'Sign',
  signed: 'Signature recorded.',
  cols: { seq: '#', at: 'Date (UTC)', actor: 'User', action: 'Action', entity: 'Entity', reason: 'Reason', hash: 'Hash' },
};
```

Registrar `custodia` en `tools` de ambos índices.

- [ ] **Step 2: Diálogo de firma electrónica**

`src/components/lab/SignDialog.tsx`:

```tsx
'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import { signSample } from '@/lib/lims/actions';
import type { SignatureMeaning } from '@/lib/lims/model';
import { btnPrimary, btnSecondary, input, label } from '@/components/ui/styles';
import { formatLabError, useLab } from './LabStoreProvider';

// Se monta con key={meaning}: cada apertura empieza con estado limpio.
export function SignDialog({
  dict,
  sampleId,
  meaning,
  onClose,
}: {
  dict: Dictionary;
  sampleId: string;
  meaning: SignatureMeaning | null;
  onClose: (signed: boolean) => void;
}) {
  const t = dict.tools.custodia;
  const { run, user } = useLab();
  const ref = useRef<HTMLDialogElement>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && meaning && !dialog.open) dialog.showModal();
  }, [meaning]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!meaning) return;
    const res = await run((s, _u, at) => signSample(s, sampleId, meaning, user.id, password, at));
    if (res.ok) onClose(true);
    else setError(formatLabError(dict, res.error));
  }

  return (
    <dialog
      ref={ref}
      onClose={() => onClose(false)}
      aria-label={t.signTitle}
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-xl border border-line bg-surface p-0 text-ink"
    >
      <form onSubmit={submit} className="space-y-3 p-6">
        <h2 className="text-lg font-semibold">{t.signTitle}</h2>
        <p className="text-sm">{meaning === 'approved' ? t.signMeaningApproved : t.signMeaningReviewed}</p>
        <p className="text-xs text-muted">
          {user.name} · {dict.roles[user.role]} · <span className="font-mono">{sampleId}</span>
        </p>
        <label className={label}>
          {t.password}
          <input
            type="password"
            data-testid="sign-password"
            autoComplete="off"
            className={`${input} mt-1`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && (
          <p role="alert" data-testid="sign-error" className="text-sm text-danger">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button type="button" className={btnSecondary} onClick={() => onClose(false)}>
            {t.cancel}
          </button>
          <button type="submit" data-testid="sign-confirm" className={btnPrimary}>
            {t.signConfirm}
          </button>
        </div>
      </form>
    </dialog>
  );
}
```

- [ ] **Step 3: Herramienta Custodia**

`src/components/tools/CustodiaTool.tsx`:

```tsx
'use client';

import QRCode from 'qrcode';
import { useEffect, useState, type FormEvent } from 'react';
import { formatLabError, useLab } from '@/components/lab/LabStoreProvider';
import { SignDialog } from '@/components/lab/SignDialog';
import { runTone, StatusChip, type ChipTone } from '@/components/lab/StatusChip';
import { btnPrimary, btnSecondary, card, input, label, table, tableWrap } from '@/components/ui/styles';
import { downloadText, toCsv } from '@/lib/export/csv';
import { registerSample, rerunSample } from '@/lib/lims/actions';
import { verifyChain } from '@/lib/lims/audit';
import type { SampleStatus, SignatureMeaning } from '@/lib/lims/model';
import { statusOfRun } from '@/lib/lims/qc';
import { checkRelease } from '@/lib/lims/release';
import type { ToolProps } from './registry';

const sampleTone: Record<SampleStatus, ChipTone> = {
  received: 'neutral',
  in_analysis: 'warn',
  reviewed: 'warn',
  released: 'ok',
  rejected: 'danger',
};
const MATRICES = ['suero', 'plasma', 'sangre', 'orina'];
const EMPTY_FORM = { id: '', patientId: '', patientName: '', matrix: 'suero' };

export function CustodiaTool({ dict }: ToolProps) {
  const t = dict.tools.custodia;
  const { state, run } = useLab();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [signing, setSigning] = useState<SignatureMeaning | null>(null);
  const [rerunOpen, setRerunOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [chain, setChain] = useState<{ valid: boolean; text: string } | null>(null);
  const [qr, setQr] = useState<{ id: string; url: string } | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!state) return;
    let cancelled = false;
    verifyChain(state.audit).then((r) => {
      if (cancelled) return;
      setChain(
        r.valid
          ? { valid: true, text: t.chainOk.replace('{n}', String(state.audit.length)) }
          : { valid: false, text: t.chainBroken.replace('{seq}', String(r.brokenAt)) },
      );
    });
    return () => {
      cancelled = true;
    };
  }, [state, t]);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    QRCode.toDataURL(selectedId, { margin: 1, width: 132 })
      .then((url) => {
        if (!cancelled) setQr({ id: selectedId, url });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  if (!state) return <p className="text-muted">{dict.demoBar.loading}</p>;
  const lab = state;
  const sample = lab.samples.find((s) => s.id === selectedId) ?? null;
  const results = sample ? lab.results.filter((r) => r.sampleId === sample.id) : [];
  const release = sample ? checkRelease(lab, sample.id) : null;
  const timeline = sample
    ? lab.audit.filter((e) => e.entityId === sample.id || e.entityId.startsWith(`${sample.id}:`))
    : [];
  const qrUrl = qr && qr.id === selectedId ? qr.url : '';

  async function onRegister(e: FormEvent) {
    e.preventDefault();
    const input = { ...form };
    const res = await run((s, u, at) => registerSample(s, input, u, at));
    if (res.ok) {
      setSelectedId(input.id.trim());
      setForm(EMPTY_FORM);
      setMessage({ ok: true, text: t.registered });
    } else {
      setMessage({ ok: false, text: formatLabError(dict, res.error) });
    }
  }

  async function onRerun() {
    if (!sample) return;
    const id = sample.id;
    const res = await run((s, u, at) => rerunSample(s, id, reason, u, at));
    if (res.ok) {
      setRerunOpen(false);
      setReason('');
      setMessage({ ok: true, text: t.rerunDone });
    } else {
      setMessage({ ok: false, text: formatLabError(dict, res.error) });
    }
  }

  function exportAudit() {
    downloadText(
      'audit-trail.csv',
      toCsv(
        ['seq', 'at_utc', 'actor', 'action', 'entity', 'entity_id', 'reason', 'prev_hash', 'hash'],
        lab.audit.map((e) => [e.seq, e.at, e.actor, e.action, e.entity, e.entityId, e.reason ?? '', e.prevHash, e.hash]),
      ),
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="space-y-6">
          <div className={card}>
            <h2 className="font-semibold">{t.samples}</h2>
            {lab.samples.length === 0 ? (
              <p className="mt-2 text-sm text-muted">{t.noSamples}</p>
            ) : (
              <div className={`${tableWrap} mt-2`}>
                <table className={table}>
                  <thead>
                    <tr>
                      <th>{t.sampleId}</th>
                      <th>{t.patientName}</th>
                      <th>{t.status}</th>
                      <th>{t.revision}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lab.samples.map((s) => (
                      <tr key={s.id} className={s.id === selectedId ? 'bg-accent-soft' : undefined}>
                        <td>
                          <button
                            type="button"
                            data-testid={`sample-${s.id}`}
                            className="font-mono text-accent underline"
                            onClick={() => {
                              setSelectedId(s.id);
                              setMessage(null);
                              setRerunOpen(false);
                            }}
                          >
                            {s.id}
                          </button>
                        </td>
                        <td>{s.patientName}</td>
                        <td>
                          <StatusChip tone={sampleTone[s.status]}>{dict.sampleStatus[s.status]}</StatusChip>
                        </td>
                        <td className="font-mono">{s.revision}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <form onSubmit={onRegister} className={`${card} space-y-3`}>
            <h2 className="font-semibold">{t.register}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={label}>
                {t.sampleId}
                <input className={`${input} mt-1`} value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} required />
              </label>
              <label className={label}>
                {t.patientId}
                <input className={`${input} mt-1`} value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} required />
              </label>
              <label className={label}>
                {t.patientName}
                <input className={`${input} mt-1`} value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} required />
              </label>
              <label className={label}>
                {t.matrix}
                <select className={`${input} mt-1`} value={form.matrix} onChange={(e) => setForm({ ...form, matrix: e.target.value })}>
                  {MATRICES.map((m) => (
                    <option key={m} value={m}>
                      {t.matrices[m]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button type="submit" className={btnSecondary}>
              {t.registerBtn}
            </button>
          </form>
        </div>

        <div className={card}>
          {!sample ? (
            <p className="text-sm text-muted">{t.select}</p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-mono text-lg font-semibold">{sample.id}</h2>
                  <p className="text-sm text-muted">
                    {sample.patientName} ({sample.patientId}) · {t.matrices[sample.matrix] ?? sample.matrix} · {t.revision} {sample.revision}
                  </p>
                  <p className="mt-2">
                    <StatusChip tone={sampleTone[sample.status]} testId="sample-status">
                      {dict.sampleStatus[sample.status]}
                    </StatusChip>
                  </p>
                </div>
                {qrUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- data URL generada en el cliente
                  <img src={qrUrl} alt={`${t.qrLabel}: ${sample.id}`} width={96} height={96} className="rounded border border-line bg-white p-1" />
                )}
              </div>

              <div className={tableWrap}>
                <table className={table}>
                  <thead>
                    <tr>
                      <th>{t.test}</th>
                      <th>{t.value}</th>
                      <th>{t.flag}</th>
                      <th>{t.qcRun}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => {
                      const st = r.runId ? statusOfRun(lab, r.runId) : null;
                      return (
                        <tr key={r.id}>
                          <td className="font-mono">{r.testCode}</td>
                          <td className="font-mono">
                            {r.rawValue} {r.units}
                          </td>
                          <td>{r.flag}</td>
                          <td>
                            <span className="font-mono text-xs">{r.runId || t.noRun}</span>{' '}
                            {st && <StatusChip tone={runTone(st)}>{dict.runStatus[st]}</StatusChip>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {release && (
                <div data-testid="release-check" className={`rounded-lg border p-3 text-sm ${release.ok ? 'border-ok/40 bg-ok/10' : 'border-danger/40 bg-danger/10'}`}>
                  <p className="font-semibold">{t.releaseCheck}</p>
                  {release.ok ? (
                    <p>{t.releaseOk}</p>
                  ) : (
                    <ul className="list-disc pl-5">
                      {release.blockingRuns.length > 0 && (
                        <li>
                          {t.blockingRuns}: <span className="font-mono">{release.blockingRuns.join(', ')}</span>
                        </li>
                      )}
                      {release.missingQc.length > 0 && (
                        <li>
                          {t.missingQc}: <span className="font-mono">{release.missingQc.join(', ')}</span>
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button type="button" data-testid="sign-reviewed" className={btnSecondary} onClick={() => setSigning('reviewed')}>
                  {t.signReviewed}
                </button>
                <button type="button" data-testid="sign-approved" className={btnPrimary} onClick={() => setSigning('approved')}>
                  {t.signApproved}
                </button>
                <button type="button" data-testid="rerun-sample" className={btnSecondary} onClick={() => setRerunOpen(true)}>
                  {t.rerun}
                </button>
              </div>

              {rerunOpen && (
                <div className="flex flex-wrap items-end gap-2">
                  <label className={`${label} grow`}>
                    {t.rerunReason}
                    <input data-testid="rerun-reason" className={`${input} mt-1`} value={reason} onChange={(e) => setReason(e.target.value)} />
                  </label>
                  <button type="button" data-testid="rerun-confirm" className={btnPrimary} onClick={onRerun}>
                    {t.rerunConfirm}
                  </button>
                  <button type="button" className={btnSecondary} onClick={() => setRerunOpen(false)}>
                    {t.cancel}
                  </button>
                </div>
              )}

              {message && (
                <p role="status" data-testid="custodia-message" className={`text-sm ${message.ok ? 'text-ok' : 'text-danger'}`}>
                  {message.text}
                </p>
              )}

              <section>
                <h3 className="text-sm font-semibold">{t.timeline}</h3>
                <ol className="mt-2 space-y-1 border-l border-line pl-4 text-xs">
                  {timeline.map((e) => (
                    <li key={e.seq}>
                      <span className="font-mono text-muted">
                        #{e.seq} · {e.at.replace('T', ' ')}
                      </span>{' '}
                      <span className="font-semibold">{e.action}</span> · {e.actor}
                      {e.reason ? ` · «${e.reason}»` : ''}
                    </li>
                  ))}
                </ol>
              </section>

              <SignDialog
                key={signing ?? 'closed'}
                dict={dict}
                sampleId={sample.id}
                meaning={signing}
                onClose={(signed) => {
                  setSigning(null);
                  if (signed) setMessage({ ok: true, text: t.signed });
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div className={`${card} space-y-3`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          {chain && (
            <StatusChip tone={chain.valid ? 'ok' : 'danger'} testId="audit-chain-status">
              {chain.text}
            </StatusChip>
          )}
          <button type="button" className={btnSecondary} onClick={exportAudit}>
            {t.exportAudit}
          </button>
        </div>
        <details>
          <summary className="cursor-pointer text-sm font-semibold">{t.auditAll}</summary>
          <div className={`${tableWrap} mt-2`}>
            <table className={`${table} text-xs`}>
              <thead>
                <tr>
                  <th>{t.cols.seq}</th>
                  <th>{t.cols.at}</th>
                  <th>{t.cols.actor}</th>
                  <th>{t.cols.action}</th>
                  <th>{t.cols.entity}</th>
                  <th>{t.cols.reason}</th>
                  <th>{t.cols.hash}</th>
                </tr>
              </thead>
              <tbody>
                {[...lab.audit].reverse().map((e) => (
                  <tr key={e.seq}>
                    <td className="font-mono">{e.seq}</td>
                    <td className="font-mono">{e.at.replace('T', ' ')}</td>
                    <td>{e.actor}</td>
                    <td className="font-mono">{e.action}</td>
                    <td className="font-mono">{e.entityId}</td>
                    <td>{e.reason ?? ''}</td>
                    <td className="font-mono" title={e.hash}>
                      {e.hash.slice(0, 12)}…
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
        <section>
          <h3 className="text-sm font-semibold">{t.alcoaTitle}</h3>
          <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
            {t.alcoa.map((item) => (
              <li key={item}>✔ {item}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Registrar y verificar**

En `registry.ts`, agregar `import { CustodiaTool } from './CustodiaTool';` y la entrada `custodia: CustodiaTool`.

1. Run: `npx tsc --noEmit && npm run lint`. Esperado: sin errores.
2. En `npm run dev`, abrir la barra de demo y presionar «Reiniciar datos».
3. Ir a Enlace → ASTM → Interpretar → Ingresar.
4. En `/es/modulos/custodia`, recorrer:
   - M-2026-0101 → «Firmar: revisado» con `analista123` → estado **Revisada**.
   - Cambiar a L. Herrera → «Firmar: aprobado» con `validador123` → error «Liberación bloqueada…: GLU-R021».
   - Registrar en QC la corrida GLU-R022 con su acción correctiva.
   - En Custodia: «Repetir» con un motivo → rev. 2.
   - Revisar como M. Gómez y aprobar como L. Herrera → **Liberada**.
   - El chip de cadena dice «íntegra».

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: módulo Custodia con estados, firma electrónica, QR y audit trail verificable

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 25: Informe en PDF

**Files:**
- Create: `src/lib/lims/report.ts`, `src/lib/lims/report.test.ts`, `src/lib/i18n/dictionaries/es/informe.ts`, `src/lib/i18n/dictionaries/en/informe.ts`, `src/components/tools/ReportDocument.tsx`, `src/components/tools/InformeTool.tsx`
- Modify: ambos `index.ts` de diccionarios, `src/components/tools/registry.ts`

- [ ] **Step 1: Test que falla (datos del informe)**

`src/lib/lims/report.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { parseAstm } from '@/lib/lis/astm';
import { ASTM_EXAMPLE } from '@/lib/lis/examples';
import { addQcRun, importResults, rerunSample, signSample } from './actions';
import { buildReportData } from './report';
import { buildSeedState } from './seed';
import { findUser } from './users';

const analyst = findUser('u-analista')!;
const validator = findUser('u-validador')!;
const AT = '2026-09-29T09:00:00';
const ID = 'M-2026-0101';

describe('informe', () => {
  it('[INF-URS-01] solo se genera para muestras liberadas, con firmas de la revisión vigente y estado QC', async () => {
    let s = await importResults(await buildSeedState(), parseAstm(ASTM_EXAMPLE).results, 'astm', analyst, AT);
    expect(() => buildReportData(s, ID, AT)).toThrow();
    s = await addQcRun(s, { analyte: 'GLU', points: [{ level: 'N1', value: 95.5 }, { level: 'N2', value: 251 }], correctiveAction: 'Recalibración' }, analyst, AT);
    s = await rerunSample(s, ID, 'Repetición', analyst, AT);
    s = await signSample(s, ID, 'reviewed', analyst.id, analyst.password, AT);
    s = await signSample(s, ID, 'approved', validator.id, validator.password, AT);
    const data = buildReportData(s, ID, AT);
    expect(data.revision).toBe(2);
    expect(data.results.map((r) => [r.testCode, r.runId, r.runStatus])).toEqual([
      ['GLU', 'GLU-R022', 'accept'],
      ['CHOL', 'CHOL-R021', 'accept'],
    ]);
    expect(data.signatures.map((g) => g.meaning)).toEqual(['reviewed', 'approved']);
    expect(data.recordHash).toMatch(/^[0-9a-f]{64}$/);
    expect(data.auditHead).toBe(s.audit.at(-1)?.hash);
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `npx vitest run src/lib/lims/report.test.ts`
Esperado: FAIL.

- [ ] **Step 3: Implementación de los datos del informe**

`src/lib/lims/report.ts`:

```ts
import type { RunStatus } from '@/lib/science/westgard';
import { LabError, type LabState, type Signature } from './model';
import { statusOfRun } from './qc';

export interface ReportData {
  sampleId: string;
  patientId: string;
  patientName: string;
  matrix: string;
  revision: number;
  receivedAt: string;
  results: {
    testCode: string;
    loinc: string | null;
    rawValue: string;
    units: string;
    referenceRange: string;
    flag: string;
    runId: string;
    runStatus: RunStatus | null;
  }[];
  signatures: Signature[];
  recordHash: string;
  auditHead: string;
  generatedAt: string;
}

export function buildReportData(state: LabState, sampleId: string, generatedAt: string): ReportData {
  const sample = state.samples.find((s) => s.id === sampleId);
  if (!sample || sample.status !== 'released') throw new LabError('invalid_transition', [sampleId]);
  const signatures = state.signatures.filter((g) => g.sampleId === sampleId && g.revision === sample.revision);
  return {
    sampleId,
    patientId: sample.patientId,
    patientName: sample.patientName,
    matrix: sample.matrix,
    revision: sample.revision,
    receivedAt: sample.receivedAt,
    results: state.results
      .filter((r) => r.sampleId === sampleId)
      .map((r) => ({
        testCode: r.testCode,
        loinc: r.loinc,
        rawValue: r.rawValue,
        units: r.units,
        referenceRange: r.referenceRange,
        flag: r.flag,
        runId: r.runId,
        runStatus: r.runId ? statusOfRun(state, r.runId) : null,
      })),
    signatures,
    recordHash: signatures.find((g) => g.meaning === 'approved')?.recordHash ?? '',
    auditHead: state.audit[state.audit.length - 1]?.hash ?? '',
    generatedAt,
  };
}
```

Run: `npx vitest run src/lib/lims/report.test.ts`
Esperado: `1 passed`.

- [ ] **Step 4: Diccionarios**

`src/lib/i18n/dictionaries/es/informe.ts`:

```ts
export const informe = {
  released: 'Muestras liberadas: informe listo',
  pending: 'Pendientes de liberación',
  download: 'Descargar informe PDF',
  generating: 'Generando…',
  error: 'No se pudo generar el PDF. Probá de nuevo.',
  none: 'Todavía no hay muestras liberadas. Completá el flujo Enlace → Control de calidad → Custodia.',
  pdf: {
    heading: 'Informe de resultados',
    demo: 'DOCUMENTO DE DEMOSTRACIÓN · NO VÁLIDO PARA USO CLÍNICO',
    sample: 'Muestra',
    revision: 'rev.',
    patient: 'Paciente',
    matrix: 'Matriz',
    test: 'Prueba',
    loinc: 'LOINC',
    value: 'Resultado',
    units: 'Unidades',
    range: 'Rango ref.',
    flag: 'Marca',
    qc: 'Control de calidad',
    noQc: 'sin corrida',
    signatures: 'Firmas electrónicas',
    meaning: { reviewed: 'Revisado', approved: 'Aprobado y liberado' },
    roles: { analyst: 'Analista', validator: 'Validador/a', admin: 'Administrador' },
    runStatus: { accept: 'aceptada', warning: 'advertencia', reject: 'rechazada' },
    recordHash: 'Hash SHA-256 del registro firmado',
    auditHead: 'Último hash del audit trail',
    generated: 'Generado',
    author: 'Veritas Lab Suite · diseñado y desarrollado por Andrés Nahuel Páez',
  },
};
```

`src/lib/i18n/dictionaries/en/informe.ts`:

```ts
import type { informe as esInforme } from '../es/informe';

export const informe: typeof esInforme = {
  released: 'Released samples: report ready',
  pending: 'Pending release',
  download: 'Download PDF report',
  generating: 'Generating…',
  error: 'The PDF could not be generated. Please try again.',
  none: 'No released samples yet. Complete the flow Enlace → Quality control → Custodia.',
  pdf: {
    heading: 'Results report',
    demo: 'DEMONSTRATION DOCUMENT · NOT VALID FOR CLINICAL USE',
    sample: 'Sample',
    revision: 'rev.',
    patient: 'Patient',
    matrix: 'Matrix',
    test: 'Test',
    loinc: 'LOINC',
    value: 'Result',
    units: 'Units',
    range: 'Ref. range',
    flag: 'Flag',
    qc: 'Quality control',
    noQc: 'no run',
    signatures: 'Electronic signatures',
    meaning: { reviewed: 'Reviewed', approved: 'Approved and released' },
    roles: { analyst: 'Analyst', validator: 'Approver', admin: 'Administrator' },
    runStatus: { accept: 'accepted', warning: 'warning', reject: 'rejected' },
    recordHash: 'SHA-256 hash of the signed record',
    auditHead: 'Latest audit-trail hash',
    generated: 'Generated',
    author: 'Veritas Lab Suite · designed and built by Andrés Nahuel Páez',
  },
};
```

Registrar `informe` en `tools` de ambos índices.

- [ ] **Step 5: Documento PDF**

`src/components/tools/ReportDocument.tsx`:

```tsx
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import type { ReportData } from '@/lib/lims/report';

type Labels = Dictionary['tools']['informe']['pdf'];

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 9, fontFamily: 'Helvetica', color: '#0f1b24' },
  banner: { backgroundColor: '#fef3c7', color: '#92400e', padding: 6, marginBottom: 10, fontSize: 8, textAlign: 'center' },
  h1: { fontSize: 15, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  sub: { color: '#5b6b76', marginBottom: 12 },
  h2: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginTop: 12, marginBottom: 4 },
  row: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#dde4e8', paddingVertical: 3 },
  head: { fontFamily: 'Helvetica-Bold' },
  cell: { flex: 1, paddingRight: 4 },
  wide: { flex: 2, paddingRight: 4 },
  mono: { fontFamily: 'Courier', fontSize: 7 },
  footer: { position: 'absolute', bottom: 24, left: 36, right: 36, fontSize: 7, color: '#5b6b76', textAlign: 'center' },
});

export function ReportDocument({ data, labels }: { data: ReportData; labels: Labels }) {
  return (
    <Document title={`${labels.heading} ${data.sampleId}`} author="Andrés Nahuel Páez">
      <Page size="A4" style={styles.page}>
        <Text style={styles.banner}>{labels.demo}</Text>
        <Text style={styles.h1}>Veritas Lab Suite · {labels.heading}</Text>
        <Text style={styles.sub}>
          {labels.sample}: {data.sampleId} ({labels.revision} {data.revision}) · {labels.patient}: {data.patientName} ({data.patientId}) ·{' '}
          {labels.matrix}: {data.matrix}
        </Text>

        <View style={[styles.row, styles.head]}>
          <Text style={styles.cell}>{labels.test}</Text>
          <Text style={styles.cell}>{labels.loinc}</Text>
          <Text style={styles.cell}>{labels.value}</Text>
          <Text style={styles.cell}>{labels.units}</Text>
          <Text style={styles.cell}>{labels.range}</Text>
          <Text style={styles.cell}>{labels.flag}</Text>
          <Text style={styles.wide}>{labels.qc}</Text>
        </View>
        {data.results.map((r) => (
          <View key={r.testCode} style={styles.row}>
            <Text style={styles.cell}>{r.testCode}</Text>
            <Text style={styles.cell}>{r.loinc ?? '—'}</Text>
            <Text style={styles.cell}>{r.rawValue}</Text>
            <Text style={styles.cell}>{r.units}</Text>
            <Text style={styles.cell}>{r.referenceRange}</Text>
            <Text style={styles.cell}>{r.flag}</Text>
            <Text style={styles.wide}>
              {r.runId || labels.noQc}
              {r.runStatus ? ` · ${labels.runStatus[r.runStatus]}` : ''}
            </Text>
          </View>
        ))}

        <Text style={styles.h2}>{labels.signatures}</Text>
        {data.signatures.map((g) => (
          <Text key={`${g.meaning}-${g.userId}`}>
            {labels.meaning[g.meaning]} · {g.userName} ({labels.roles[g.role]}) · {g.at.replace('T', ' ')} UTC
          </Text>
        ))}

        <Text style={styles.h2}>{labels.recordHash}</Text>
        <Text style={styles.mono}>{data.recordHash}</Text>
        <Text style={styles.h2}>{labels.auditHead}</Text>
        <Text style={styles.mono}>{data.auditHead}</Text>

        <Text style={styles.footer} fixed>
          {labels.generated}: {data.generatedAt.replace('T', ' ')} UTC · {labels.author}
        </Text>
      </Page>
    </Document>
  );
}
```

- [ ] **Step 6: Herramienta Informe**

`src/components/tools/InformeTool.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { nowIso, useLab } from '@/components/lab/LabStoreProvider';
import { StatusChip } from '@/components/lab/StatusChip';
import { btnPrimary, card } from '@/components/ui/styles';
import { downloadBlob } from '@/lib/export/csv';
import { buildReportData } from '@/lib/lims/report';
import type { ToolProps } from './registry';

export function InformeTool({ dict }: ToolProps) {
  const t = dict.tools.informe;
  const { state } = useLab();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  if (!state) return <p className="text-muted">{dict.demoBar.loading}</p>;
  const lab = state;
  const released = lab.samples.filter((s) => s.status === 'released');
  const pending = lab.samples.filter((s) => s.status !== 'released');

  async function download(sampleId: string) {
    setBusy(sampleId);
    setError('');
    try {
      const [{ pdf }, { ReportDocument }] = await Promise.all([import('@react-pdf/renderer'), import('./ReportDocument')]);
      const data = buildReportData(lab, sampleId, nowIso());
      const blob = await pdf(<ReportDocument data={data} labels={t.pdf} />).toBlob();
      downloadBlob(`informe-${sampleId}.pdf`, blob);
    } catch {
      setError(t.error);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className={card}>
        <h2 className="font-semibold">{t.released}</h2>
        {released.length === 0 ? (
          <p className="mt-2 text-sm text-muted">{t.none}</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {released.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  <span className="font-mono">{s.id}</span> · {s.patientName}
                </span>
                <button
                  type="button"
                  data-testid={`download-report-${s.id}`}
                  className={btnPrimary}
                  disabled={busy !== null}
                  onClick={() => download(s.id)}
                >
                  {busy === s.id ? t.generating : t.download}
                </button>
              </li>
            ))}
          </ul>
        )}
        {error && (
          <p role="alert" className="mt-3 text-sm text-danger">
            {error}
          </p>
        )}
      </div>
      <div className={card}>
        <h2 className="font-semibold">{t.pending}</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {pending.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-2">
              <span className="font-mono">{s.id}</span>
              <StatusChip tone="neutral">{dict.sampleStatus[s.status]}</StatusChip>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Registrar y verificar**

En `registry.ts`, agregar `import { InformeTool } from './InformeTool';` y la entrada `informe: InformeTool`.

1. Run: `npx tsc --noEmit && npm run lint && npm run build:next`. Esperado: compila.
2. Con la muestra liberada de T24, en `/es/modulos/informe` presionar «Descargar informe PDF». Esperado: se descarga `informe-M-2026-0101.pdf`, que muestra el banner de demostración, 2 resultados con corridas aceptadas, 2 firmas y los hashes.

Si el build falla al empaquetar `@react-pdf/renderer` con Turbopack, agregar a `next.config.ts` `transpilePackages: ['@react-pdf/renderer']`. Si aun así falla, usar `next build --webpack` en los scripts `build` y `build:next`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: informe PDF con firmas, estado QC y hashes de integridad

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 26: Herramienta Curva (calibración)

**Files:**
- Create: `src/lib/i18n/dictionaries/es/curva.ts`, `src/lib/i18n/dictionaries/en/curva.ts`, `src/components/tools/CurvaTool.tsx`
- Modify: ambos `index.ts`, `registry.ts`

- [ ] **Step 1: Diccionarios**

`src/lib/i18n/dictionaries/es/curva.ts`:

```ts
export const curva = {
  data: 'Estándares: concentración x y señal y, un par por línea (separados por coma, espacio o punto y coma; decimales con punto)',
  weighting: 'Ponderación',
  weights: { none: 'Sin ponderar', '1/x': '1/x', '1/x2': '1/x²' },
  slope: 'Pendiente (b)',
  intercept: 'Ordenada (a)',
  r2: 'R²',
  syx: 's y/x',
  lod: 'LOD (3,3·s/b)',
  loq: 'LOQ (10·s/b)',
  chart: 'Curva de calibración',
  residuals: 'Residuos (y − ŷ)',
  inverse: 'Concentración de una muestra desconocida',
  y0: 'Señal medida (y₀)',
  replicates: 'Réplicas (m)',
  x0: 'Concentración estimada (x₀)',
  sx0: 's x₀',
  ci: 'IC 95 %',
  ciWeighted: 'El IC por predicción inversa se informa solo para regresión sin ponderar.',
  lodWeighted: 'solo sin ponderar',
  outOfRange: 'Fuera del rango calibrado: no extrapolar.',
  parseError: 'Revisá los datos: cada línea debe tener dos números y se necesitan al menos 3 puntos con x distintos (x > 0 si se pondera).',
  export: 'Exportar datos y residuos (CSV)',
  points: 'Puntos',
  fit: 'Recta ajustada',
};
```

`src/lib/i18n/dictionaries/en/curva.ts`:

```ts
import type { curva as esCurva } from '../es/curva';

export const curva: typeof esCurva = {
  data: 'Standards: concentration x and signal y, one pair per line (separated by comma, space or semicolon; decimal point)',
  weighting: 'Weighting',
  weights: { none: 'Unweighted', '1/x': '1/x', '1/x2': '1/x²' },
  slope: 'Slope (b)',
  intercept: 'Intercept (a)',
  r2: 'R²',
  syx: 's y/x',
  lod: 'LOD (3.3·s/b)',
  loq: 'LOQ (10·s/b)',
  chart: 'Calibration curve',
  residuals: 'Residuals (y − ŷ)',
  inverse: 'Concentration of an unknown sample',
  y0: 'Measured signal (y₀)',
  replicates: 'Replicates (m)',
  x0: 'Estimated concentration (x₀)',
  sx0: 's x₀',
  ci: '95 % CI',
  ciWeighted: 'The inverse-prediction CI is reported for unweighted regression only.',
  lodWeighted: 'unweighted only',
  outOfRange: 'Outside the calibrated range: do not extrapolate.',
  parseError: 'Check the data: each line needs two numbers, with at least 3 points and distinct x values (x > 0 when weighting).',
  export: 'Export data and residuals (CSV)',
  points: 'Points',
  fit: 'Fitted line',
};
```

Registrar `curva` en ambos índices.

- [ ] **Step 2: Componente**

`src/components/tools/CurvaTool.tsx`:

```tsx
'use client';

import { useMemo, useState } from 'react';
import { CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts';
import { btnSecondary, card, input, label } from '@/components/ui/styles';
import { downloadText, toCsv } from '@/lib/export/csv';
import { detectionLimits, fitCalibration, inversePredict, type Weighting } from '@/lib/science/calibration';
import type { ToolProps } from './registry';

// Ejemplo sintético: absorbancia vs concentración (mg/L)
const DEFAULT_DATA = '0, 0.002\n2, 0.101\n4, 0.198\n6, 0.304\n8, 0.399\n10, 0.502';

function parsePairs(text: string): { x: number[]; y: number[] } | null {
  const x: number[] = [];
  const y: number[] = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.split(/[\s,;]+/).map(Number);
    if (parts.length !== 2 || !parts.every(Number.isFinite)) return null;
    x.push(parts[0]);
    y.push(parts[1]);
  }
  return x.length > 0 ? { x, y } : null;
}

const fmt = (v: number) => (Math.abs(v) >= 1000 || (Math.abs(v) < 0.001 && v !== 0) ? v.toExponential(3) : v.toPrecision(5));

export function CurvaTool({ dict }: ToolProps) {
  const t = dict.tools.curva;
  const [text, setText] = useState(DEFAULT_DATA);
  const [weighting, setWeighting] = useState<Weighting>('none');
  const [y0, setY0] = useState('0.25');
  const [replicates, setReplicates] = useState('1');

  const result = useMemo(() => {
    const pairs = parsePairs(text);
    if (!pairs) return null;
    try {
      const fit = fitCalibration(pairs.x, pairs.y, weighting);
      return { fit, limits: detectionLimits(fit) }; // limits = null en regresión ponderada
    } catch {
      return null;
    }
  }, [text, weighting]);

  const y0n = Number(y0);
  const m = Number(replicates);
  const prediction =
    result && Number.isFinite(y0n) && Number.isInteger(m) && m >= 1 ? inversePredict(result.fit, y0n, m) : null;

  const chartData = result
    ? result.fit.x.map((x, i) => ({ x, y: result.fit.y[i], fit: result.fit.fitted[i], r: result.fit.residuals[i] })).sort((a, b) => a.x - b.x)
    : [];

  function exportCsv() {
    if (!result) return;
    downloadText(
      'calibracion.csv',
      toCsv(['x', 'y', 'y_ajustada', 'residuo'], chartData.map((d) => [d.x, d.y, d.fit, d.r])),
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className={`${card} space-y-3`}>
          <label className={label}>
            {t.data}
            <textarea
              data-testid="curva-data"
              className={`${input} mt-1 font-mono`}
              rows={9}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </label>
          <label className={label}>
            {t.weighting}
            <select className={`${input} mt-1`} value={weighting} onChange={(e) => setWeighting(e.target.value as Weighting)}>
              {(Object.keys(t.weights) as Weighting[]).map((w) => (
                <option key={w} value={w}>
                  {t.weights[w]}
                </option>
              ))}
            </select>
          </label>
          {!result && (
            <p role="alert" className="text-sm text-danger">
              {t.parseError}
            </p>
          )}
          {result && (
            <dl className="grid grid-cols-2 gap-2 text-sm" data-testid="curva-results">
              {[
                [t.slope, `${fmt(result.fit.slope)} ± ${fmt(result.fit.seSlope)}`],
                [t.intercept, `${fmt(result.fit.intercept)} ± ${fmt(result.fit.seIntercept)}`],
                [t.r2, result.fit.r2.toFixed(6)],
                [t.syx, fmt(result.fit.syx)],
                [t.lod, result.limits ? fmt(result.limits.lod) : t.lodWeighted],
                [t.loq, result.limits ? fmt(result.limits.loq) : t.lodWeighted],
              ].map(([k, v]) => (
                <div key={k} className="rounded-md border border-line p-2">
                  <dt className="text-xs text-muted">{k}</dt>
                  <dd className="font-mono">{v}</dd>
                </div>
              ))}
            </dl>
          )}
          <button type="button" className={btnSecondary} onClick={exportCsv} disabled={!result}>
            {t.export}
          </button>
        </div>

        <div className={`${card} space-y-4`}>
          <figure>
            <figcaption className="mb-2 text-sm font-semibold">{t.chart}</figcaption>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 8, right: 16, bottom: 4, left: -8 }}>
                  <CartesianGrid stroke="var(--color-line)" strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="x" tick={{ fontSize: 10 }} stroke="var(--color-muted)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="var(--color-muted)" />
                  <Tooltip />
                  <Line dataKey="fit" name={t.fit} stroke="var(--color-accent)" dot={false} isAnimationActive={false} />
                  <Scatter dataKey="y" name={t.points} fill="var(--color-ink)" isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </figure>
          <figure>
            <figcaption className="mb-2 text-sm font-semibold">{t.residuals}</figcaption>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 8, right: 16, bottom: 4, left: -8 }}>
                  <CartesianGrid stroke="var(--color-line)" strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="x" tick={{ fontSize: 10 }} stroke="var(--color-muted)" />
                  <YAxis type="number" dataKey="r" tick={{ fontSize: 10 }} stroke="var(--color-muted)" />
                  <ReferenceLine y={0} stroke="var(--color-muted)" />
                  <Tooltip />
                  <Scatter data={chartData} fill="var(--color-warn)" isAnimationActive={false} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </figure>
        </div>
      </div>

      <div className={`${card} space-y-3`}>
        <h2 className="font-semibold">{t.inverse}</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          <label className={label}>
            {t.y0}
            <input data-testid="curva-y0" className={`${input} mt-1`} inputMode="decimal" value={y0} onChange={(e) => setY0(e.target.value)} />
          </label>
          <label className={label}>
            {t.replicates}
            <input className={`${input} mt-1`} inputMode="numeric" value={replicates} onChange={(e) => setReplicates(e.target.value)} />
          </label>
          {prediction && (
            <div className="text-sm sm:col-span-2" data-testid="curva-x0">
              <p>
                <span className="text-muted">{t.x0}: </span>
                <span className="font-mono font-semibold">{fmt(prediction.x0)}</span>
              </p>
              {prediction.sx0 !== null && prediction.ci95 ? (
                <p className="font-mono text-xs">
                  {t.sx0} = {fmt(prediction.sx0)} · {t.ci}: [{fmt(prediction.ci95[0])}; {fmt(prediction.ci95[1])}]
                </p>
              ) : (
                <p className="text-xs text-muted">{t.ciWeighted}</p>
              )}
              {prediction.outOfRange && <p className="text-xs font-semibold text-warn">{t.outOfRange}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Registrar, verificar y commit**

En `registry.ts`, agregar `import { CurvaTool } from './CurvaTool';` y la entrada `curva: CurvaTool`.

1. Run: `npx tsc --noEmit && npm run lint`. Esperado: sin errores.
2. En `/es/modulos/curva`, reemplazar los datos por el ejemplo resuelto: `0,0.1` `1,2.1` `2,3.9` `3,6.1` `4,7.9` (un par por línea).
3. Comprobar: pendiente 1.9600, R² 0.999168, LOD 0.17389, LOQ 0.52694.
4. Con y₀ = 5: x₀ = 2.5000 y s x₀ = 0.058321.

```bash
git add -A
git commit -m "feat: módulo Curva de calibración con residuos, LOD/LOQ y predicción inversa

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 27: Herramienta Margen (incertidumbre)

**Files:**
- Create: `src/lib/i18n/dictionaries/es/margen.ts`, `src/lib/i18n/dictionaries/en/margen.ts`, `src/components/tools/MargenTool.tsx`
- Modify: ambos `index.ts`, `registry.ts`

- [ ] **Step 1: Diccionarios**

`src/lib/i18n/dictionaries/es/margen.ts`:

```ts
export const margen = {
  model: 'Modelo de medición (EURACHEM A1: patrón de cadmio)',
  modelFormula: 'c = 1000 · m · P / V   [mg/L]',
  inputs: 'Magnitudes de entrada',
  name: 'Magnitud',
  value: 'Valor',
  u: 'u (estándar)',
  dist: 'Distribución',
  dists: { normal: 'Normal', rectangular: 'Rectangular', triangular: 'Triangular' },
  names: { m: 'm: masa de Cd (mg)', P: 'P: pureza del metal', V: 'V: volumen del matraz (mL)' } as Record<string, string>,
  budget: 'Presupuesto de incertidumbre (GUM)',
  sensitivity: 'Coef. sensibilidad cᵢ',
  contribution: '|cᵢ|·uᵢ',
  percent: '% de u²',
  result: 'Resultado',
  uc: 'u combinada',
  U: 'U expandida (k = 2)',
  invalid: 'Revisá los valores: deben ser números y u ≥ 0.',
  mc: 'Monte Carlo (GUM Suplemento 1)',
  runMc: 'Simular 100 000 valores',
  mcMean: 'Media',
  mcSd: 'Desvío estándar',
  mcInterval: 'Intervalo de cobertura 95 %',
  gumInterval: 'Intervalo GUM (y ± U)',
  contributionsChart: 'Contribución de cada fuente (% de u²)',
  histogram: 'Distribución simulada del resultado',
  typeA: 'Calculadora tipo A (réplicas)',
  typeAHelp: 'Pegá tus réplicas, una por línea, para obtener u = s/√n.',
  typeAResult: 'n = {n} · media = {mean} · u = {u}',
};
```

`src/lib/i18n/dictionaries/en/margen.ts`:

```ts
import type { margen as esMargen } from '../es/margen';

export const margen: typeof esMargen = {
  model: 'Measurement model (EURACHEM A1: cadmium standard)',
  modelFormula: 'c = 1000 · m · P / V   [mg/L]',
  inputs: 'Input quantities',
  name: 'Quantity',
  value: 'Value',
  u: 'u (standard)',
  dist: 'Distribution',
  dists: { normal: 'Normal', rectangular: 'Rectangular', triangular: 'Triangular' },
  names: { m: 'm: mass of Cd (mg)', P: 'P: metal purity', V: 'V: flask volume (mL)' },
  budget: 'Uncertainty budget (GUM)',
  sensitivity: 'Sensitivity cᵢ',
  contribution: '|cᵢ|·uᵢ',
  percent: '% of u²',
  result: 'Result',
  uc: 'combined u',
  U: 'expanded U (k = 2)',
  invalid: 'Check the values: they must be numbers and u ≥ 0.',
  mc: 'Monte Carlo (GUM Supplement 1)',
  runMc: 'Simulate 100,000 values',
  mcMean: 'Mean',
  mcSd: 'Standard deviation',
  mcInterval: '95 % coverage interval',
  gumInterval: 'GUM interval (y ± U)',
  contributionsChart: 'Contribution of each source (% of u²)',
  histogram: 'Simulated distribution of the result',
  typeA: 'Type A calculator (replicates)',
  typeAHelp: 'Paste your replicates, one per line, to get u = s/√n.',
  typeAResult: 'n = {n} · mean = {mean} · u = {u}',
};
```

Registrar `margen` en ambos índices.

- [ ] **Step 2: Componente**

`src/components/tools/MargenTool.tsx`:

```tsx
'use client';

import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { btnPrimary, card, input, label, table, tableWrap } from '@/components/ui/styles';
import {
  gumBudget,
  monteCarlo,
  typeA,
  type Distribution,
  type InputQuantity,
  type MeasurementModel,
  type MonteCarloResult,
} from '@/lib/science/uncertainty';
import type { ToolProps } from './registry';

const MODEL: MeasurementModel = (v) => (1000 * v.m * v.P) / v.V;

type Row = { name: string; value: string; u: string; distribution: Distribution };
const DEFAULT_ROWS: Row[] = [
  { name: 'm', value: '100.28', u: '0.05', distribution: 'normal' },
  { name: 'P', value: '0.9999', u: '0.000058', distribution: 'rectangular' },
  { name: 'V', value: '100.0', u: '0.07', distribution: 'triangular' },
];
const DISTRIBUTIONS: Distribution[] = ['normal', 'rectangular', 'triangular'];

function toInputs(rows: Row[]): InputQuantity[] | null {
  const inputs = rows.map((r) => ({ name: r.name, value: Number(r.value), u: Number(r.u), distribution: r.distribution }));
  return inputs.every((q) => Number.isFinite(q.value) && Number.isFinite(q.u) && q.u >= 0) ? inputs : null;
}

export function MargenTool({ dict }: ToolProps) {
  const t = dict.tools.margen;
  const [rows, setRows] = useState<Row[]>(DEFAULT_ROWS);
  const [mc, setMc] = useState<MonteCarloResult | null>(null);
  const [replicates, setReplicates] = useState('10.1\n10.3\n9.9\n10.0\n10.2');

  const inputs = useMemo(() => toInputs(rows), [rows]);
  const budget = useMemo(() => (inputs ? gumBudget(MODEL, inputs) : null), [inputs]);

  const typeAResult = useMemo(() => {
    const values = replicates.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map(Number);
    if (values.length < 2 || !values.every(Number.isFinite)) return null;
    return typeA(values);
  }, [replicates]);

  function update(index: number, patch: Partial<Row>) {
    setRows(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
    setMc(null);
  }

  return (
    <div className="space-y-6">
      <div className={`${card} space-y-3`}>
        <h2 className="font-semibold">{t.model}</h2>
        <p className="font-mono text-sm">{t.modelFormula}</p>
        <h3 className="text-sm font-semibold">{t.inputs}</h3>
        <div className={tableWrap}>
          <table className={table}>
            <thead>
              <tr>
                <th>{t.name}</th>
                <th>{t.value}</th>
                <th>{t.u}</th>
                <th>{t.dist}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.name}>
                  <td>{t.names[r.name] ?? r.name}</td>
                  <td>
                    <input aria-label={`${r.name} ${t.value}`} className={input} inputMode="decimal" value={r.value} onChange={(e) => update(i, { value: e.target.value })} />
                  </td>
                  <td>
                    <input aria-label={`${r.name} ${t.u}`} className={input} inputMode="decimal" value={r.u} onChange={(e) => update(i, { u: e.target.value })} />
                  </td>
                  <td>
                    <select
                      aria-label={`${r.name} ${t.dist}`}
                      className={input}
                      value={r.distribution}
                      onChange={(e) => update(i, { distribution: e.target.value as Distribution })}
                    >
                      {DISTRIBUTIONS.map((d) => (
                        <option key={d} value={d}>
                          {t.dists[d]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!budget && (
          <p role="alert" className="text-sm text-danger">
            {t.invalid}
          </p>
        )}
      </div>

      {budget && inputs && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className={`${card} space-y-3`}>
            <h2 className="font-semibold">{t.budget}</h2>
            <div className={tableWrap}>
              <table className={table}>
                <thead>
                  <tr>
                    <th>{t.name}</th>
                    <th>{t.sensitivity}</th>
                    <th>{t.contribution}</th>
                    <th>{t.percent}</th>
                  </tr>
                </thead>
                <tbody>
                  {budget.rows.map((r) => (
                    <tr key={r.name}>
                      <td className="font-mono">{r.name}</td>
                      <td className="font-mono">{r.sensitivity.toPrecision(5)}</td>
                      <td className="font-mono">{r.contribution.toPrecision(4)}</td>
                      <td className="font-mono">{r.percent.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="font-mono text-sm" data-testid="margen-result">
              {t.result}: {budget.y.toFixed(2)} mg/L · {t.uc} = {budget.uc.toFixed(3)} · {t.U} = {budget.U.toFixed(2)}
            </p>
            <figure>
              <figcaption className="mb-2 text-sm font-semibold">{t.contributionsChart}</figcaption>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budget.rows} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <CartesianGrid stroke="var(--color-line)" strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} stroke="var(--color-muted)" />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="var(--color-muted)" width={24} />
                    <Tooltip formatter={(v) => (typeof v === 'number' ? `${v.toFixed(1)} %` : String(v))} />
                    <Bar dataKey="percent" fill="var(--color-accent)" isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </figure>
          </div>

          <div className={`${card} space-y-3`}>
            <h2 className="font-semibold">{t.mc}</h2>
            <button type="button" data-testid="run-mc" className={btnPrimary} onClick={() => setMc(monteCarlo(MODEL, inputs, 100_000, 12345))}>
              {t.runMc}
            </button>
            {mc && (
              <>
                <dl className="grid grid-cols-2 gap-2 text-sm" data-testid="mc-result">
                  <div>
                    <dt className="text-xs text-muted">{t.mcMean}</dt>
                    <dd className="font-mono">{mc.mean.toFixed(2)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">{t.mcSd}</dt>
                    <dd className="font-mono">{mc.sd.toFixed(3)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">{t.mcInterval}</dt>
                    <dd className="font-mono">
                      [{mc.low.toFixed(2)}; {mc.high.toFixed(2)}]
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">{t.gumInterval}</dt>
                    <dd className="font-mono">
                      [{(budget.y - budget.U).toFixed(2)}; {(budget.y + budget.U).toFixed(2)}]
                    </dd>
                  </div>
                </dl>
                <figure>
                  <figcaption className="mb-2 text-sm font-semibold">{t.histogram}</figcaption>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mc.histogram.map((h) => ({ x: ((h.x0 + h.x1) / 2).toFixed(2), count: h.count }))}>
                        <XAxis dataKey="x" tick={{ fontSize: 9 }} stroke="var(--color-muted)" interval={7} />
                        <YAxis hide />
                        <Tooltip />
                        <Bar dataKey="count" fill="var(--color-accent)" isAnimationActive={false} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </figure>
              </>
            )}
          </div>
        </div>
      )}

      <div className={`${card} space-y-2`}>
        <h2 className="font-semibold">{t.typeA}</h2>
        <label className={label}>
          {t.typeAHelp}
          <textarea className={`${input} mt-1 font-mono`} rows={5} value={replicates} onChange={(e) => setReplicates(e.target.value)} />
        </label>
        {typeAResult && (
          <p className="font-mono text-sm">
            {t.typeAResult
              .replace('{n}', String(typeAResult.n))
              .replace('{mean}', typeAResult.mean.toPrecision(6))
              .replace('{u}', typeAResult.u.toPrecision(4))}
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Registrar, verificar y commit**

En `registry.ts`, agregar `import { MargenTool } from './MargenTool';` y la entrada `margen: MargenTool`.

1. Run: `npx tsc --noEmit && npm run lint`. Esperado: sin errores.
2. En `/es/modulos/margen` comprobar el resultado GUM: 1002.70 mg/L · u = 0.864 · U = 1.73, con V ≈ 66 %.
3. Presionar «Simular» y comprobar que el desvío da ≈ 0.864 y los intervalos son similares.
4. Tipo A del ejemplo: u = 0.07071.

```bash
git add -A
git commit -m "feat: módulo Margen de incertidumbre GUM + Monte Carlo

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```
