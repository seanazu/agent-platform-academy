// Screenshots of the main views at the desktop and phone widths, into tools/shots/.
// Usage: node tools/shots.mjs [baseURL]   (default http://localhost:4310)
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = process.argv[2] ?? 'http://localhost:4310';
const out = resolve(dirname(fileURLToPath(import.meta.url)), 'shots');
mkdirSync(out, { recursive: true });
const lesson = process.env.LESSON ?? 'p7-2';

const views = [
  { name: 'home', path: '#/', full: true },
  { name: 'part', path: '#/part/p7', full: true },
  { name: 'lesson-top', path: `#/lesson/${lesson}`, full: false },
  { name: 'lesson-picture', path: `#/lesson/${lesson}`, full: false, scrollTo: '.picture', clicks: ['Next step', 'Next step', 'Next step'] },
  { name: 'lesson-code', path: `#/lesson/${lesson}`, full: false, scrollTo: '.code' },
  { name: 'lesson-lab', path: `#/lesson/${lesson}`, full: false, scrollTo: '.lab' },
  { name: 'lesson-quiz', path: `#/lesson/${lesson}`, full: false, scrollTo: '.quiz' },
  { name: 'tickets', path: '#/tickets', full: false },
  { name: 'words', path: '#/words', full: false },
  { name: 'missing', path: '#/lesson/p1-1', full: false },
];

const browser = await chromium.launch({ channel: 'chrome' });
for (const theme of ['light', 'dark']) {
  for (const width of [1440, 390]) {
    const ctx = await browser.newContext({ viewport: { width, height: width > 600 ? 900 : 844 }, colorScheme: theme, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    for (const v of views) {
      await page.goto(`${base}/${v.path}`);
      await page.waitForTimeout(700);
      for (const label of v.clicks ?? []) await page.getByRole('button', { name: label }).click();
      if (v.scrollTo) {
        const el = page.locator(v.scrollTo).first();
        await el.scrollIntoViewIfNeeded();
        await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 24);
        }, v.scrollTo);
        await page.waitForTimeout(300);
      }
      await page.screenshot({ path: join(out, `${v.name}-${width}-${theme}.png`), fullPage: v.full });
    }
    await ctx.close();
  }
}
await browser.close();
console.log(`shots written to ${out}`);
