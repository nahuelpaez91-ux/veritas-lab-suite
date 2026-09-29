# Veritas Lab Suite — Portfolio para laboratorios, ciencia e institutos tecnológicos

**Autor:** Andrés Nahuel Páez · **Fecha:** 2026-09-29 · **Estado:** diseño aprobado en conversación, pendiente revisión escrita

## 1. Objetivo

Un portfolio web + CV que posicione a Andrés como **desarrollador de software para laboratorios (datos · calidad · trazabilidad)**, empleable en:

1. Empresas de software LIS/LIMS (InterPracsys, COYA, TenmaLab, NUBIX, Lims.Ar, Enlace Molecular).
2. Roles de analista/implementador LIMS y validación de sistemas computarizados (CSV) junior en farma/alimentos (AR y España).
3. Analista de datos de QC en laboratorios acreditados e institutos (INTI, INTA, CONICET).
4. Mercado regional NOA/Cuyo: INV, La Riojana, UNdeC, Aguas Riojanas, CRILAR, SGS San Juan, laboratorios geoquímicos.

**Mensaje central:** *"Construyo software de laboratorio con IA sabiendo dónde no ponerla."* Los cálculos que deciden son deterministas y están verificados contra referencias publicadas. La IA solo asiste (explica, redacta borradores, extrae datos) con revisión humana y audit trail.

**Fuera de alcance de este spec:** la herramienta de envío de mails (sub-proyecto posterior, cuando portfolio y CV estén confirmados).

## 2. Principios no negociables

- **Cálculos reales y verificados.** Toda función científica tiene tests con datasets de referencia publicados (NIST StRD, JCGM 100/GUM S1, ejemplos Westgard, EURACHEM). Cada módulo muestra la insignia "Verificado vs <referencia>" con link al test.
- **Lenguaje de cumplimiento honesto.** "Diseñado considerando 21 CFR Part 11 / EU Anexo 11 / ANMAT Disp. 4159/2023 Anexo 6". Nunca "cumple". Aviso fijo: *"Demo educativa, no validada para uso GxP. Datos de ejemplo."*
- **Datos declarados.** Cada dataset se etiqueta como *real (fuente + URL)*, *sintético realista* o *de ejemplo publicado*.
- **IA con barandas.** El LLM nunca decide un resultado. Cada uso de IA registra modelo, prompt, hash de entrada, usuario que aprueba y fecha en el audit trail. Hay una página "Política de uso de IA" que cita el EU GMP Anexo 22 (borrador 2025), la ISPE GAMP AI Guide (2025) y los principios FDA/EMA de Good AI Practice (2026).
- **Todo explicado.** Cada módulo incluye:
  - Modal **"¿Qué es esto?"** con cuatro bloques: *Qué resuelve · Cómo funciona · De dónde saldrían los datos reales (tabla Variable → Fuente real) · Dónde más se aplica*.
  - **Guía paso a paso** dentro del módulo, con tooltips en términos técnicos.
  - **"La ciencia detrás"**: fórmula, norma de referencia y un ejemplo resuelto verificable.
  - **Glosario** ES/EN.
- **Firma.**
  - Una sola suite, **Veritas Lab Suite**, con módulos con nombre propio.
  - Barra superior "AMBIENTE DEMO · A. N. Páez".
  - Pie en cada módulo: "Diseñado y desarrollado por Andrés Nahuel Páez", monograma ANP, link al portfolio y al repositorio.
  - Sección "Acerca de".

## 3. Stack y arquitectura

- **App:** Next.js (App Router) + TypeScript + Tailwind, en un solo repo público en GitHub (`nahuelpaez91-ux`) y desplegada en Vercel.
- **i18n:** ES/EN con rutas `/es/...` y `/en/...` (next-intl). Español por defecto.
- **Estilo visual:** claro, estilo laboratorio: fondo blanco/gris muy claro, acento verde azulado, tipografía sans legible y mono para valores. Soporta modo oscuro vía `prefers-color-scheme`.
- **Lógica científica:** paquete interno `lib/science/*`, TypeScript puro sin dependencias de UI. Cada archivo es una unidad testeable (`westgard.ts`, `calibration.ts`, `uncertainty.ts`, `astm.ts`, `hl7.ts`, `mkt.ts`, `geochem.ts`, `enology.ts`, `water.ts`).
- **Backend (Fase 1):** Supabase Postgres.
  - Tablas `samples`, `results`, `qc_runs`, `audit_log`, `signatures`, `users_demo`.
  - `audit_log` append-only con triggers y encadenamiento por hash (cada fila guarda el hash de la anterior).
  - RLS por rol: analista, validador, admin.
  - Migraciones versionadas en el repo.
  - Login demo con usuarios precargados por rol. La base se resetea periódicamente.
- **Gráficos:** Recharts (o SVG propio donde haga falta precisión, p. ej. cartas de control con líneas ±1/2/3 DE).
- **Exportación:** CSV y PDF (`@react-pdf/renderer`) para informes y CoA.
- **IA:** route handler server-side con Claude API. La API key queda en una env var de Vercel, nunca en el cliente. Salida estructurada validada con zod. Rate limit simple por IP.
- **Calidad:**
  - Vitest para `lib/science` con datasets de referencia.
  - Playwright para el flujo integrado.
  - GitHub Actions (CI) con badge en el README.

## 4. Módulos

### Fase 1: núcleo (flujo integrado + CV)

El flujo integrado es la pieza central de la home:
**Enlace → QC → Custodia → Informe.**

| Módulo | Qué hace | Referencia de verificación |
|---|---|---|
| **Enlace** | Parser de mensajes ASTM E1394/LIS2-A2 y HL7 v2 ORU^R01 de analizadores (ejemplos basados en manuales cobas/Sysmex). Valida estructura, muestra una tabla y mapea a LOINC. Ingresa resultados a la base. Menciona FHIR. | Mensajes de ejemplo de los estándares |
| **QC** (Veritas QC) | Cartas Levey-Jennings y multirreglas Westgard (1-2s, 1-3s, 2-2s, R-4s, 4-1s, 10x) entre corridas y niveles. Métrica Sigma con TEa (CLIA / variación biológica). Gráfico de Youden. Registro de acción correctiva. **Bloquea la liberación** de resultados de una corrida rechazada. | Ejemplos publicados de Westgard |
| **Custodia** | Ingreso de muestras, código de barras/QR, estados, alícuotas, línea de tiempo. Audit trail inalterable (hash chain). Firma electrónica con re-autenticación y significado (revisado/aprobado). Validación bioquímica antes de liberar. Checklist ALCOA+. | Tests de integridad de la cadena |
| **Informe** | Genera el informe de resultados o el CoA en PDF con firmas, trazabilidad y estado de QC. | — |
| **Curva** | Calibración: regresión lineal y ponderada (1/x, 1/x²), R², residuos, LOD/LOQ, predicción inversa con intervalo, puntos fuera del rango. | NIST StRD (Norris, Pontius) |
| **Margen** | Incertidumbre: presupuesto GUM (tipo A/B, coeficientes de sensibilidad, combinada, expandida k=2) y Monte Carlo (GUM S1), con gráfico de contribuciones. | Ejemplos JCGM 100 / GUM S1 / EURACHEM |
| **Asistente con barandas** | Botón "Explicar / redactar borrador" transversal (explicar una regla Westgard violada, borrador de desvío/CAPA). Registro de IA en el audit trail. | — |
| **Dossier de validación (QC)** | URS, análisis de riesgo GAMP 5, matriz de trazabilidad requisito → test (generada desde los tests), protocolo OQ con evidencia y control de cambios. Publicado como página y como PDF. | — |

**CV (Fase 1)**, ES y EN, en página HTML imprimible y PDF, compatible con ATS:
- Formato: una columna, sin tablas ni íconos, 1–2 páginas.
- Títulos:
  - Principal: "Desarrollador de Software para Laboratorios | Datos · Calidad · Trazabilidad".
  - Variante: "Desarrollador Python/SQL · Sistemas de Laboratorio (LIMS/QC) · Integridad de Datos".
- Resumen: 9 años de gestión documental y normativa presentados como control documental (ISO 17025 cl. 8.3), más el desarrollo de IA y datos.
- Portfolio: los módulos con link y la norma relacionada.
- Keywords ATS: LIMS, LIS, HL7, ASTM, SQL, Python, CSV, GAMP 5, ALCOA+, audit trail, ISO/IEC 17025, ISO 15189, Westgard, SPC, measurement uncertainty, method validation.
- Capacidades: 5 ítems, ver sección 5.
- Experiencia real sin inflar. Formación (Lic. Educación, Prof. Geografía con estadística, geología e hidrología). Certificaciones: Anthropic primero, YPF resumidas.
- Idiomas: inglés con nivel MCER real, a confirmar con Andrés.
- Disponibilidad: remoto / relocalización / viajes.
- **Excluye:** DNI, fecha de nacimiento, afirmaciones no verificables.

### Fase 2: región + IA aplicada

| Módulo | Qué hace |
|---|---|
| **Stock & Frío** | Inventario de reactivos con lotes, FEFO, stock mínimo, alertas de vencimiento, fecha de apertura, etiquetas QR. Cadena de frío: sensores simulados (IoT/MQTT conceptual), carga de CSV de datalogger, excursiones, MKT, firma de revisión e informe mensual. |
| **Extractor de CoA** | La Claude API con salida estructurada lee el PDF de un certificado de análisis. Valida contra un esquema y contra la especificación, marca discrepancias y exige "Aprobar" humano antes de cargar al inventario. |
| **Cuenca** | Calidad de agua con el caso **arsénico en La Rioja**: límites CAA art. 982 (As 0,01 mg/L; excepción 0,05), fluoruro, nitratos. Mapa por localidad, semáforo, índice SAR para riego, informe automático. Datos SNIH/ACUMAR reales, más sintéticos declarados para La Rioja. |
| **Enología** | Parámetros de rutina INV (alcohol, SO₂ libre/total, acidez total/volátil, azúcares reductores, metanol) contra límites legales y de exportación. Westgard para el material de control. Trazabilidad lote → análisis. Tablero con datos abiertos INV de La Rioja por departamento. |
| **Geoquímica** | Datos multielemento SEGEMAR/SIGAM: estadística robusta (log, MAD, Q-Q), mapa de anomalías. QA/QC de ensayo: blancos, duplicados, CRM con cartas de control, Thompson-Howarth. Incluye notebook reproducible (Quarto/Jupyter) enlazado. |

### Fase 3: extras

- **Secuencia:** visor FASTA/FASTQ, calidad por posición, %GC, complemento reverso, Tm y diseño de primers. Orientado a CONICET.
- **Servidor MCP `lab-qc`:** expone Westgard, calibración, GUM y límites CAA como herramientas para Claude.
- **Conversión a Allotrope ASM** de la salida de Enlace, con un PR a `Benchling-Open-Source/allotropy`.
- **Videos** de 60–90 s por módulo principal y un recorrido de 3 min del flujo integrado.
- **Blog técnico en español:** "Qué NO debe hacer un LLM en un laboratorio GMP", "Incertidumbre GUM paso a paso".

## 5. Estructura del sitio

- **Home.**
  - Hero con el mensaje central.
  - Diagrama interactivo del flujo integrado.
  - Trayectoria "del territorio y la gestión al laboratorio", con tres pilares: gestión documental y normativa · ciencia de datos y territorio · software con IA responsable.
  - Módulos agrupados por área: Calidad analítica · Trazabilidad e integración · Inventario e instrumentación · Ambiente y región · Ciencias de la vida.
  - **"Qué más puedo construir para tu laboratorio"** (5 ítems):
    1. Migración de planillas Excel a sistemas con audit trail.
    2. Informes y CoA automáticos.
    3. Ingesta de datos de equipos.
    4. Asistentes IA sobre SOPs y normativa, con cita de fuente y revisión humana.
    5. Documentación de validación.
  - Credenciales verificables.
  - Contacto.
- `/modulos/<modulo>`: el módulo más su ficha explicativa.
- `/validacion`: dossier.
- `/ia`: política de uso de IA.
- `/cv`: CV imprimible ES/EN.
- `/acerca`.

## 6. Acciones fuera del código (recomendadas a Andrés)

- Tapar el DNI en los PDFs de títulos publicados.
- Crear o enlazar LinkedIn.
- Limpiar los repos vacíos de GitHub y aclarar que NormaMina usa Gemini.
- Reencuadrar los portfolios de minería y banca como "datos/IA para industrias reguladas", u ocultarlos.
- Cursos cortos:
  - ISO/IEC 17025 o incertidumbre (INTI / OAA).
  - Integridad de datos ALCOA+ / GAMP 5.
- Conseguir 1–2 usuarios piloto (un laboratorio de La Rioja, UNLaR/UNdeC, un laboratorio de aguas) y un testimonio.

## 7. Manejo de errores y casos límite

- Los parsers devuelven errores legibles con línea/segmento, nunca excepciones crudas.
- Las entradas numéricas se validan (zod): n mínimo para estadística, valores no negativos donde corresponde, unidades explícitas.
- Si falla la IA (sin key, rate limit), el módulo funciona igual y el botón muestra "Asistente no disponible".
- Si Supabase no está disponible, se usa un modo local de solo lectura con datos precargados, avisado en la barra.

## 8. Criterios de éxito (Fase 1)

- Todos los tests de `lib/science` pasan contra las referencias publicadas y la CI está en verde con badge.
- El flujo integrado de punta a punta funciona en producción: mensaje ASTM → corrida rechazada bloquea la liberación → acción correctiva → liberación firmada → PDF.
- Cada módulo de la Fase 1 tiene ficha completa, guía, "La ciencia detrás" y glosario, en ES y EN.
- El CV ES/EN está listo en HTML y PDF y fue revisado por Andrés.
- Lighthouse ≥ 90 en performance y accesibilidad. Funciona a 400 px de ancho.

## 9. Plan de ejecución

Este spec abarca tres fases. El primer plan de implementación cubre **solo la Fase 1**. Las fases 2 y 3 tendrán cada una su propio plan cuando la Fase 1 esté publicada y confirmada.
