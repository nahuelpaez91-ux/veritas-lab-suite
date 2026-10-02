export type Cell = string | number | null | undefined;

const PLAIN_NUMBER = /^[-+]?\d+(\.\d+)?$/;

// Neutraliza inyección de fórmulas (CSV injection) en hojas de cálculo: si la
// celda empieza con =, +, - o @ y no es un número llano, se antepone un
// apóstrofo para que el valor se interprete como texto literal.
function escapeCell(cell: Cell): string {
  if (cell === null || cell === undefined) return '';
  let s = String(cell);
  if (/^[=+\-@]/.test(s) && !PLAIN_NUMBER.test(s)) s = `'${s}`;
  return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(headers: string[], rows: Cell[][]): string {
  return [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n') + '\r\n';
}

export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// BOM UTF-8 para que Excel respete los acentos.
export function downloadText(filename: string, text: string, mime = 'text/csv;charset=utf-8'): void {
  downloadBlob(filename, new Blob(['﻿' + text], { type: mime }));
}
