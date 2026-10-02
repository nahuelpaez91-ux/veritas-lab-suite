import traceability from './traceability.json';

type TraceTest = { ids: string[]; title: string; file: string; status: string };

const tests = traceability.tests as TraceTest[];

export interface ValidationSummary {
  passed: number;
  total: number;
  commit: string;
  date: string; // YYYY-MM-DD, '' si el reporte aún no se generó
}

// Datos reales del último reporte de pruebas (npm run traceability).
export function validationSummary(): ValidationSummary {
  return {
    passed: tests.filter((t) => t.status === 'passed').length,
    total: tests.length,
    commit: traceability.commit,
    date: traceability.generatedAt.slice(0, 10),
  };
}

// Resultado de los tests de un archivo concreto (p. ej. el verifiedAgainst.testPath de un módulo).
export function testFileVerdict(testPath: string): { passed: number; total: number; conforme: boolean } {
  const mine = tests.filter((t) => t.file === testPath);
  const passed = mine.filter((t) => t.status === 'passed').length;
  return { passed, total: mine.length, conforme: mine.length > 0 && passed === mine.length };
}
