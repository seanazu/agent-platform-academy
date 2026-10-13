import { expect, test, type Page } from '@playwright/test';
import { LESSON_ID } from './helpers';

const heights = (page: Page) =>
  page.evaluate(() => Array.from(document.querySelectorAll<HTMLElement>('[data-stable]')).map((el) => ({ box: el.dataset.stable ?? '', h: el.getBoundingClientRect().height })));

const expectSame = (before: { box: string; h: number }[], after: { box: string; h: number }[], what: string) => {
  expect(after.length, what).toBe(before.length);
  before.forEach((b, i) => {
    const a = after[i];
    expect(Math.abs((a?.h ?? 0) - b.h), `${b.box} #${i} moved after ${what}`).toBeLessThanOrEqual(2);
  });
};

for (const width of [1440, 390]) {
  test(`nothing a reader clicks changes a box's height at ${width}px`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: width > 600 ? 900 : 844 });
    await test.step('Given a lesson page has finished laying out', async () => {
      await page.goto(`/#/lesson/${LESSON_ID}`);
      await expect(page.locator('.quiz-q')).toHaveCount(3);
      await page.waitForTimeout(800);
    });
    const before = await heights(page);
    expect(before.length).toBeGreaterThanOrEqual(5);

    await test.step('When every picture step is revealed', async () => {
      const next = page.getByRole('button', { name: 'Next step' });
      while (await next.isEnabled()) {
        await next.click();
        expectSame(before, await heights(page), 'picture Next');
      }
      const back = page.getByRole('button', { name: 'Previous step' });
      while (await back.isEnabled()) {
        await back.click();
        expectSame(before, await heights(page), 'picture Back');
      }
    });

    await test.step('When every lab tab is opened', async () => {
      for (const name of ['Faded', 'Alone', 'Worked']) {
        await page.getByRole('tab', { name }).click();
        expectSame(before, await heights(page), `tab ${name}`);
      }
    });

    await test.step('When every quiz option is chosen', async () => {
      const options = page.locator('.quiz-option');
      const count = await options.count();
      for (let i = 0; i < count; i++) {
        await options.nth(i).click();
        expectSame(before, await heights(page), `quiz option ${i}`);
      }
    });

    await test.step('Then the page never scrolls sideways', async () => {
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  });
}
