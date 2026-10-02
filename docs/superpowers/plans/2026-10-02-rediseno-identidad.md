# Rediseño de identidad: plan de implementación

> **For agentic workers:** usar superpowers:subagent-driven-development. Spec: `docs/superpowers/specs/2026-10-02-rediseno-identidad-design.md`. Referencias visuales y de texto: `docs/superpowers/specs/rediseno/direcciones-visuales.html` (pestaña C, más el panel de lecturas de A y la firma territorial de B) y `docs/superpowers/specs/rediseno/propuestas-de-marca.md` (dirección C y sección 4 de microcopy).

**Goal:** reemplazar la estética de plantilla por la identidad «El expediente × documento controlado», con el nombre «Andrés Nahuel Páez · Portfolio», sin romper la lógica ni las pruebas.

**Reglas comunes:**
- No tocar `src/lib/**`, salvo que haga falta leer datos para mostrar.
- No cambiar `data-testid` ni los textos que verifican los e2e: «En análisis», «Revisada», «Liberada», «Rechazada», «Aceptada», «Cancelar», «íntegra», «sin IA».
- Diccionarios ES/EN sincronizados: los EN se tipan con `typeof es…`.
- Contraste AA en claro y oscuro. Sin scroll horizontal a 400 px.
- Datos mostrados reales: revisión = commit de `traceability.json`, vigencia = su `generatedAt`, pruebas = conteo real. No inventar hashes, páginas ni registros.
- **Puertos:** el 3000 está ocupado en esta máquina. Usar el 3100 o el 3300 y apagar el servidor al terminar.
- **Commits:** un commit por tarea, en español, con `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`.

## R1 · Sistema visual, marca y marco del sitio
- **Tokens y fuentes:**
  - `globals.css`: tokens de la tabla del spec (claro, oscuro e impresión), sin radios, `--font-serif` y `--font-mono`.
  - `[lang]/layout.tsx`: Source Serif 4 (con eje `opsz`) y Red Hat Mono vía `next/font/google`, en lugar de IBM Plex.
- **Estilos base y chips:**
  - `components/ui/styles.ts`: botones rectangulares (el primario en tinta y, al pasar el mouse, en lacre), inputs y tablas en estilo documento.
  - `StatusChip`: rectangular, en mayúsculas monoespaciadas.
- **Componentes nuevos de identidad** (`src/components/brand/`):
  - `Seal` (sello circular de doble anillo en lacre con el texto en arco).
  - `VertexMark` (vértice geodésico con coordenadas).
  - `HandSignature` (trazo de firma en SVG).
  - Reemplazan a `Monogram` en encabezado y pie.
- **Encabezado y pie:**
  - `SiteHeader`: marca «Andrés Nahuel Páez · Portfolio» con el sello chico, y navegación en monoespaciada con § numerados solo si encodan un orden real (si no, sin números).
  - `SiteFooter`: bloque de firma (línea de firma, nombre, «Registros que aguantan una auditoría.»), vértice con 29°24′S 66°51′W y el aviso de la demo.
- **Nombre nuevo:** `meta.title`, `shortTitle` y `openGraph.siteName` pasan a «Andrés Nahuel Páez · Portfolio» (ES y EN). También el título y el pie de `ReportDocument` y el README.
- **Verificación:** `tsc`, lint, `vitest` y `build:next`. Revisar una vez a 1280 y a 400 px que no haya regresiones en módulos.

## R2 · Home, Acerca y textos de identidad
- **Home** (`HomeSections.tsx` + `home.ts` ES/EN, reescritos):
  1. Encabezado de documento: título «Portfolio técnico · Andrés Nahuel Páez», código `ANP-POR-001`, revisión = commit y vigencia = fecha, ambos de `traceability.json`.
  2. Héroe: antetítulo, titular, subtítulo y llamados a la acción de la voz C. Panel lateral «Registro de verificación» con lecturas grandes (pruebas reales X/Y, 6 módulos, ±3 DE, SHA-256), la línea de IA y el sello.
  3. «Una muestra, del analizador al PDF firmado»: el flujo de 4 pasos como secuencia real numerada.
  4. Módulos como matriz de trazabilidad: código `MOD-…`, referencia y dictamen «CONFORME · n/n», calculado de `traceability.json` por archivo de test del módulo (`verifiedAgainst.testPath`).
  5. «Antes del código: expedientes y mapas»: el párrafo de trayectoria de la voz C.
  6. «Hecho en La Rioja, para cualquier laboratorio»: disponibilidad nacional, local y mundial, más la hoja de ruta de Fase 2 marcada «en desarrollo».
  7. Capacidades: título sin tono de agencia.
  8. Credenciales.
  9. Contacto: «Contame qué se sigue copiando a mano en tu laboratorio…».
- **Acerca:**
  - Textos en la voz C.
  - Bloque territorial con el vértice, las coordenadas y un motivo sutil de curvas de nivel (SVG liviano, solo decorativo, AA).
  - Enlaces a los portfolios anteriores.
- **Verificación:** `tsc`, lint, `build:next`, e2e y una mirada a 1280 y 400 px en claro y oscuro.

## R3 · Módulos, validación, IA y CV
- **Shell de módulo:**
  - Encabezado de documento reducido (`MOD-QC` · referencia · dictamen real).
  - Ficha «¿Qué es esto?», guía, ciencia y glosario con el estilo nuevo.
  - Tokens nuevos en los colores de gráficos de Levey-Jennings, Curva y Margen (N1 tinta con círculo hueco, N2 lacre con cuadrado).
- **Microcopy en `src/content/modules/*.ts` y diccionarios:** las 10 mejoras de `propuestas-de-marca.md` §4, con las 4 de exactitud científica obligatorias:
  - Informe: el hash no prueba que el PDF esté firmado.
  - Margen: k = 2 ≈ 95 % solo con distribución ≈ normal (GUM §6.3), y la cláusula 7.6 de ISO/IEC 17025.
  - QC: 1-2s da ≈ 9 % de falso rechazo con 2 controles y ≈ 18 % con 4.
  - Curva: R² no prueba linealidad; para eso están los residuos.
  - Custodia: «una de las más frecuentes» y «núcleo mínimo de LIMS».
- **Validación e IA:**
  - `validacion` e `ia`: estilo documento.
  - Botón «Abrir el dossier: X/Y pruebas», con el número leído de `traceability.json`.
- **CV:**
  - Estilo de impresión serif con una línea de encabezado de documento (nombre, «CV · <audiencia> · <fecha de revisión>») y el sello en una sola tinta. Sigue en una columna, apto ATS.
  - El proyecto principal se renombra «Portfolio de software para laboratorios».
  - Regenerar los 6 PDFs (siguen en 2 páginas o menos).
- **Verificación:** `tsc`, lint, `npm run build`, e2e y PDFs.

## R4 · Revisión integral y publicación
- Un revisor independiente revisa capturas y código: personalidad, coherencia, AA, móvil, honestidad de los textos y que no haya datos inventados.
- Aplicar los arreglos.
- Lighthouse local y en producción ≥ 90.
- Publicar con `npx vercel@59 deploy --prod --yes` y verificar las URLs.
- Push a `main` con la CI en verde.
