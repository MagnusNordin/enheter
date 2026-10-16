import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { answerInput, card, openFresh, playRound, setQuestions } from './helpers.ts';

// Runs in a real browser, so unlike the unit checks this includes colour contrast.
async function expectAccessible(page: Page, name: string) {
  const results = await new AxeBuilder({ page }).analyze();
  const violations = results.violations.map(
    (v) => `${v.id}: ${v.help} → ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
  );
  expect(violations, `${name}:\n${violations.join('\n')}`).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  await openFresh(page);
});

test('start screen and settings dialog', async ({ page }) => {
  await expectAccessible(page, 'start');
  await page.getByRole('button', { name: 'Inställningar' }).click();
  await expect(page.getByRole('dialog', { name: 'Inställningar' })).toBeVisible();
  await expectAccessible(page, 'settings');
});

for (const family of ['gram', 'meter', 'liter']) {
  test(`quiz screen for ${family}: open, right and wrong`, async ({ page }) => {
    await card(page, family).click();
    await expectAccessible(page, 'quiz open');

    await answerInput(page).fill('1');
    await answerInput(page).press('Enter');
    await expect(page.getByRole('button', { name: 'nästa' })).toBeVisible();
    await expectAccessible(page, 'quiz checked');
  });
}

test('result screen and start screen with results', async ({ page }) => {
  await setQuestions(page, 3);
  await playRound(page, 'liter', [true, false, true]);
  await expectAccessible(page, 'result');
  await page.getByRole('button', { name: 'klar' }).click();
  await expectAccessible(page, 'start with results');
});
