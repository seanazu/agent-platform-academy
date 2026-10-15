import { createHash } from 'node:crypto';
import { expect, test, type Page } from '@playwright/test';

const PILOT = ['p0-2', 'p7-4', 'g5-2'];
const STEPS = ['The problem', 'Watch', 'Play', 'How it works', 'Do it', 'Check yourself', 'In our platform'];

const heights = (page: Page) =>
  page.evaluate(() => Array.from(document.querySelectorAll<HTMLElement>('[data-stable]')).map((el) => ({ box: el.dataset.stable ?? '', h: el.getBoundingClientRect().height })));

const expectSame = (before: { box: string; h: number }[], after: { box: string; h: number }[], what: string) => {
  expect(after.length, what).toBe(before.length);
  before.forEach((b, i) => {
    expect(Math.abs((after[i]?.h ?? 0) - b.h), `${b.box} #${i} moved after ${what}`).toBeLessThanOrEqual(2);
  });
};

test.describe('lesson format v2', () => {
  for (const id of PILOT) {
    test(`${id} shows the seven steps, a narrated drawing and a simulator`, async ({ page }) => {
      await test.step('Given the lesson is open', async () => {
        await page.goto(`/#/lesson/${id}`);
      });
      await test.step('Then every step of the lesson has its heading', async () => {
        for (const name of STEPS) await expect(page.getByRole('heading', { name: new RegExp(`^\\d\\s*${name}$`) })).toBeVisible();
      });
      await test.step('And the simulator is rendered, not the placeholder', async () => {
        await expect(page.locator('[data-stable="play"]')).toBeVisible();
        await expect(page.getByText('This simulator is being built.')).toHaveCount(0);
      });
      await test.step('When the reader steps the narration forward', async () => {
        await page.getByRole('button', { name: 'Next line' }).click();
        await page.getByRole('button', { name: 'Next line' }).click();
      });
      await test.step('Then the third transcript line is the current one', async () => {
        const lines = page.locator('.watch-line');
        await expect(lines.nth(2)).toHaveAttribute('data-now', 'true');
      });
    });
  }

  test('the lab accepts the pass code that ./academy check prints', async ({ page }) => {
    const code = `APA-p7-4-${createHash('sha256').update('apa:p7-4').digest('hex').slice(0, 6)}`;
    await test.step('Given the p7-4 lesson is open', async () => {
      await page.goto('/#/lesson/p7-4');
    });
    await test.step('When a wrong code is entered', async () => {
      await page.getByLabel(/Pass code/).fill('APA-p7-4-000000');
      await page.getByRole('button', { name: 'Mark lab passed' }).click();
    });
    await test.step('Then the page says it does not match', async () => {
      await expect(page.getByText('That code does not match this lab.')).toBeVisible();
    });
    await test.step('When the right code is entered', async () => {
      await page.getByLabel(/Pass code/).fill(code);
      await page.getByRole('button', { name: 'Mark lab passed' }).click();
    });
    await test.step('Then the lab shows as passed', async () => {
      await expect(page.getByText('✓ Lab passed')).toBeVisible();
    });
  });

  for (const width of [1440, 390]) {
    test(`nothing a reader clicks in a v2 lesson changes a box's height at ${width}px`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.setViewportSize({ width, height: width > 600 ? 900 : 844 });
      await test.step('Given the p7-4 lesson has finished laying out', async () => {
        await page.goto('/#/lesson/p7-4');
        await expect(page.locator('.watch-line').first()).toBeVisible();
        await page.waitForTimeout(800);
      });
      const before = await heights(page);

      await test.step('When the narration is stepped to the end and back', async () => {
        const next = page.getByRole('button', { name: 'Next line' });
        while (await next.isEnabled()) {
          await next.click();
          expectSame(before, await heights(page), 'narration Next');
        }
        const prev = page.getByRole('button', { name: 'Previous line' });
        for (let i = 0; i < 4; i++) {
          await prev.click();
          expectSame(before, await heights(page), 'narration Previous');
        }
      });

      await test.step('When every lab guess and quiz option is chosen', async () => {
        const options = page.locator('.lab2-guess .quiz-option, .quiz .quiz-option');
        const count = await options.count();
        for (let i = 0; i < count; i++) {
          await options.nth(i).click();
          expectSame(before, await heights(page), `option ${i}`);
        }
      });

      await test.step('Then the page never scrolls sideways', async () => {
        expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
      });
    });
  }

  test("the Who's who page introduces the cast", async ({ page }) => {
    await page.goto('/#/cast');
    await expect(page.getByRole('heading', { name: 'Everyone in the story' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Nova', exact: true })).toBeVisible();
  });

  test('a ticket card links back to its lesson and offers a Claude Code prompt', async ({ page }) => {
    await test.step('Given the card for G5-09 is open', async () => {
      await page.goto('/#/card/G5-09');
    });
    await test.step('Then it shows the prompt and the lesson that teaches the idea', async () => {
      await expect(page.getByRole('heading', { name: 'Do it with Claude Code' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'One red main, one fixer' })).toBeVisible();
    });
  });
});
