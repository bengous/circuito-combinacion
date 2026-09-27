import { expect, openCircuit, schematic, test } from './fixtures';

test.use({ viewport: { width: 390, height: 664 } });

test('toggling switches turns the lamp off and on', async ({ page }) => {
  await openCircuit(page, 'combinacion-con-cruce');
  const status = page.getByRole('status');
  await expect(status).toHaveText('Lámpara encendida');

  await page.getByRole('button', { name: /^Cruce, Directo/ }).click();
  await expect(status).toHaveText('Lámpara apagada');
  await expect(page.getByText(/Cruce: cruzado\./)).toBeVisible();

  await page.getByRole('button', { name: /^Llave 2, Posición A/ }).click();
  await expect(status).toHaveText('Lámpara encendida');
});

test('the keyboard works on the drawing', async ({ page }) => {
  await openCircuit(page, 'combinacion-simple');
  await page.getByRole('button', { name: /^Llave 1/ }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status')).toHaveText('Lámpara apagada');
});

test('the picker changes the circuit and the address', async ({ page }) => {
  await openCircuit(page, 'combinacion-simple');
  const picker = page.getByRole('group', { name: 'Puntos de control' });
  await picker.getByRole('button', { name: '4 puntos' }).click();

  await expect(page.getByRole('heading', { name: 'Combinación con dos cruces' })).toBeVisible();
  await expect(page).toHaveURL(/#combinacion-dos-cruces$/);
  await expect(picker.getByRole('button', { name: '4 puntos' })).toBeFocused();
  await expect(page.getByRole('button', { name: /^Cruce 2/ })).toBeVisible();
});

test('a broken link opens the first circuit', async ({ page }) => {
  await page.goto('./#%E0%A4%A');
  await expect(page.getByRole('heading', { name: 'Combinación simple' })).toBeVisible();
});

test.describe('settings dialog', () => {
  test.use({ settings: { textSize: 'huge' } });

  test('opens after scrolling, stays on screen and closes three ways', async ({ page }) => {
    await openCircuit(page, 'combinacion-dos-cruces');
    await page.mouse.wheel(0, 2000);
    const dialog = page.getByRole('dialog', { name: 'Ajustes' });

    await page.getByRole('button', { name: 'Ajustes' }).click();
    await expect(dialog).toBeInViewport({ ratio: 1 });
    await expect(page.getByRole('button', { name: 'Listo' })).toBeInViewport();
    await page.getByRole('button', { name: 'Listo' }).click();
    await expect(dialog).toBeHidden();

    await page.getByRole('button', { name: 'Ajustes' }).click();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();

    await page.getByRole('button', { name: 'Ajustes' }).click();
    await page.mouse.click(4, 4); // the dimmed area around the sheet
    await expect(dialog).toBeHidden();
  });
});

test('the demo plays the combinations and stops', async ({ page }) => {
  await openCircuit(page, 'combinacion-simple');
  await page.getByRole('button', { name: 'Demo' }).click();
  // The first step moves a switch after 1.5 s: the message then says which one.
  await expect(page.getByText(/^Llave \d: posición [ab]\./i)).toBeVisible({ timeout: 4000 });
  await page.getByRole('button', { name: 'Parar' }).click();
  await expect(page.getByRole('button', { name: 'Demo' })).toBeVisible();
});

test('settings survive a reload', async ({ page }) => {
  await openCircuit(page, 'combinacion-simple');
  await page.getByRole('button', { name: 'Ajustes' }).click();
  const dialog = page.getByRole('dialog', { name: 'Ajustes' });
  await dialog.getByRole('button', { name: 'Día' }).click();
  await dialog.getByRole('button', { name: 'Muy grande' }).click();
  await dialog.getByRole('button', { name: 'Listo' }).click();

  await page.reload();
  await expect(schematic(page)).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'day');
  await expect(page.locator('html')).toHaveCSS('--text-scale', '1.3');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#f6f8fa');
});
