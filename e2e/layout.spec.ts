import { expect, test, type Page } from '@playwright/test';
import { answer, card, openFresh, playRound, setQuestions } from './helpers.ts';

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

async function top(page: Page, family: string) {
  return (await card(page, family).boundingBox())!.y;
}

test.beforeEach(async ({ page }) => {
  await openFresh(page);
});

test('start cards sit in a row on desktop and stack on phones', async ({ page, isMobile }) => {
  const [g, m, l] = [await top(page, 'gram'), await top(page, 'meter'), await top(page, 'liter')];
  if (isMobile) {
    expect(m).toBeGreaterThan(g);
    expect(l).toBeGreaterThan(m);
  } else {
    expect(m).toBe(g);
    expect(l).toBe(g);
  }
  await expectNoHorizontalScroll(page);
});

test('the quiz header compacts on phones', async ({ page, isMobile }) => {
  await card(page, 'gram').click();
  const exit = page.getByRole('button', { name: 'Avsluta' });
  const box = (await exit.boundingBox())!;
  if (isMobile) {
    expect(Math.round(box.width)).toBe(44);
    await expect(page.getByText('· vikt')).toBeHidden();
  } else {
    expect(box.width).toBeGreaterThan(44);
    await expect(page.getByText('· vikt')).toBeVisible();
  }
  expect(box.height).toBeGreaterThanOrEqual(44);
  await expectNoHorizontalScroll(page);
});

test('no screen scrolls sideways, even with long rounds', async ({ page }) => {
  await setQuestions(page, 60);
  for (const family of ['gram', 'meter', 'liter']) {
    await card(page, family).click();
    await expectNoHorizontalScroll(page);
    await answer(page, false);
    await expectNoHorizontalScroll(page);
    await page.getByRole('button', { name: 'Avsluta' }).click();
  }
  await setQuestions(page, 3);
  await playRound(page, 'meter', [true, false, true]);
  await expectNoHorizontalScroll(page);
});
