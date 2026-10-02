import { expect, test, type Page } from '@playwright/test';

const PATHS = ['/es', '/es/credenciales', '/en/credenciales', '/es/modulos/qc', '/es/modulos/custodia', '/es/modulos/curva', '/es/modulos/margen', '/es/cv/nacional', '/en/validacion'];

// Con isMobile, window.innerWidth crece hasta el ancho del contenido desbordado (el navegador «aleja» la vista)
// y ocultaría el problema: se compara contra el ancho del bloque contenedor inicial (clientWidth).
async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

// Elementos que sobresalen del ancho de la pantalla sin estar dentro de un contenedor desplazable
// (una tabla ancha dentro de overflow-x-auto es correcta; una tarjeta que se sale, no).
async function elementsOutside(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const limit = document.documentElement.clientWidth + 1;
    const scrolls = (el: Element) => ['auto', 'scroll', 'hidden', 'clip'].includes(getComputedStyle(el).overflowX);
    const out: string[] = [];
    for (const el of document.querySelectorAll('main *')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.right <= limit) continue;
      let p = el.parentElement;
      let inside = false;
      while (p && p !== document.body) {
        if (scrolls(p)) {
          inside = true;
          break;
        }
        p = p.parentElement;
      }
      if (!inside) out.push(`${el.tagName.toLowerCase()}.${String(el.getAttribute('class') ?? '').slice(0, 50)} → ${Math.round(r.right)}`);
    }
    return out;
  });
}

for (const path of PATHS) {
  test(`sin scroll horizontal en ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
  });
}

// Estados que solo aparecen después de interactuar (tablas de resultados, simulación): también a 360 px.
for (const width of [412, 360]) {
  test.describe(`después de interactuar (${width} px)`, () => {
    test.use({ viewport: { width, height: 800 } });

    test('Enlace: tras interpretar el mensaje, la tabla se desplaza dentro de su contenedor', async ({ page }) => {
      await page.goto('/es/modulos/enlace');
      await page.getByTestId('load-astm-example').click();
      await page.getByTestId('parse-message').click();
      await expect(page.getByTestId('parsed-row')).toHaveCount(4);
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
      expect(await elementsOutside(page)).toEqual([]);
    });

    test('Margen: tras Monte Carlo, sin scroll horizontal', async ({ page }) => {
      await page.goto('/es/modulos/margen');
      await page.getByTestId('run-mc').click();
      await expect(page.getByTestId('mc-result')).toBeVisible();
      await page.waitForLoadState('networkidle');
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
      expect(await elementsOutside(page)).toEqual([]);
    });
  });
}
