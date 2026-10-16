import { expect, test } from '@playwright/test';
import { card, openFresh, SETTINGS_KEY } from './helpers.ts';

test.beforeEach(async ({ page }) => {
  await openFresh(page);
});

function dialog(page: import('@playwright/test').Page) {
  return page.getByRole('dialog', { name: 'Inställningar' });
}

test('changes the round length with − and + and remembers it', async ({ page }) => {
  await page.getByRole('button', { name: 'Inställningar' }).click();
  await dialog(page).getByRole('button', { name: 'Färre tal' }).click();
  await dialog(page).getByRole('button', { name: 'Färre tal' }).click();
  await dialog(page).getByRole('button', { name: 'Fler tal' }).click();
  await expect(dialog(page).getByRole('textbox', { name: 'Tal per runda' })).toHaveValue('29');
  await dialog(page).getByRole('button', { name: 'Klar' }).click();

  await page.reload();
  await expect(page.getByText('29 tal per runda.', { exact: false })).toBeVisible();
  await card(page, 'liter').click();
  await expect(page.getByText('Tal 1 av 29')).toBeVisible();
});

test('clamps a typed round length', async ({ page }) => {
  await page.getByRole('button', { name: 'Inställningar' }).click();
  await dialog(page).getByRole('textbox', { name: 'Tal per runda' }).fill('500');
  await dialog(page).getByRole('button', { name: 'Klar' }).click();
  await expect(page.getByText('60 tal per runda.', { exact: false })).toBeVisible();
});

test('closes with Escape and returns focus to the settings button', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Escape is a keyboard concern');
  const button = page.getByRole('button', { name: 'Inställningar' });
  await button.click();
  await expect(dialog(page)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog(page)).toBeHidden();
  await expect(button).toBeFocused();
});

test('hides the unit ladder and remembers it', async ({ page }) => {
  await page.getByRole('button', { name: 'Inställningar' }).click();
  await dialog(page).getByRole('switch', { name: 'Visa enhetsstegen' }).click();
  await expect(
    dialog(page).getByRole('switch', { name: 'Visa faktorerna på stegen' }),
  ).toBeDisabled();
  await dialog(page).getByRole('button', { name: 'Klar' }).click();

  await page.reload();
  expect(
    JSON.parse((await page.evaluate((k) => localStorage.getItem(k), SETTINGS_KEY))!),
  ).toMatchObject({ showLadder: false });
  await card(page, 'meter').click();
  await expect(page.getByRole('heading', { name: /^Enhetsstegen/ })).toHaveCount(0);
});

test('hides only the factors on the ladder', async ({ page }) => {
  await page.getByRole('button', { name: 'Inställningar' }).click();
  await dialog(page).getByRole('switch', { name: 'Visa faktorerna på stegen' }).click();
  await dialog(page).getByRole('button', { name: 'Klar' }).click();
  await card(page, 'liter').click();
  await expect(page.getByRole('heading', { name: /^Enhetsstegen/ })).toBeVisible();
  await expect(page.getByText(/[×÷]10/)).toHaveCount(0);
});
