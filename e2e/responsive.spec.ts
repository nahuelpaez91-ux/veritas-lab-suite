import { expect, test } from '@playwright/test';

const PATHS = ['/es', '/es/credenciales', '/en/credenciales', '/es/modulos/qc', '/es/modulos/custodia', '/es/modulos/curva', '/es/modulos/margen', '/es/cv/nacional', '/en/validacion'];

for (const path of PATHS) {
  test(`sin scroll horizontal en ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}
