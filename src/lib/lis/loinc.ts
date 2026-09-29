export const LOINC_TABLE = [
  { code: 'GLU', loinc: '2345-7', es: 'Glucosa [masa/volumen] en suero o plasma', en: 'Glucose [Mass/volume] in Serum or Plasma' },
  { code: 'CHOL', loinc: '2093-3', es: 'Colesterol [masa/volumen] en suero o plasma', en: 'Cholesterol [Mass/volume] in Serum or Plasma' },
  { code: 'CREA', loinc: '2160-0', es: 'Creatinina [masa/volumen] en suero o plasma', en: 'Creatinine [Mass/volume] in Serum or Plasma' },
  { code: 'UREA', loinc: '3094-0', es: 'Nitrógeno ureico [masa/volumen] en suero o plasma', en: 'Urea nitrogen [Mass/volume] in Serum or Plasma' },
  { code: 'TRIG', loinc: '2571-8', es: 'Triglicéridos [masa/volumen] en suero o plasma', en: 'Triglyceride [Mass/volume] in Serum or Plasma' },
  { code: 'HGB', loinc: '718-7', es: 'Hemoglobina [masa/volumen] en sangre', en: 'Hemoglobin [Mass/volume] in Blood' },
] as const;

export function loincFor(code: string): string | null {
  return LOINC_TABLE.find((r) => r.code === code)?.loinc ?? null;
}

export function localCodeForLoinc(loinc: string): string | null {
  return LOINC_TABLE.find((r) => r.loinc === loinc)?.code ?? null;
}
