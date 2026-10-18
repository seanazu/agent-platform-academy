import { expect, test } from '@playwright/test';

test.describe('islands map', () => {
  test('a learner can open an island, jump between any steps and mark the lesson done', async ({ page }) => {
    await test.step('Given the home page is open, which is the islands map, with reduced motion so the islands hold still', async () => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/#/');
    });
    await test.step('Then all nine islands are on the map', async () => {
      await expect(page.locator('.isl-island')).toHaveCount(9);
    });
    await test.step('When the learner opens the Clock Tower and starts its lesson', async () => {
      await page.getByRole('button', { name: /^Clock Tower:/ }).click();
      await page.locator('.isl-lesson', { hasText: 'One ticket, one run' }).click();
    });
    await test.step('And jumps straight to the checkpoint, skipping everything before it', async () => {
      await page.locator('.isl-trail-step', { hasText: 'Checkpoint' }).click();
    });
    await test.step('Then the checkpoint is open without any step being required', async () => {
      await expect(page.getByRole('heading', { name: 'Checkpoint' })).toBeVisible();
    });
    await test.step('When the learner opens the clips', async () => {
      await page.locator('.isl-trail-step', { hasText: 'Watch' }).click();
    });
    await test.step('Then a YouTube clip plays from its chosen start', async () => {
      await expect(page.locator('.isl-clip-frame iframe')).toHaveAttribute('src', /youtube-nocookie\.com\/embed\/.+start=\d+&end=\d+/);
    });
    await test.step('When the learner marks the lesson done from any step', async () => {
      await page.getByRole('button', { name: 'Mark as done' }).click();
    });
    await test.step('Then the lesson shows as done', async () => {
      await expect(page.getByRole('button', { name: '✓ Lesson done' })).toBeVisible();
    });
  });

  test('defaults to dark mode and toggles cleanly between dark and light', async ({ page }) => {
    await test.step('Given the home page is open', async () => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/#/');
    });
    await test.step('Then the document and the islands map are in dark mode by default', async () => {
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      const bg = await page.locator('.isl').evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(bg).toBe('rgb(21, 27, 51)');
    });
    await test.step('When the learner clicks the theme toggle button', async () => {
      await page.getByRole('button', { name: 'Switch to light theme' }).click();
    });
    await test.step('Then the map switches to light mode and remembers it across routes', async () => {
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
      const bg = await page.locator('.isl').evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(bg).toBe('rgb(238, 242, 248)');
    });
    await test.step('When the learner switches back to dark mode', async () => {
      await page.getByRole('button', { name: 'Switch to dark theme' }).click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    });
  });

  for (const size of [{ width: 1440, height: 900 }, { width: 760, height: 900 }, { width: 390, height: 700 }]) {
    test(`the path list scrolls inside its card and the tour button stays on screen at ${size.width}x${size.height}`, async ({ page }) => {
      await test.step('Given the home page is open', async () => {
        await page.setViewportSize(size);
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto('/#/');
      });
      const list = page.locator('.isl-path-list');
      await test.step('When the card is folded, the learner opens it', async () => {
        const head = page.locator('.isl-path-head');
        if ((await head.getAttribute('aria-expanded')) === 'false') await head.click();
      });
      await test.step('Then the card fits below the top bar', async () => {
        const card = await page.locator('.isl-path').boundingBox();
        expect(card?.y ?? 0).toBeGreaterThanOrEqual(64);
        expect((card?.y ?? 0) + (card?.height ?? 0)).toBeLessThanOrEqual(size.height);
      });
      await test.step('When the learner scrolls the list to the end', async () => {
        await list.evaluate((el) => { el.scrollTop = el.scrollHeight; });
      });
      await test.step('Then the last lesson and the tour button are both visible', async () => {
        await expect(list.locator('li').last()).toBeInViewport();
        await expect(page.locator('.isl-path-actions').getByRole('button', { name: /Tour the platform/ })).toBeInViewport({ ratio: 1 });
      });
    });
  }
});
