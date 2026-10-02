import type { LocalizedModule } from '../types';

export const margen: LocalizedModule = {
  es: {
    name: 'Margen',
    area: 'Calidad analítica',
    tagline: 'Incertidumbre de medición: presupuesto GUM con coeficientes de sensibilidad y verificación por Monte Carlo.',
    whatSolves:
      'ISO/IEC 17025 §7.6 exige evaluar la incertidumbre de medición. Margen arma el presupuesto paso a paso y muestra qué fuente pesa más, que es donde conviene invertir para mejorar. Después lo confirma con una simulación de Monte Carlo.',
    howItWorks: [
      'Cada magnitud de entrada tiene un valor, una incertidumbre estándar y una distribución (normal, rectangular o triangular).',
      'Calcula los coeficientes de sensibilidad derivando numéricamente el modelo de medición.',
      'Combina las contribuciones con u_c = √Σ(cᵢ·uᵢ)² y expande con k = 2 (≈ 95 % si el resultado se distribuye aproximadamente normal; el Monte Carlo lo comprueba).',
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
      { term: 'Factor de cobertura k', definition: 'Multiplicador para obtener la incertidumbre expandida. Con k = 2, la cobertura es ≈ 95 % solo si el resultado se distribuye aproximadamente normal (GUM §6.3).' },
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
      'ISO/IEC 17025 §7.6 requires evaluating measurement uncertainty. Margen builds the budget step by step and shows which source weighs most, which is where improvement pays off. Then it confirms the result with a Monte Carlo simulation.',
    howItWorks: [
      'Each input quantity has a value, a standard uncertainty and a distribution (normal, rectangular or triangular).',
      'Computes sensitivity coefficients by numerically differentiating the measurement model.',
      'Combines contributions as u_c = √Σ(cᵢ·uᵢ)² and expands with k = 2 (≈ 95 % when the output is approximately normal; Monte Carlo checks this).',
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
      { term: 'Coverage factor k', definition: 'Multiplier giving the expanded uncertainty. With k = 2, coverage is ≈ 95 % only when the output is approximately normal (GUM §6.3).' },
      { term: 'Monte Carlo', definition: 'Propagation by simulation: inputs are sampled and the output distribution is obtained.' },
    ],
    verifiedAgainst: {
      label: 'EURACHEM/CITAC QUAM example A1 (GUM and Monte Carlo)',
      testPath: 'src/lib/science/uncertainty.test.ts',
    },
  },
};
