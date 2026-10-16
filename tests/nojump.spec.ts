import { expect, test, type Page } from '@playwright/test';
import { LESSON_URL } from './helpers';

const heights = (page: Page) =>
  page.evaluate(() => Array.from(document.querySelectorAll<HTMLElement>('[data-stable]')).map((el) => ({ box: el.dataset.stable ?? '', h: el.getBoundingClientRect().height })));

const expectSame = (before: { box: string; h: number }[], after: { box: string; h: number }[], what: string) => {
  expect(after.length, what).toBe(before.length);
  before.forEach((b, i) => {
    const a = after[i];
    expect(Math.abs((a?.h ?? 0) - b.h), `${b.box} #${i} moved after ${what}`).toBeLessThanOrEqual(2);
  });
};

const openStep = async (page: Page, label: string) => {
  await page.locator('.isl-trail-step', { hasText: label }).click();
  await page.waitForTimeout(400);
};

for (const width of [1440, 390]) {
  test(`nothing a learner clicks changes a box's height at ${width}px`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width, height: width > 600 ? 900 : 844 });
    await test.step('Given a lesson is open', async () => {
      await page.goto(LESSON_URL);
    });

    await test.step('When every checkpoint option is chosen', async () => {
      await openStep(page, 'Checkpoint');
      const before = await heights(page);
      expect(before.length).toBeGreaterThanOrEqual(3);
      const options = page.locator('.quiz-option');
      const count = await options.count();
      for (let i = 0; i < count; i++) {
        await options.nth(i).click();
        expectSame(before, await heights(page), `quiz option ${i}`);
      }
    });

    await test.step('When every lab guess is chosen', async () => {
      await openStep(page, 'Build');
      const before = await heights(page);
      const options = page.locator('.isl-step [data-stable] button[aria-pressed]');
      const count = await options.count();
      for (let i = 0; i < count; i++) {
        await options.nth(i).click();
        expectSame(before, await heights(page), `lab guess ${i}`);
      }
    });

    await test.step('Then the page never scrolls sideways on any step', async () => {
      for (const label of ['Story', 'Watch', 'Understand', 'Practice', 'Build', 'Checkpoint']) {
        await openStep(page, label);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, label).toBeLessThanOrEqual(0);
      }
    });
  });
}
