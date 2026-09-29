// Mensajes de ejemplo (datos ficticios) con la estructura de ASTM E1394 / LIS2-A2 y HL7 v2.5.1 ORU^R01.
export const ASTM_EXAMPLE = [
  'H|\\^&|||cobas-demo^1.0|||||||P|1|20260929083000',
  'P|1|PAC-0001|||Pérez^Juana',
  'O|1|M-2026-0101||^^^GLU\\^^^CHOL|R||20260929080000',
  'R|1|^^^GLU|112|mg/dL|70 to 110|H||F||||20260929081500',
  'R|2|^^^CHOL|185|mg/dL|<200|N||F||||20260929081600',
  'P|2|PAC-0002|||Soria^Carlos',
  'O|1|M-2026-0102||^^^GLU\\^^^CHOL|R||20260929080500',
  'R|1|^^^GLU|94|mg/dL|70 to 110|N||F||||20260929082000',
  'R|2|^^^CHOL|232|mg/dL|<200|H||F||||20260929082100',
  'L|1|N',
].join('\r');

export const HL7_EXAMPLE = [
  'MSH|^~\\&|ANALIZADOR|LAB|VERITAS|LAB|20260929083000||ORU^R01|MSG0001|P|2.5.1',
  'PID|1||PAC-0003^^^LAB||Luna^Rosa',
  'OBR|1||M-2026-0103|24331-1^Lipid panel^LN',
  'OBX|1|NM|2093-3^Cholesterol^LN||210|mg/dL|<200|H|||F|||20260929084000',
  'OBX|2|NM|2345-7^Glucose^LN||88|mg/dL|70-110|N|||F|||20260929084100',
].join('\r');
