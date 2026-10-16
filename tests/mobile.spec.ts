import { expect, test, type Page } from '@playwright/test';
import { LESSON_URL, course } from './helpers';

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

  test('a swipe that starts on an island moves the map, and a tap on it opens it', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/#/');
    const island = page.locator('.isl-island').nth(1);
    const box = (await island.boundingBox())!;
    const [cx, cy] = [box.x + box.width / 2, box.y + box.height / 2];
    const offset = () => page.locator('.isl-plane').evaluate((el) => { const m = new DOMMatrix(getComputedStyle(el).transform); return [m.e, m.f]; });
    const before = await offset();
    await test.step('When a finger swipes right and down starting on an island', async () => {
      const cdp = await page.context().newCDPSession(page);
      const at = (dx: number, dy: number) => [{ x: cx + dx, y: cy + dy, id: 1 }];
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: at(0, 0) });
      for (const d of [20, 50, 90]) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: at(d, d) });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    });
    await test.step('Then the map moved and no island opened', async () => {
      const after = await offset();
      expect(after[0]! - before[0]!).toBeGreaterThan(60);
      expect(after[1]! - before[1]!).toBeGreaterThan(60);
      await expect(page.locator('.isl-panel')).toHaveCount(0);
    });
    await test.step('When the island is tapped', async () => {
      const moved = (await island.boundingBox())!;
      await page.touchscreen.tap(moved.x + moved.width / 2, moved.y + moved.height / 2);
    });
    await test.step('Then its panel opens', async () => {
      await expect(page.locator('.isl-panel')).toBeVisible();
    });
  });

  test('a learner can go from the map through a whole lesson and back, using only taps', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/#/');
    await test.step('When the Clock Tower is opened and a lesson is started', async () => {
      await page.locator('.isl-chips a', { hasText: 'Clock Tower' }).tap();
      await page.locator('.isl-lesson', { hasText: 'One ticket, one run' }).tap();
      await expect(page.locator('.isl-sheet')).toBeVisible();
    });
    await test.step('And the footer button moves through every step', async () => {
      const foot = page.locator('.isl-sheet-foot .isl-btn-primary');
      for (const next of ['Watch', 'Understand', 'Practice', 'Build', 'Checkpoint']) {
        await expect(foot).toContainText(next);
        await foot.tap();
      }
      await expect(page.getByRole('heading', { name: 'Checkpoint' })).toBeVisible();
    });
    await test.step('And the lesson is finished from the last step', async () => {
      await page.locator('.isl-sheet-foot .isl-btn-primary').tap();
    });
    await test.step('Then the learner is back on the island and the lesson is done', async () => {
      await expect(page.locator('.isl-sheet')).toHaveCount(0);
      await expect(page.locator('.isl-panel')).toContainText('1 of 9 done');
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

  for (const [w, h] of [[390, 844], [375, 667], [360, 640]] as const) {
    test(`every island and its name card are fully visible above the panel at ${w}x${h}`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/#/');
      const names = await page.locator('.isl-chips a').allTextContents();
      expect(names.length).toBe(9);
      for (const name of names) {
        await test.step(`When ${name} is tapped, then it is framed in the free part of the map`, async () => {
          await page.locator('.isl-chips a', { hasText: name }).tap();
          await expect(page.locator('.isl-panel')).toBeVisible();
          await page.waitForTimeout(150);
          const r = await page.evaluate(() => {
            const rect = (sel: string) => { const b = document.querySelector(sel)?.getBoundingClientRect(); return b ? { l: b.left, r: b.right, t: b.top, b: b.bottom } : null; };
            return { island: rect('.isl-spot[data-selected] .isl-island'), card: rect('.isl-spot[data-selected] .isl-card'), panel: rect('.isl-panel'), chips: rect('.isl-chips') };
          });
          const { island, card, panel, chips } = r;
          for (const [what, b] of [['island', island], ['card', card]] as const) {
            expect(b, what).not.toBeNull();
            expect(b!.l, `${name} ${what} left`).toBeGreaterThanOrEqual(0);
            expect(b!.r, `${name} ${what} right`).toBeLessThanOrEqual(w);
            const pad = what === 'island' ? 40 : 2; // the island picture has transparent room around the rock
            expect(b!.t, `${name} ${what} top clears the chips`).toBeGreaterThanOrEqual(chips!.b - pad);
            expect(b!.b, `${name} ${what} bottom clears the panel`).toBeLessThanOrEqual(panel!.t + pad);
          }
        });
      }
    });
  }

  for (const [w, h] of [[390, 844], [360, 640], [844, 390]] as const) {
    test(`every stop of the tour shows its island above the caption at ${w}x${h}`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/#/');
      await page.getByRole('button', { name: /Tour the platform/ }).first().tap();
      for (let stop = 1; stop <= 8; stop++) {
        await test.step(`Then stop ${stop} is framed above the caption`, async () => {
          await expect(page.locator('.isl-caption-step')).toContainText(`Stop ${stop} of 8`);
          await page.waitForTimeout(150);
          const name = ((await page.locator('.isl-caption-step').textContent()) ?? '').split('·')[1]?.trim() ?? '';
          const r = await page.evaluate((n) => {
            const spot = [...document.querySelectorAll('.isl-spot')].find((el) => el.querySelector('.isl-card-name')?.textContent === n);
            const rect = (el: Element | null | undefined) => { const b = el?.getBoundingClientRect(); return b ? { l: b.left, r: b.right, t: b.top, b: b.bottom } : null; };
            return { card: rect(spot?.querySelector('.isl-card')), island: rect(spot?.querySelector('.isl-island')), caption: rect(document.querySelector('.isl-caption')), top: rect(document.querySelector('.isl-top')) };
          }, name);
          for (const [what, b] of [['card', r.card], ['island', r.island]] as const) {
            expect(b, `${name} ${what}`).not.toBeNull();
            const pad = what === 'island' ? 40 : 2;
            expect(b!.l, `${name} ${what} left`).toBeGreaterThanOrEqual(0);
            expect(b!.r, `${name} ${what} right`).toBeLessThanOrEqual(w);
            expect(b!.t, `${name} ${what} top`).toBeGreaterThanOrEqual(r.top!.b - pad);
            const besideCaption = b!.r <= r.caption!.l + 2; // in landscape the caption sits on the right, so the island only has to stay left of it
            if (!besideCaption) expect(b!.b, `${name} ${what} bottom clears the caption`).toBeLessThanOrEqual(r.caption!.t + pad);
          }
          if (stop < 8) await page.getByRole('button', { name: /Next stop/ }).tap();
        });
      }
    });
  }

  for (const width of [320, 360]) {
    test(`no step of any of the ${course.lessonCount} lessons scrolls sideways at ${width}px`, async ({ page }) => {
      test.setTimeout(600_000);
      await page.setViewportSize({ width, height: 740 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const bad: string[] = [];
      for (const part of course.parts) for (const l of part.lessons) {
        await page.goto(`/#/lesson/${l.id}`);
        await page.waitForSelector('.isl-sheet');
        for (let i = 0; i < 6; i++) {
          await page.locator('.isl-trail-step').nth(i).tap();
          const over = await page.locator('.isl-sheet-body').evaluate((el) => el.scrollWidth - el.clientWidth);
          if (over > 0) bad.push(`${l.id} step ${i + 1}: ${over}px too wide`);
        }
      }
      expect(bad).toEqual([]);
    });
  }
});
