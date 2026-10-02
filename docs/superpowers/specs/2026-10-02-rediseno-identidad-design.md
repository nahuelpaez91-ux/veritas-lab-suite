# Rediseño de identidad: «El expediente» × Documento controlado

**Fecha:** 2026-10-02 · **Estado:** decisiones tomadas por Andrés; falta la aprobación del documento escrito.

**Referencias en el repo:**
- `docs/superpowers/specs/rediseno/direcciones-visuales.html`: maquetas A/B/C. Andrés eligió la C, con elementos de A y de B.
- `docs/superpowers/specs/rediseno/propuestas-de-marca.md`: voces y microcopy. Se eligió la voz C, «El expediente».

## 1. Problema

El sitio publicado se ve como una plantilla:
- Fondo gris claro, verde azulado, IBM Plex y tarjetas redondeadas iguales para todo.
- El titular «sabiendo dónde no ponerla» suena raro y abre hablando de IA.
- La historia de Andrés no aparece arriba de la página: su lugar (La Rioja), su formación en geografía y sus años de expedientes.

## 2. Identidad elegida

**Concepto.** El portfolio se presenta como un *documento controlado* firmado por alguien que pasó ocho años cuidando expedientes. Cada afirmación lleva su referencia y su prueba.

**Elementos tomados de A y de B:**
- De A, el **panel de lecturas** con números grandes en monoespaciada (62/62, 6 módulos, ±3 DE, SHA-256).
- De B, la **firma territorial**: las coordenadas 29°24′S 66°51′W y el símbolo de vértice geodésico. Aparecen en la firma, el pie y la página «Acerca», nunca en el héroe.

### Tokens visuales (de la maqueta C)

| Token | Claro | Oscuro |
|---|---|---|
| bg (papel) | `#F4F3EE` | `#121417` |
| surface (hoja) | `#FFFFFC` | `#181B1F` |
| ink (tinta) | `#15171A` | `#E8E5DD` |
| muted (metadato) | `#55595F` | `#A0A3A8` |
| line | `#BDBBB2` | `#33373D` |
| accent (lacre) | `#7A1E2C` | `#E8909B` |
| ok (conforme) | `#1E5B45` | `#86CFAE` |
| danger | `#B3261E` | `#FF8A80` |
| warn | `#8A5A00` | `#E8B860` |

**Tipografía.** Source Serif 4, con eje óptico, para títulos y texto. Red Hat Mono para códigos, hashes, valores, registros y dictámenes. Reemplazan a IBM Plex.

**Componentes:**
- **Esquinas, sombras y bordes:** sin radios ni sombras. Bordes de 1 px en tinta o línea, y rejillas que comparten bordes, como celdas de una matriz.
- **Encabezado de documento:** bloque con código (`VLS-POR-001`), revisión (= commit corto de `traceability.json`) y vigencia (= fecha de `generatedAt`). Va en la home y, en forma reducida, en cada módulo (`MOD-QC`, `MOD-CUS`…).
- **Datos reales:** no hay datos inventados. Se quitan el «Página 1 de 6», los hashes decorativos y los números de registro ficticios. Si se muestra un hash, es real (último commit o último hash del audit trail de la demo).
- **Registro de verificación (panel lateral de la home):**
  - Pruebas: X/Y, leído de `traceability.json`.
  - Módulos: 6.
  - Referencias: NIST · EURACHEM · Westgard.
  - Marco: 21 CFR 11 · Anexo 11, «diseñado considerando».
- **Sello:** circular de doble anillo en lacre, con «ANDRÉS NAHUEL PÁEZ · LA RIOJA · ARGENTINA» en el contorno y ANP al centro. Reemplaza al monograma actual.
- **Firma del pie:** línea de firma con trazo manuscrito en SVG, nombre y la leyenda «Registros que aguantan una auditoría.» A su lado, el vértice geodésico con las coordenadas.
- **Tarjetas de módulo:** celdas de matriz de trazabilidad con código, referencia y dictamen «CONFORME · n/n» según el resultado real de los tests de ese módulo.
- **Chips y estados:** rectangulares, en mayúsculas monoespaciadas (ACEPTADA, RECHAZADA, CONFORME).
- **Gráficos:** tokens nuevos. N1 en tinta con círculo hueco y N2 en lacre con cuadrado, distinguibles sin color.
- **Imprimible:** el CV mantiene una sola columna apta ATS. Suma tipografía serif, una línea de encabezado de documento y el sello en una sola tinta.

## 3. Voz y textos

- **Voz «El expediente».** Primera persona, frases cortas, objetos concretos (expediente, firma, sello, plazo) y humor seco. No exagera: dice que el hábito se traslada, no que el dominio sea el mismo. Nunca abre con IA.
- **Héroe ES:**
  - Antetítulo: «Andrés Nahuel Páez · La Rioja, Argentina · Software para laboratorios».
  - Titular: «Ocho años cuidando expedientes. Ahora construyo audit trails.»
  - Subtítulo: «Sé qué pasa cuando un registro no dice quién, cuándo ni qué cambió. Acá cada cambio lo dice, y ningún resultado sale sin firma.»
  - Llamados a la acción: «Seguir una muestra de punta a punta» · «Abrir el expediente de validación».
- **Héroe EN:** los equivalentes de `propuestas-de-marca.md`.
- **IA en una línea simple** (fuera del titular): «La IA redacta borradores; los resultados los calcula código con tests.»
- **Trayectoria:** el párrafo C de `propuestas-de-marca.md`, en ES y EN.
- **Títulos de sección:**
  - «Una muestra, del analizador al PDF firmado»
  - «Lo que queda registrado»
  - «Antes del código: expedientes y mapas»
  - «Hecho en La Rioja, para cualquier laboratorio» (sección regional con la hoja de ruta marcada como «en desarrollo»)
- **Microcopy:** se aplican las 10 mejoras de la sección 4 de `propuestas-de-marca.md`. Son obligatorias las 4 de exactitud científica:
  - Informe: el hash no prueba que el PDF esté firmado.
  - Margen: k = 2 ≈ 95 % solo con distribución aproximadamente normal (GUM §6.3).
  - QC: el falso rechazo de 1-2s es ≈ 9 % con 2 controles y ≈ 18 % con 4.
  - Curva: R² solo no prueba linealidad; para eso está el gráfico de residuos.
- **Contacto:** «Contame qué se sigue copiando a mano en tu laboratorio…».

## 3b. Nombre (decisión de Andrés, 2026-10-02)

El sitio deja de llamarse «Veritas Lab Suite». Pasa a ser **«Andrés Nahuel Páez · Portfolio»**, en ES y EN.

**Dónde se usa el nombre nuevo:**
- La marca del encabezado.
- `meta.title` y `meta.shortTitle`.
- `siteName` de Open Graph.
- El título del encabezado de documento de la home: «Portfolio técnico · Andrés Nahuel Páez».
- El banner y el pie del informe PDF.
- El README.
- En el CV, el proyecto principal pasa a llamarse «Portfolio de software para laboratorios» (EN: «Laboratory software portfolio»).

**Lo que no cambia por ahora:**
- El código de documento queda `ANP-POR-001`.
- La URL y el nombre del repositorio `veritas-lab-suite`. Un dominio nuevo se decide aparte con Andrés.

## 4. Alcance

- **Se cambia:**
  - Los tokens globales y las fuentes.
  - Las secciones de la home, el marco del sitio (encabezado, pie, firma y sello) y el shell de módulo (encabezado de documento, fichas y glosario).
  - Los chips y los colores de los gráficos.
  - Los textos ES/EN de home, Acerca, módulos y validación.
  - La impresión del CV, con los PDFs regenerados.
- **No se cambia:**
  - La lógica, las pruebas y los `data-testid` de los que dependen los e2e.
  - La estructura de rutas y el contenido fáctico del CV.
- **Calidad:**
  - Contraste AA en ambos temas.
  - Sin scroll horizontal a 400 px.
  - Lighthouse ≥ 90.
  - 62/62 pruebas unitarias y 9/9 e2e en verde.
  - Publicación manual en Vercel al final.
