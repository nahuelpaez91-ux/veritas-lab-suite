import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';
import { audiences, cvPdfName } from '../src/content/cv';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const LANGS = ['es', 'en'] as const;

async function main() {
  mkdirSync('public/cv', { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const lang of LANGS) {
    for (const audience of audiences) {
      await page.goto(`${BASE}/${lang}/cv/${audience}`, { waitUntil: 'networkidle' });
      await page.emulateMedia({ media: 'print' });
      const path = `public/cv/${cvPdfName(audience, lang)}`;
      await page.pdf({ path, format: 'A4', printBackground: false, preferCSSPageSize: true });
      console.log(`✔ ${path}`);
    }
  }
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
