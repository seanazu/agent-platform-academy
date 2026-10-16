import { expect, test } from '@playwright/test';
import { course } from './helpers';

test.describe('home', () => {
  test('renders every part as a card in course order', async ({ page }) => {
    await test.step('Given the home page is open', async () => {
      await page.goto('/#/path');
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Agent Platform Academy');
    });
    await test.step('Then one card per part is shown', async () => {
      const cards = page.getByTestId('part-card');
      await expect(cards).toHaveCount(course.parts.length);
      const titles = await cards.locator('.part-card-title').allTextContents();
      expect(titles).toEqual(course.parts.map((p) => p.title));
    });
    await test.step('And foundations come before walkthroughs', async () => {
      const kinds = await page.getByTestId('part-card').locator('.part-card-kind').allTextContents();
      const firstWalk = kinds.findIndex((k) => k.startsWith('Walkthrough'));
      const lastFoundation = kinds.map((k) => k.startsWith('Foundation')).lastIndexOf(true);
      expect(lastFoundation).toBeLessThan(firstWalk);
    });
    await test.step('And the page never scrolls sideways', async () => {
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  });
});
