import type { LocalizedModule } from '../types';

export const qc: LocalizedModule = {
  es: {
    name: 'Control de calidad',
    area: 'Calidad analítica',
    tagline:
      'Cartas de Levey-Jennings y multirreglas de Westgard que bloquean la liberación de resultados de una corrida rechazada.',
    whatSolves:
      'Aplicar las reglas de Westgard a mano es lento y propenso a errores. Usada como regla de rechazo, 1-2s descarta ≈ 9 % de corridas buenas con 2 controles por corrida y ≈ 18 % con 4, y las reglas entre niveles se pasan por alto. Este módulo evalúa cada corrida con las multirreglas y la marca como aceptada, en advertencia o rechazada. El sistema no deja liberar resultados de una corrida rechazada hasta documentar la acción correctiva.',
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
      'Applying Westgard rules by hand is slow and error-prone. Used as a rejection rule, 1-2s discards ≈ 9 % of good runs with 2 controls per run and ≈ 18 % with 4, and across-level rules get missed. This module evaluates every run with the multirules and marks it accepted, warning or rejected. The system will not release results from a rejected run until the corrective action is documented.',
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
