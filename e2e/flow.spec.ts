import { expect, test, type Page } from '@playwright/test';

async function sign(page: Page, button: string, password: string) {
  await page.getByTestId(button).click();
  await page.getByTestId('sign-password').fill(password);
  await page.getByTestId('sign-confirm').click();
  await expect(page.getByRole('dialog')).toBeHidden();
}

test('flujo completo: analizador → control de calidad → firmas → informe PDF', async ({ page }) => {
  await page.goto('/es/modulos/enlace');
  await page.getByTestId('load-astm-example').click();
  await page.getByTestId('parse-message').click();
  await expect(page.getByTestId('parsed-row')).toHaveCount(4);
  await page.getByTestId('import-results').click();
  await expect(page.getByTestId('import-ok')).toBeVisible();

  await page.goto('/es/modulos/custodia');
  await page.getByTestId('sample-M-2026-0101').click();
  await expect(page.getByTestId('sample-status')).toHaveText('En análisis');
  await sign(page, 'sign-reviewed', 'analista123');
  await expect(page.getByTestId('sample-status')).toHaveText('Revisada');

  await page.getByTestId('user-switcher').selectOption('u-validador');
  await page.getByTestId('sign-approved').click();
  await page.getByTestId('sign-password').fill('validador123');
  await page.getByTestId('sign-confirm').click();
  await expect(page.getByTestId('sign-error')).toContainText('GLU-R021');
  await page.getByRole('dialog').getByRole('button', { name: 'Cancelar' }).click();

  await page.goto('/es/modulos/qc');
  await expect(page.getByTestId('run-status-GLU-R021')).toHaveText('Rechazada');
  await page.getByTestId('assist-explain_violation').click();
  await expect(page.getByTestId('assist-draft')).toContainText('sin IA');
  await page.getByTestId('new-run-N1').fill('95.5');
  await page.getByTestId('new-run-N2').fill('251');
  await page.getByTestId('corrective-action').fill('Recalibración y cambio de lote de reactivo');
  await page.getByTestId('add-run').click();
  await expect(page.getByTestId('run-status-GLU-R022')).toHaveText('Aceptada');

  await page.goto('/es/modulos/custodia');
  await page.getByTestId('sample-M-2026-0101').click();
  await page.getByTestId('rerun-sample').click();
  await page.getByTestId('rerun-reason').fill('Repetición tras recalibración');
  await page.getByTestId('rerun-confirm').click();
  await expect(page.getByTestId('sample-status')).toHaveText('En análisis');
  await page.getByTestId('user-switcher').selectOption('u-analista');
  await sign(page, 'sign-reviewed', 'analista123');
  await page.getByTestId('user-switcher').selectOption('u-validador');
  await sign(page, 'sign-approved', 'validador123');
  await expect(page.getByTestId('sample-status')).toHaveText('Liberada');
  await expect(page.getByTestId('audit-chain-status')).toContainText('íntegra');

  await page.goto('/es/modulos/informe');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('download-report-M-2026-0101').click(),
  ]);
  expect(download.suggestedFilename()).toBe('informe-M-2026-0101.pdf');
});

test('las páginas principales cargan en ambos idiomas', async ({ page }) => {
  for (const path of ['/es', '/en', '/es/validacion', '/en/ia', '/es/acerca', '/en/cv/global', '/es/modulos/curva', '/en/modulos/margen']) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(200);
    await expect(page.locator('h1').first()).toBeVisible();
  }
});
