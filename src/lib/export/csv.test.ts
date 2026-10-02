import { expect, it } from 'vitest';
import { toCsv } from './csv';

it('[EXP-URS-01] CSV con escape de comillas, comas, saltos de línea y celdas vacías', () => {
  const csv = toCsv(['id', 'nota', 'valor'], [
    ['M-1', 'dice "hola", ok', 1.5],
    ['M-2', 'línea\nnueva', null],
  ]);
  expect(csv).toBe('id,nota,valor\r\nM-1,"dice ""hola"", ok",1.5\r\nM-2,"línea\nnueva",\r\n');
});

it("[EXP-URS-02] neutraliza fórmulas pero no números negativos", () => {
  const csv = toCsv(['a'], [['=SUM(A1)'], ['-0.5'], [-3], ['@x']]);
  expect(csv).toBe("a\r\n'=SUM(A1)\r\n-0.5\r\n-3\r\n'@x\r\n");
});
