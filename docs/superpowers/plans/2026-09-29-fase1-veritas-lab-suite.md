# Veritas Lab Suite — Fase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar en Vercel un portfolio bilingüe (ES/EN) con el flujo de laboratorio conectado Enlace → Control de calidad → Custodia → Informe, los módulos Curva y Margen, la IA con barandas, el dossier de validación y el CV en 3 audiencias × 2 idiomas (PDF listos para enviar), para postularse a nivel nacional (remoto), local (remoto/presencial) y mundial (remoto).

**Architecture:**
- **App:** Next.js 16 (App Router), con el segmento raíz `[lang]` como root layout y todas las páginas estáticas.
- **Lógica:**
  - Científica y de laboratorio en TypeScript puro (`src/lib/science`, `src/lib/lis`, `src/lib/lims`), con tests Vitest contra referencias publicadas.
  - El estado de la demo es por visitante: `localStorage` con un audit trail encadenado por SHA-256.
- **Backend visible:** esquema Postgres en `supabase/migrations`, probado con PGlite.
- **IA:** una sola ruta server-side (`/api/assist`) con la Claude API. La IA nunca decide; solo redacta borradores que se aprueban y quedan auditados.

**Tech Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Recharts · @react-pdf/renderer · qrcode · zod · @anthropic-ai/sdk · Vitest · Playwright · PGlite · GitHub Actions · Vercel.

**Spec:** `docs/superpowers/specs/2026-09-29-portfolio-laboratorios-design.md`

---

## Cómo está dividido este plan

| Parte | Archivo | Tareas |
|---|---|---|
| 1 · Base | `2026-09-29-fase1-parte-1-base.md` | T1 scaffold · T2 tooling de tests · T3 diseño · T4 i18n y layout · T5 marco del sitio y firma · T6 shell de módulo |
| 2 · Ciencia | `2026-09-29-fase1-parte-2-ciencia.md` | T7 estadística · T8 Westgard · T9 calibración (NIST) · T10 incertidumbre (GUM + Monte Carlo) · T11 exportación CSV |
| 3 · LIS/LIMS | `2026-09-29-fase1-parte-3-lims.md` | T12 hash · T13 ASTM · T14 HL7 · T15 audit trail · T16 modelo LIMS · T17 datos semilla · T18 acciones · T19 store del navegador · T20 esquema SQL |
| 4 · Módulos | `2026-09-29-fase1-parte-4-modulos.md` | T21 contenidos y ruta · T22 Enlace · T23 QC · T24 Custodia · T25 Informe · T26 Curva · T27 Margen |
| 5 · Cierre | `2026-09-29-fase1-parte-5-cierre.md` | T28 IA con barandas · T29 validación · T30 páginas IA y Acerca · T31 home · T32 CV · T33 PDFs del CV · T34 e2e · T35 CI y README · T36 publicación · T37 checklist de Andrés |

Las tareas se ejecutan **en orden**. Cada una termina con tests o verificación en verde y un commit.

## Restricciones confirmadas por Andrés (2026-09-29)

- **Sin cuenta de Supabase:** las demos son funcionales con datos de ejemplo, 100 % en el navegador. El SQL es solo código probado con PGlite, no se conecta a nada.
- **Sin API key de Anthropic:** el asistente tiene un modo sin conexión basado en reglas y bien etiquetado (T28). La ruta `/api/assist` queda lista para cuando exista la key.
- **Sin LinkedIn ni certificación de inglés:** no se muestra LinkedIn. El inglés figura como "intermedio (Técnico en Idioma Inglés, 2015)".

## Mapa de archivos

```
next.config.ts                      redirect / → /es
vitest.config.mts · playwright.config.ts
.github/workflows/ci.yml
scripts/build-traceability.ts       tests → matriz de trazabilidad (JSON)
scripts/export-cv-pdf.ts            CV HTML → 6 PDFs en public/cv/
supabase/migrations/0001_schema.sql (tablas + audit trail append-only con hash, probado)
supabase/migrations/0002_rls.sql    (RLS por rol, solo Supabase)
e2e/flow.spec.ts · e2e/responsive.spec.ts
src/app/globals.css
src/app/[lang]/layout.tsx           root layout (html lang, fuentes, provider, header/footer)
src/app/[lang]/page.tsx             home
src/app/[lang]/modulos/[slug]/page.tsx
src/app/[lang]/validacion/page.tsx · ia/page.tsx · acerca/page.tsx · cv/[audience]/page.tsx
src/app/api/assist/route.ts
src/lib/i18n/{config.ts,get-dictionary.ts}
src/lib/i18n/dictionaries/{types.ts, es/*.ts, en/*.ts}
src/lib/crypto.ts                   canonicalJson + sha256Hex
src/lib/science/{stats,westgard,calibration,random,uncertainty}.ts (+ .test.ts, fixtures/Norris.dat)
src/lib/lis/{types,common,loinc,examples,astm,hl7}.ts (+ tests)
src/lib/lims/{audit,model,users,qc,release,seed,actions,storage}.ts (+ tests)
src/lib/db/schema.test.ts           PGlite
src/lib/export/csv.ts
src/lib/ai/prompts.ts
src/content/{types.ts,profile.ts,credentials.ts,cv.ts}
src/content/modules/{index,enlace,qc,custodia,informe,curva,margen}.ts
src/content/validation/{urs.ts,traceability.json}
src/components/ui/styles.ts
src/components/layout/{Monogram,Signature,LangSwitch,SiteHeader,SiteFooter}.tsx
src/components/module/{ModuleShell,WhatIsThisModal,StepGuide,ScienceSection,Glossary,VerifiedBadge,Term}.tsx
src/components/lab/{LabStoreProvider,DemoBar,SignDialog,StatusChip}.tsx
src/components/tools/{registry.ts,EnlaceTool,QcTool,LeveyJenningsChart,CustodiaTool,InformeTool,ReportDocument,CurvaTool,MargenTool,AssistButton}.tsx
src/components/home/HomeSections.tsx
```

## Convenciones (valen para todas las tareas)

- **Shell:** Git Bash. Todos los comandos se corren desde la raíz `D:\dev\portfolio-laboratorios-ciencia`.
- **Commits:** mensaje en español con prefijo convencional (`feat:`, `test:`, `chore:`, `docs:`), terminado con una línea en blanco y
  `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`
- **IDs de requisito:** cada test lleva su ID entre corchetes en el título (`[QC-URS-03] …`). El script de trazabilidad (T29) los lee para armar la matriz requisito → test. **No cambiar esos IDs.**
- **Honestidad:**
  - Nunca escribir "cumple Part 11". Usar siempre "diseñado considerando…".
  - Todo dato de ejemplo se declara como tal.
  - En el CV no se inventan logros ni fechas: lo no confirmado queda marcado en la checklist T37.
- **Estado de la demo:** los componentes cliente leen y escriben el laboratorio solo con `useLab()` (T19). Nunca tocan `localStorage` directamente.
- **Verificación antes de cada commit:** `npx vitest run <archivo>` para la lógica, `npx tsc --noEmit` y `npm run lint` para la UI.
