# Veritas Lab Suite

[![CI](https://github.com/nahuelpaez91-ux/veritas-lab-suite/actions/workflows/ci.yml/badge.svg)](https://github.com/nahuelpaez91-ux/veritas-lab-suite/actions/workflows/ci.yml)

Portfolio de software para laboratorios de **Andrés Nahuel Páez**: control de calidad, trazabilidad de muestras, integración de equipos y cálculos metrológicos, verificados contra referencias publicadas.

**Demo:** https://veritas-lab-suite.vercel.app · **Validación:** `/es/validacion` · **CV:** `/es/cv/nacional`

> Demo educativa, no validada para uso GxP. Diseñada considerando 21 CFR Part 11, EU GMP Anexo 11 y ANMAT Disp. 4159/2023 (Anexo 6). Datos de ejemplo o sintéticos.

## Flujo

Analizador (ASTM / HL7) → **Enlace** → **Control de calidad** (Westgard, bloquea la liberación) → **Custodia** (firma electrónica, audit trail SHA-256) → **Informe** (PDF con hashes)

## Módulos y verificación

| Módulo | Qué hace | Verificado contra |
|---|---|---|
| Enlace | Parser ASTM E1394 / HL7 v2 ORU^R01, LOINC | Estructura de los estándares y checksum LIS1-A |
| Control de calidad | Levey-Jennings, multirreglas de Westgard, Sigma | Definiciones de Westgard (Clin Chem 1981) |
| Custodia | Estados, firma con re-autenticación, segregación de funciones, audit trail encadenado | Tests de alteración y borrado |
| Informe | PDF solo para muestras liberadas | Tests de la regla de liberación |
| Curva | Mínimos cuadrados (ponderados), LOD/LOQ, predicción inversa | NIST StRD Norris |
| Margen | Incertidumbre GUM y Monte Carlo | EURACHEM/CITAC QUAM A1 |

## Principios

- Los cálculos que deciden son deterministas y tienen tests con datos de referencia.
- La IA solo asiste, con revisión humana y registro. Sin API key funciona en modo sin conexión por reglas (ver `/es/ia`).
- La trazabilidad requisito → test se genera desde los tests (`npm run traceability`).

## Desarrollo

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # Vitest (lógica científica, LIS, LIMS, SQL con PGlite)
npm run test:e2e     # Playwright (flujo completo y responsive)
npm run build        # tests + matriz de trazabilidad + build
npm run cv:pdf       # regenera los PDF del CV (requiere el servidor en marcha)
```

Opcional: copiar `.env.example` a `.env.local` y definir `ANTHROPIC_API_KEY` para activar la IA real.

## Estructura

- `src/lib/science`: estadística, Westgard, calibración, incertidumbre
- `src/lib/lis`: parsers ASTM y HL7
- `src/lib/lims`: audit trail, estados, firmas, liberación, informe
- `supabase/migrations`: esquema Postgres de referencia (audit trail append-only, RLS)
- `src/content`: textos de módulos, CV, credenciales y URS

---

Diseñado y desarrollado por **Andrés Nahuel Páez** · La Rioja, Argentina · nahuelpaez91@gmail.com
