import { expect, test } from '@playwright/test';
import { answer, answerInput, card, openFresh, playRound, setQuestions } from './helpers.ts';

test.beforeEach(async ({ page }) => {
  await openFresh(page);
  await setQuestions(page, 3);
});

for (const family of ['gram', 'meter', 'liter']) {
  test(`plays a ${family} round and remembers the score`, async ({ page }) => {
    await playRound(page, family, [true, false, true]);

    await expect(page.getByText(`Resultat · ${family}`)).toBeVisible();
    await expect(page.getByText('Du fick 2 rätt av 3 tal.')).toBeVisible();
    const squares = page.getByRole('list', { name: 'Svar per tal' }).getByRole('listitem');
    await expect(squares).toHaveText(['Tal 1: rätt', 'Tal 2: fel', 'Tal 3: rätt']);

    await page.getByRole('button', { name: 'klar' }).click();
    await expect(card(page, family)).toContainText('Bäst 2/3 · Senast 2/3');

    await page.reload();
    await expect(card(page, family)).toContainText('Bäst 2/3 · Senast 2/3');
  });
}

test('keeps the best round and updates the last one', async ({ page }) => {
  await playRound(page, 'liter', [true, true, true]);
  await page.getByRole('button', { name: 'klar' }).click();
  await playRound(page, 'liter', [false, true, false]);
  await page.getByRole('button', { name: 'klar' }).click();
  await expect(card(page, 'liter')).toContainText('Bäst 3/3 · Senast 1/3');
  await expect(card(page, 'gram')).not.toContainText('Bäst');
});

test('shows the right answer in Swedish format when wrong', async ({ page }) => {
  await card(page, 'meter').click();
  await answerInput(page).fill('999999');
  await answerInput(page).press('Enter');
  await expect(page.getByText('FEL!', { exact: true })).toBeVisible();
  await expect(page.getByText(/^Rätt svar: [\d\s,]+ (km|m|dm|cm|mm)$/)).toBeVisible();
  await expect(answerInput(page)).toHaveAttribute('readonly', '');
});

test('rätta stays disabled until something is typed', async ({ page }) => {
  await card(page, 'gram').click();
  const check = page.getByRole('button', { name: 'rätta' });
  await expect(check).toBeDisabled();
  await answerInput(page).fill('5');
  await expect(check).toBeEnabled();
});

test('Avsluta leaves a round without saving it', async ({ page }) => {
  await card(page, 'gram').click();
  await answer(page, true);
  await page.getByRole('button', { name: 'Avsluta' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Träning för olika enheter');
  await expect(card(page, 'gram')).not.toContainText('Bäst');
});

test('can be played with the keyboard only', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard navigation is a desktop concern');
  // Closing the settings dialog returned focus to its button; the first card is next.
  await expect(page.getByRole('button', { name: 'Inställningar' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(card(page, 'gram')).toBeFocused();
  await page.keyboard.press('Enter');
  for (const right of [true, true, false]) await answer(page, right);
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'klar' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(card(page, 'gram')).toContainText('Senast 2/3');
});
