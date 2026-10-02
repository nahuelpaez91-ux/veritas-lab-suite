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
