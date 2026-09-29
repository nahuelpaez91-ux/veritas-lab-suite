# Fase 1 · Parte 1: Base (T1–T6)

> Parte del plan `2026-09-29-fase1-veritas-lab-suite.md`. Leé primero ahí las convenciones.

---

### Task 1: Scaffold de Next.js y dependencias

**Files:**
- Create: todo el esqueleto de `create-next-app`: `package.json`, `tsconfig.json`, `src/app/*`, `eslint.config.mjs`, `postcss.config.mjs`, `next.config.ts`, `.gitignore`.

- [ ] **Step 1: Crear la app en la carpeta actual**

La carpeta ya tiene `docs/` y `.git/`, que create-next-app acepta.

```bash
npx --yes create-next-app@16.3.7 . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
```

Esperado: termina con `Success! Created portfolio-laboratorios-ciencia`. Si pregunta algo, aceptar el valor por defecto.

- [ ] **Step 2: Instalar dependencias**

```bash
npm i recharts @react-pdf/renderer qrcode zod @anthropic-ai/sdk
npm i -D vitest vite-tsconfig-paths @playwright/test tsx @types/qrcode @electric-sql/pglite
```

- [ ] **Step 3: Verificar que compila**

Run: `npm run build`
Esperado: `✓ Compiled successfully` y la ruta `/` listada.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 16 con TypeScript y Tailwind

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Tooling de tests y scripts

**Files:**
- Create: `vitest.config.mts`, `playwright.config.ts`, `src/lib/smoke.test.ts` (se borra en el Step 5)
- Modify: `package.json` (scripts), `.gitignore`

- [ ] **Step 1: Configurar Vitest**

`vitest.config.mts`:

```ts
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    testTimeout: 30_000,
  },
});
```

- [ ] **Step 2: Configurar Playwright**

`playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: 'http://localhost:3000', trace: 'retain-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, testIgnore: /responsive\.spec\.ts/ },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /responsive\.spec\.ts/ },
  ],
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000/es',
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
```

- [ ] **Step 3: Scripts en `package.json`**

Reemplazar el bloque `"scripts"` completo por el siguiente. `build` genera la matriz de trazabilidad antes de compilar, así un test roto frena el deploy. `build:next` es el build pelado.

```json
"scripts": {
  "dev": "next dev",
  "build": "npm run traceability && next build",
  "build:next": "next build",
  "start": "next start",
  "lint": "eslint",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:report": "vitest run --reporter=default --reporter=json --outputFile.json=reports/vitest.json",
  "traceability": "npm run test:report && tsx scripts/build-traceability.ts",
  "test:e2e": "playwright test",
  "cv:pdf": "tsx scripts/export-cv-pdf.ts"
}
```

Mientras no exista `scripts/build-traceability.ts` (llega en T29), usar `npm run build:next` para compilar.

- [ ] **Step 4: Ignorar artefactos**

Agregar al final de `.gitignore`:

```
# tests
/reports
/test-results
/playwright-report
```

- [ ] **Step 5: Test de humo y verificación**

`src/lib/smoke.test.ts`:

```ts
import { it, expect } from 'vitest';

it('vitest funciona', () => {
  expect(1 + 1).toBe(2);
});
```

Run: `npx vitest run`
Esperado: `1 passed`. Después borrar el archivo con `rm src/lib/smoke.test.ts`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: configurar Vitest, Playwright y scripts

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Sistema visual (tokens, estilos base)

**Files:**
- Modify: `src/app/globals.css` (reemplazo completo)
- Create: `src/components/ui/styles.ts`

- [ ] **Step 1: Reemplazar `src/app/globals.css`**

```css
@import "tailwindcss";

@theme {
  --color-bg: #f6f8f9;
  --color-surface: #ffffff;
  --color-ink: #0f1b24;
  --color-muted: #5b6b76;
  --color-line: #dde4e8;
  --color-accent: #0e7c7b;
  --color-accent-ink: #ffffff;
  --color-accent-soft: #e3f3f2;
  --color-ok: #15803d;
  --color-warn: #b45309;
  --color-danger: #b91c1c;
  --font-sans: var(--font-plex-sans), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-plex-mono), ui-monospace, monospace;
}

:root {
  color-scheme: light;
}

@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
    --color-bg: #0b1318;
    --color-surface: #111c22;
    --color-ink: #e6eef2;
    --color-muted: #93a4ae;
    --color-line: #22313a;
    --color-accent: #2bb3b1;
    --color-accent-ink: #04201f;
    --color-accent-soft: #0f2b2b;
    --color-ok: #4ade80;
    --color-warn: #f59e0b;
    --color-danger: #f87171;
  }
}

@media print {
  :root {
    color-scheme: light;
    --color-bg: #ffffff;
    --color-surface: #ffffff;
    --color-ink: #000000;
    --color-muted: #333333;
    --color-line: #cccccc;
    --color-accent: #0e5e5d;
  }
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--color-bg);
  color: var(--color-ink);
  font-family: var(--font-sans);
}

dialog::backdrop {
  background: rgb(0 0 0 / 0.45);
}
```

- [ ] **Step 2: Clases reutilizables**

`src/components/ui/styles.ts`:

```ts
export const card = 'rounded-xl border border-line bg-surface p-4';
export const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-ink hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40';
export const btnSecondary =
  'inline-flex items-center justify-center gap-2 rounded-md border border-line bg-surface px-3 py-1.5 text-sm hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40';
export const input =
  'w-full rounded-md border border-line bg-bg px-2 py-1.5 text-sm focus:border-accent focus:outline-none';
export const label = 'block text-sm font-medium';
export const table = 'w-full border-collapse text-left text-sm [&_th]:border-b [&_th]:border-line [&_th]:px-2 [&_th]:py-1.5 [&_th]:font-semibold [&_td]:border-b [&_td]:border-line [&_td]:px-2 [&_td]:py-1.5';
export const tableWrap = 'overflow-x-auto';
export const h2 = 'text-xl font-semibold';
export const h3 = 'text-base font-semibold';
```

- [ ] **Step 3: Verificar**

Run: `npm run build:next`
Esperado: compila sin errores.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: tokens visuales claro/oscuro/impresión y clases base

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: i18n, root layout `[lang]` y redirect

**Files:**
- Delete: `src/app/layout.tsx`, `src/app/page.tsx`
- Create: `src/lib/i18n/config.ts`, `src/lib/i18n/get-dictionary.ts`, `src/lib/i18n/dictionaries/types.ts`, `src/lib/i18n/dictionaries/es/index.ts`, `src/lib/i18n/dictionaries/es/base.ts`, `src/lib/i18n/dictionaries/en/index.ts`, `src/lib/i18n/dictionaries/en/base.ts`, `src/app/[lang]/layout.tsx`, `src/app/[lang]/page.tsx`
- Modify: `next.config.ts` (reemplazo completo)

- [ ] **Step 1: Configuración de idiomas**

`src/lib/i18n/config.ts`:

```ts
export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es';

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
```

- [ ] **Step 2: Diccionario base en español**

`src/lib/i18n/dictionaries/es/base.ts`:

```ts
export const base = {
  meta: {
    title: 'Andrés Nahuel Páez · Software para laboratorios',
    shortTitle: 'Veritas Lab Suite',
    description:
      'Portfolio de software para laboratorios: control de calidad Westgard, trazabilidad de muestras con audit trail, integración ASTM/HL7, calibración e incertidumbre. Cálculos verificados contra referencias publicadas.',
  },
  nav: {
    label: 'Navegación principal',
    modules: 'Módulos',
    validation: 'Validación',
    ai: 'Uso de IA',
    cv: 'CV',
    about: 'Acerca',
    language: 'Cambiar idioma a inglés',
  },
  roles: { analyst: 'Analista', validator: 'Validador/a', admin: 'Administrador' },
  demoBar: {
    env: 'AMBIENTE DEMO',
    user: 'Usuario',
    passwordHint: 'contraseña de demo',
    reset: 'Reiniciar datos',
    resetConfirm: '¿Reiniciar? Se borran tus cambios.',
    yes: 'Sí, reiniciar',
    no: 'Cancelar',
    loading: 'Cargando datos de laboratorio…',
    disclaimer:
      'Demo educativa, no validada para uso GxP. Diseñada considerando 21 CFR Part 11, EU GMP Anexo 11 y ANMAT Disp. 4159/2023 (Anexo 6). Funciona en tu navegador con datos de ejemplo o sintéticos, declarados en cada módulo.',
  },
  signature: { designed: 'Diseñado y desarrollado por', repo: 'Código fuente' },
  module: {
    whatIsThis: '¿Qué es esto?',
    whatSolves: 'Qué resuelve',
    howItWorks: 'Cómo funciona',
    dataSources: 'De dónde saldrían los datos reales',
    variable: 'Variable',
    source: 'Fuente real',
    whereElse: 'Dónde más se aplica',
    guide: 'Guía paso a paso',
    science: 'La ciencia detrás',
    formula: 'Fórmula',
    standard: 'Norma o referencia',
    workedExample: 'Ejemplo resuelto',
    glossary: 'Glosario',
    verified: 'Verificado contra',
    viewTest: 'ver test',
    close: 'Cerrar',
    back: 'Volver al portfolio',
    exportCsv: 'Exportar CSV',
  },
  errors: {
    bad_password: 'Contraseña incorrecta: la firma exige volver a autenticarse',
    forbidden_role: 'Tu rol no tiene permiso para esta firma',
    invalid_transition: 'La muestra no está en un estado que permita esta acción',
    same_person: 'Segregación de funciones: quien revisó no puede aprobar la misma revisión',
    release_blocked: 'Liberación bloqueada por control de calidad',
    sample_not_found: 'Muestra inexistente',
    no_accepted_run: 'No hay una corrida de control aceptada para repetir',
    no_results: 'La muestra no tiene resultados',
    duplicate_sample: 'Ya existe una muestra con ese ID',
    invalid_run: 'Corrida de control inválida: cargá un valor numérico por nivel',
    reason_required: 'Se requiere un motivo o acción correctiva documentada',
    invalid_sample: 'Completá el ID de muestra, el ID de paciente y el nombre',
  },
  runStatus: { accept: 'Aceptada', warning: 'Advertencia', reject: 'Rechazada' },
  sampleStatus: {
    received: 'Recibida',
    in_analysis: 'En análisis',
    reviewed: 'Revisada',
    released: 'Liberada',
    rejected: 'Rechazada',
  },
};
```

- [ ] **Step 3: Índice y tipo del diccionario**

`src/lib/i18n/dictionaries/es/index.ts`:

```ts
import { base } from './base';

export const es = {
  ...base,
  tools: {},
};
```

`src/lib/i18n/dictionaries/types.ts`:

```ts
import type { es } from './es';

export type Dictionary = typeof es;
```

- [ ] **Step 4: Diccionario base en inglés**

`src/lib/i18n/dictionaries/en/base.ts`:

```ts
import type { base as esBase } from '../es/base';

export const base: typeof esBase = {
  meta: {
    title: 'Andrés Nahuel Páez · Laboratory software',
    shortTitle: 'Veritas Lab Suite',
    description:
      'Laboratory software portfolio: Westgard quality control, sample traceability with audit trail, ASTM/HL7 integration, calibration and measurement uncertainty. Calculations verified against published references.',
  },
  nav: {
    label: 'Main navigation',
    modules: 'Modules',
    validation: 'Validation',
    ai: 'AI use',
    cv: 'CV',
    about: 'About',
    language: 'Switch language to Spanish',
  },
  roles: { analyst: 'Analyst', validator: 'Reviewer/Approver', admin: 'Administrator' },
  demoBar: {
    env: 'DEMO ENVIRONMENT',
    user: 'User',
    passwordHint: 'demo password',
    reset: 'Reset data',
    resetConfirm: 'Reset? Your changes will be lost.',
    yes: 'Yes, reset',
    no: 'Cancel',
    loading: 'Loading laboratory data…',
    disclaimer:
      'Educational demo, not validated for GxP use. Designed with 21 CFR Part 11, EU GMP Annex 11 and ANMAT Disp. 4159/2023 (Annex 6) in mind. Runs in your browser with example or synthetic data, declared in each module.',
  },
  signature: { designed: 'Designed and built by', repo: 'Source code' },
  module: {
    whatIsThis: 'What is this?',
    whatSolves: 'What it solves',
    howItWorks: 'How it works',
    dataSources: 'Where real data would come from',
    variable: 'Variable',
    source: 'Real source',
    whereElse: 'Where else it applies',
    guide: 'Step-by-step guide',
    science: 'The science behind it',
    formula: 'Formula',
    standard: 'Standard or reference',
    workedExample: 'Worked example',
    glossary: 'Glossary',
    verified: 'Verified against',
    viewTest: 'view test',
    close: 'Close',
    back: 'Back to portfolio',
    exportCsv: 'Export CSV',
  },
  errors: {
    bad_password: 'Wrong password: signing requires re-authentication',
    forbidden_role: 'Your role is not allowed to apply this signature',
    invalid_transition: 'The sample is not in a state that allows this action',
    same_person: 'Segregation of duties: the reviewer cannot approve the same revision',
    release_blocked: 'Release blocked by quality control',
    sample_not_found: 'Sample not found',
    no_accepted_run: 'There is no accepted control run to repeat on',
    no_results: 'The sample has no results',
    duplicate_sample: 'A sample with that ID already exists',
    invalid_run: 'Invalid control run: enter one numeric value per level',
    reason_required: 'A documented reason or corrective action is required',
    invalid_sample: 'Sample ID, patient ID and name are required',
  },
  runStatus: { accept: 'Accepted', warning: 'Warning', reject: 'Rejected' },
  sampleStatus: {
    received: 'Received',
    in_analysis: 'In analysis',
    reviewed: 'Reviewed',
    released: 'Released',
    rejected: 'Rejected',
  },
};
```

`src/lib/i18n/dictionaries/en/index.ts`:

```ts
import type { Dictionary } from '../types';
import { base } from './base';

export const en: Dictionary = {
  ...base,
  tools: {},
};
```

- [ ] **Step 5: Acceso al diccionario**

`src/lib/i18n/get-dictionary.ts`:

```ts
import type { Locale } from './config';
import { en } from './dictionaries/en';
import { es } from './dictionaries/es';
import type { Dictionary } from './dictionaries/types';

export type { Dictionary };

export function getDictionary(locale: Locale): Dictionary {
  return locale === 'en' ? en : es;
}
```

- [ ] **Step 6: Redirect de `/` a `/es`**

Reemplazar `next.config.ts`:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: '/', destination: '/es', permanent: false }];
  },
};

export default nextConfig;
```

- [ ] **Step 7: Root layout por idioma y home provisoria**

```bash
rm src/app/layout.tsx src/app/page.tsx
```

`src/app/[lang]/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import '../globals.css';
import { isLocale, locales } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

const sans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-plex-sans' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex-mono' });

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: { default: dict.meta.title, template: `%s · ${dict.meta.shortTitle}` },
    description: dict.meta.description,
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <html lang={lang} className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen antialiased">
        <main>{children}</main>
      </body>
    </html>
  );
}
```

`src/app/[lang]/page.tsx` (provisoria; T31 la reemplaza):

```tsx
import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  return <h1 className="p-8 text-2xl font-semibold">{dict.meta.title}</h1>;
}
```

- [ ] **Step 8: Verificar**

Run: `npm run build:next`
Esperado: compila y lista `/[lang]` con `/es` y `/en` pre-renderizadas.

Después correr `npm run dev` y abrir `http://localhost:3000`. Tiene que redirigir a `/es` y mostrar el título. `/en` muestra "Andrés Nahuel Páez · Laboratory software". Detener el servidor.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: i18n ES/EN con root layout por idioma

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Perfil, firma y marco del sitio

**Files:**
- Create: `src/content/profile.ts`, `src/components/layout/Monogram.tsx`, `src/components/layout/Signature.tsx`, `src/components/layout/LangSwitch.tsx`, `src/components/layout/SiteHeader.tsx`, `src/components/layout/SiteFooter.tsx`
- Modify: `src/app/[lang]/layout.tsx`

- [ ] **Step 1: Datos de perfil (única fuente de verdad)**

`src/content/profile.ts`:

```ts
export const profile = {
  name: 'Andrés Nahuel Páez',
  initials: 'ANP',
  email: 'nahuelpaez91@gmail.com',
  phone: '+54 9 380 426 2454',
  whatsappUrl: 'https://wa.me/543804262454',
  location: 'La Rioja, Argentina',
  timezone: 'UTC−3',
  github: 'https://github.com/nahuelpaez91-ux',
  repo: 'https://github.com/nahuelpaez91-ux/veritas-lab-suite',
  siteUrl: 'https://veritas-lab-suite.vercel.app',
  linkedin: null as string | null,
};
```

- [ ] **Step 2: Monograma (sello)**

`src/components/layout/Monogram.tsx`:

```tsx
export function Monogram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} role="img" aria-label="ANP">
      <circle cx="20" cy="20" r="18.5" fill="none" stroke="var(--color-accent)" strokeWidth="2" />
      <circle cx="20" cy="20" r="14.5" fill="none" stroke="var(--color-accent)" strokeWidth="0.75" strokeDasharray="2 2" />
      <text
        x="20"
        y="24"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill="currentColor"
        fontFamily="var(--font-mono)"
      >
        ANP
      </text>
    </svg>
  );
}
```

- [ ] **Step 3: Firma**

`src/components/layout/Signature.tsx`:

```tsx
import { profile } from '@/content/profile';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import { Monogram } from './Monogram';

export function Signature({ dict }: { dict: Dictionary }) {
  return (
    <div className="flex items-center gap-3">
      <Monogram className="h-11 w-11 shrink-0 text-ink" />
      <div className="text-sm">
        <p className="text-xs uppercase tracking-widest text-muted">{dict.signature.designed}</p>
        <p className="font-semibold text-ink">{profile.name}</p>
        <p className="text-xs text-muted">
          <a className="hover:text-accent" href={profile.repo}>
            {dict.signature.repo}
          </a>
          {' · '}
          <a className="hover:text-accent" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Selector de idioma**

`src/components/layout/LangSwitch.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Locale } from '@/lib/i18n/config';

export function LangSwitch({ lang, label }: { lang: Locale; label: string }) {
  const pathname = usePathname() ?? `/${lang}`;
  const other: Locale = lang === 'es' ? 'en' : 'es';
  const target = pathname.replace(/^\/(es|en)(?=\/|$)/, `/${other}`);
  return (
    <Link
      href={target}
      hrefLang={other}
      aria-label={label}
      className="rounded border border-line px-2 py-0.5 font-mono text-xs uppercase hover:border-accent hover:text-accent"
    >
      {other}
    </Link>
  );
}
```

- [ ] **Step 5: Encabezado y pie**

`src/components/layout/SiteHeader.tsx`:

```tsx
import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import { LangSwitch } from './LangSwitch';
import { Monogram } from './Monogram';

export function SiteHeader({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const links = [
    { href: `/${lang}#modulos`, label: dict.nav.modules },
    { href: `/${lang}/validacion`, label: dict.nav.validation },
    { href: `/${lang}/ia`, label: dict.nav.ai },
    { href: `/${lang}/cv/${lang === 'en' ? 'global' : 'nacional'}`, label: dict.nav.cv },
    { href: `/${lang}/acerca`, label: dict.nav.about },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href={`/${lang}`} className="flex items-center gap-2 font-semibold">
          <Monogram className="h-8 w-8 text-ink" />
          <span>Veritas Lab Suite</span>
        </Link>
        <nav aria-label={dict.nav.label} className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-accent">
              {l.label}
            </Link>
          ))}
          <LangSwitch lang={lang} label={dict.nav.language} />
        </nav>
      </div>
    </header>
  );
}
```

`src/components/layout/SiteFooter.tsx`:

```tsx
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import { Signature } from './Signature';

export function SiteFooter({ dict }: { dict: Dictionary }) {
  return (
    <footer className="mt-16 border-t border-line bg-surface print:hidden">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between">
        <Signature dict={dict} />
        <p className="max-w-md text-xs text-muted">{dict.demoBar.disclaimer}</p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 6: Usar encabezado y pie en el layout**

En `src/app/[lang]/layout.tsx`, agregar los imports:

```tsx
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
```

Y reemplazar el `return` por:

```tsx
  const dict = getDictionary(lang);
  return (
    <html lang={lang} className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen antialiased">
        <SiteHeader lang={lang} dict={dict} />
        <main>{children}</main>
        <SiteFooter dict={dict} />
      </body>
    </html>
  );
```

- [ ] **Step 7: Verificar**

1. Run: `npm run build:next && npm run lint`. Esperado: sin errores.
2. Con `npm run dev`:
   - `/es` muestra el header con el sello ANP y el footer "Diseñado y desarrollado por Andrés Nahuel Páez".
   - El botón `EN` lleva a `/en`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: encabezado, pie y firma ANP del autor

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Shell de módulo (ficha explicativa reutilizable)

**Files:**
- Create: `src/content/types.ts`, `src/components/module/VerifiedBadge.tsx`, `src/components/module/WhatIsThisModal.tsx`, `src/components/module/StepGuide.tsx`, `src/components/module/ScienceSection.tsx`, `src/components/module/Glossary.tsx`, `src/components/module/Term.tsx`, `src/components/module/ModuleShell.tsx`

- [ ] **Step 1: Tipos de contenido de módulo**

`src/content/types.ts`:

```ts
import type { Locale } from '@/lib/i18n/config';

export type ModuleSlug = 'enlace' | 'qc' | 'custodia' | 'informe' | 'curva' | 'margen';

export interface ModuleContent {
  name: string;
  area: string;
  tagline: string;
  whatSolves: string;
  howItWorks: string[];
  dataSources: { variable: string; source: string }[];
  whereElse: string[];
  steps: string[];
  science: { formula: string; standard: string; workedExample: string };
  glossary: { term: string; definition: string }[];
  verifiedAgainst: { label: string; testPath: string };
}

export type LocalizedModule = Record<Locale, ModuleContent>;
```

- [ ] **Step 2: Componentes de la ficha**

`src/components/module/VerifiedBadge.tsx`:

```tsx
import { profile } from '@/content/profile';
import type { ModuleContent } from '@/content/types';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

export function VerifiedBadge({ dict, verified }: { dict: Dictionary; verified: ModuleContent['verifiedAgainst'] }) {
  return (
    <p className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-full border border-ok/40 bg-ok/10 px-3 py-1 text-xs text-ok">
      <span aria-hidden="true">✔</span>
      <span>
        {dict.module.verified}: {verified.label}
      </span>
      <a className="underline" href={`${profile.repo}/blob/main/${verified.testPath}`}>
        {dict.module.viewTest}
      </a>
    </p>
  );
}
```

`src/components/module/WhatIsThisModal.tsx`:

```tsx
'use client';

import { useRef } from 'react';
import type { ModuleContent } from '@/content/types';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import { btnPrimary, h3, table, tableWrap } from '@/components/ui/styles';

export function WhatIsThisModal({ dict, content }: { dict: Dictionary; content: ModuleContent }) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        data-testid="what-is-this"
        onClick={() => ref.current?.showModal()}
        className="rounded-full border border-accent px-4 py-2 text-sm font-medium text-accent hover:bg-accent-soft"
      >
        ⓘ {dict.module.whatIsThis}
      </button>
      <dialog
        ref={ref}
        aria-label={content.name}
        className="m-auto w-[min(48rem,calc(100vw-2rem))] rounded-xl border border-line bg-surface p-0 text-ink"
      >
        <div className="max-h-[80vh] space-y-4 overflow-y-auto p-6">
          <h2 className="text-2xl font-semibold">{content.name}</h2>
          <section>
            <h3 className={h3}>{dict.module.whatSolves}</h3>
            <p className="mt-1 text-sm leading-relaxed">{content.whatSolves}</p>
          </section>
          <section>
            <h3 className={h3}>{dict.module.howItWorks}</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
              {content.howItWorks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section>
            <h3 className={h3}>{dict.module.dataSources}</h3>
            <div className={`${tableWrap} mt-1`}>
              <table className={table}>
                <thead>
                  <tr>
                    <th>{dict.module.variable}</th>
                    <th>{dict.module.source}</th>
                  </tr>
                </thead>
                <tbody>
                  {content.dataSources.map((row) => (
                    <tr key={row.variable}>
                      <td className="font-medium">{row.variable}</td>
                      <td>{row.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section>
            <h3 className={h3}>{dict.module.whereElse}</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
              {content.whereElse.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <form method="dialog" className="text-right">
            <button className={btnPrimary}>{dict.module.close}</button>
          </form>
        </div>
      </dialog>
    </>
  );
}
```

`src/components/module/StepGuide.tsx`:

```tsx
export function StepGuide({ title, steps }: { title: string; steps: string[] }) {
  return (
    <section aria-label={title} className="rounded-xl border border-accent/30 bg-accent-soft p-4">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-accent">{title}</h2>
      <ol className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <li key={step} className="flex gap-3 text-sm">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-xs text-accent-ink">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
```

`src/components/module/ScienceSection.tsx`:

```tsx
import type { ModuleContent } from '@/content/types';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

export function ScienceSection({ dict, science }: { dict: Dictionary; science: ModuleContent['science'] }) {
  return (
    <section className="mt-10" aria-labelledby="science-title">
      <h2 id="science-title" className="text-xl font-semibold">
        {dict.module.science}
      </h2>
      <div className="mt-3 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-4">
          <h3 className="text-sm font-semibold text-muted">{dict.module.formula}</h3>
          <pre className="mt-2 overflow-x-auto whitespace-pre font-mono text-xs leading-relaxed">{science.formula}</pre>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <h3 className="text-sm font-semibold text-muted">{dict.module.workedExample}</h3>
          <pre className="mt-2 overflow-x-auto whitespace-pre font-mono text-xs leading-relaxed">
            {science.workedExample}
          </pre>
        </div>
      </div>
      <p className="mt-3 text-sm">
        <span className="font-semibold">{dict.module.standard}: </span>
        {science.standard}
      </p>
    </section>
  );
}
```

`src/components/module/Glossary.tsx`:

```tsx
export function Glossary({ title, items }: { title: string; items: { term: string; definition: string }[] }) {
  return (
    <section className="mt-10" aria-labelledby="glossary-title">
      <h2 id="glossary-title" className="text-xl font-semibold">
        {title}
      </h2>
      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.term} className="rounded-lg border border-line bg-surface p-3">
            <dt className="font-mono text-sm font-semibold text-accent">{item.term}</dt>
            <dd className="mt-1 text-sm text-muted">{item.definition}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
```

`src/components/module/Term.tsx` (tooltip para términos técnicos dentro de las herramientas):

```tsx
import type { ReactNode } from 'react';

export function Term({ children, definition }: { children: ReactNode; definition: string }) {
  return (
    <abbr title={definition} className="cursor-help underline decoration-dotted underline-offset-2">
      {children}
    </abbr>
  );
}
```

- [ ] **Step 3: Shell del módulo**

La barra de demo se agrega en T19, cuando exista el store.

`src/components/module/ModuleShell.tsx`:

```tsx
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { ModuleContent } from '@/content/types';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import { Glossary } from './Glossary';
import { ScienceSection } from './ScienceSection';
import { StepGuide } from './StepGuide';
import { VerifiedBadge } from './VerifiedBadge';
import { WhatIsThisModal } from './WhatIsThisModal';

export function ModuleShell({
  lang,
  dict,
  content,
  children,
}: {
  lang: Locale;
  dict: Dictionary;
  content: ModuleContent;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-8">
      <div className="flex flex-wrap items-start justify-between gap-4 py-6">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">{content.area}</p>
          <h1 className="mt-1 text-3xl font-semibold">{content.name}</h1>
          <p className="mt-2 text-muted">{content.tagline}</p>
          <VerifiedBadge dict={dict} verified={content.verifiedAgainst} />
        </div>
        <WhatIsThisModal dict={dict} content={content} />
      </div>
      <StepGuide title={dict.module.guide} steps={content.steps} />
      <section className="mt-6" aria-label={content.name}>
        {children}
      </section>
      <ScienceSection dict={dict} science={content.science} />
      <Glossary title={dict.module.glossary} items={content.glossary} />
      <p className="mt-10">
        <Link href={`/${lang}#modulos`} className="text-sm text-accent hover:underline">
          ← {dict.module.back}
        </Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit && npm run lint`
Esperado: sin errores. Todavía no hay ninguna página que use el shell; se valida en T21.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: shell de módulo con ficha, guía, ciencia y glosario

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```
