import { expect, type Page } from '@playwright/test';
import { convert } from '../src/test/convert.ts';

export const SETTINGS_KEY = 'enheter:v1:settings';
export const RESULTS_KEY = 'enheter:v1:results';

/** Opens the app with empty storage. */
export async function openFresh(page: Page) {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Träning för olika enheter');
}

/** Sets questions per round through the settings dialog. */
export async function setQuestions(page: Page, count: number) {
  await page.getByRole('button', { name: 'Inställningar' }).click();
  const dialog = page.getByRole('dialog', { name: 'Inställningar' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('textbox', { name: 'Tal per runda' }).fill(String(count));
  await dialog.getByRole('button', { name: 'Klar' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByText(`${count} tal per runda.`, { exact: false })).toBeVisible();
}

export function answerInput(page: Page) {
  return page.getByRole('textbox', { name: /^Svar i / });
}

/** Reads "40 dl = [ ] l" from the page and returns the right answer. */
export async function solve(page: Page): Promise<number> {
  const input = answerInput(page);
  const to = (await input.getAttribute('aria-label'))!.replace('Svar i ', '');
  const promptId = (await input.getAttribute('aria-describedby'))!.split(' ')[0]!;
  const prompt = (await page.locator(`[id="${promptId}"]`).textContent())!;
  const [value, from] = prompt.replace('=', '').trim().split(/\s+/);
  return convert(Number(value), from!, to);
}

/** Swedish input format: decimal comma. */
export const swedish = (n: number) => String(n).replace('.', ',');

/**
 * Answers the current question (right or wrong), checks it with Enter,
 * asserts the feedback and moves on with Enter.
 */
export async function answer(page: Page, right: boolean) {
  const correct = await solve(page);
  const input = answerInput(page);
  await expect(input).toBeFocused();
  await input.fill(swedish(right ? correct : correct * 10));
  await input.press('Enter');
  await expect(page.getByText(right ? 'RÄTT!' : 'FEL!', { exact: true })).toBeVisible();
  await input.press('Enter');
}

/** Plays a round with the given right/wrong pattern and ends on the result screen. */
export async function playRound(page: Page, family: string, pattern: boolean[]) {
  await card(page, family).click();
  for (const [i, right] of pattern.entries()) {
    await expect(page.getByText(`Tal ${i + 1} av ${pattern.length}`)).toBeVisible();
    await answer(page, right);
  }
  const score = pattern.filter(Boolean).length;
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(`${score}/${pattern.length}`);
}

export function card(page: Page, family: string) {
  // A card's name is its visible text, e.g. "Vikt gram kg hg g mg Öva".
  return page.getByRole('button', { name: new RegExp(`\\b${family}\\b`) });
}
