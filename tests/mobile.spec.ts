import { expect, test, type Page } from '@playwright/test';
import { LESSON_URL } from './helpers';

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

const scale = (page: Page) =>
  page.locator('.isl-plane').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);

test.describe('on a phone', () => {
  test('the map opens with the path card folded and zooms with two fingers', async ({ page }) => {
    await test.step('Given the home page is open on a phone', async () => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/#/');
      await expect(page.locator('.isl-island')).toHaveCount(9);
    });
    await test.step('Then the path card is folded so the map is visible', async () => {
      await expect(page.locator('.isl-path-list')).toHaveCount(0);
      await expect(page.locator('.isl-path-title')).toBeVisible();
    });
    const before = await scale(page);
    await test.step('When two fingers move apart on the map', async () => {
      const cdp = await page.context().newCDPSession(page);
      const at = (a: number, b: number) => [{ x: 195 - a, y: 420, id: 1 }, { x: 195 + b, y: 420, id: 2 }];
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: at(20, 20) });
      for (const d of [40, 70, 100]) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: at(d, d) });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    });
    await test.step('Then the map is zoomed in', async () => {
      await expect.poll(() => scale(page)).toBeGreaterThan(before * 1.5);
    });
  });

  test('every lesson step fits the screen width', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(LESSON_URL);
    for (const label of ['Story', 'Watch', 'Understand', 'Practice', 'Build', 'Checkpoint']) {
      await test.step(`Then the ${label} step does not scroll sideways`, async () => {
        await page.locator('.isl-trail-step').nth(['Story', 'Watch', 'Understand', 'Practice', 'Build', 'Checkpoint'].indexOf(label)).click();
        const over = await page.locator('.isl-sheet-body').evaluate((el) => el.scrollWidth - el.clientWidth);
        expect(over, label).toBeLessThanOrEqual(0);
      });
    }
  });

  test('the step bar and the footer buttons stay on screen', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(LESSON_URL);
    const inView = async (sel: string) => {
      const b = await page.locator(sel).last().boundingBox();
      expect((b?.x ?? -1)).toBeGreaterThanOrEqual(0);
      expect((b?.x ?? 0) + (b?.width ?? 0)).toBeLessThanOrEqual(390);
    };
    await inView('.isl-trail-step');
    await inView('.isl-done-btn');
    await inView('.isl-sheet-foot .isl-btn');
  });
});
