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
