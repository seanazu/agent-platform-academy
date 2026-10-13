// Every lesson at a width: report sideways scroll and the widest offending elements.
// Usage: W=390 node tools/overflow.mjs [baseURL]
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
const base = process.argv[2] ?? 'http://localhost:4311';
const W = +(process.env.W ?? 390);
const course = JSON.parse(readFileSync(new URL('../content/course.json', import.meta.url)));
const ids = course.parts.flatMap((p) => p.lessons.map((l) => l.id));
const b = await chromium.launch({ channel: 'chrome' });
const page = await (await b.newContext({ viewport: { width: W, height: 900 } })).newPage();
let bad = 0;
for (const id of ['', ...ids.map((i) => 'lesson/' + i), 'tickets', 'words']) {
  await page.goto(`${base}/#/${id}`); await page.waitForTimeout(250);
  const r = await page.evaluate(() => {
    const over = document.documentElement.scrollWidth - innerWidth;
    if (over <= 0) return null;
    const offenders = [...document.querySelectorAll('main *')].filter((el) => {
      const rc = el.getBoundingClientRect(); if (!rc.width || rc.right <= innerWidth + 1) return false;
      for (let a = el.parentElement; a; a = a.parentElement) { const s = getComputedStyle(a).overflowX; if ((s === 'auto' || s === 'scroll') && a !== document.body && a !== document.documentElement) return false; }
      return true;
    }).slice(-3).map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')} "${(el.textContent || '').slice(0, 60)}"`);
    return { over, offenders };
  });
  if (r) { bad++; console.log(`${id || 'home'}: +${r.over}px  ${r.offenders.join(' | ')}`); }
}
console.log(`${W}px: ${bad} pages scroll sideways`);
await b.close();
