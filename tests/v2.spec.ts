import { createHash } from 'node:crypto';
import { expect, test } from '@playwright/test';

test.describe('lesson pages', () => {
  test('an old lesson link opens the same lesson on the islands map', async ({ page }) => {
    await page.goto('/#/lesson/p7-4');
    await expect(page).toHaveURL(/#\/islands\/temporal\/p7-4$/);
    await expect(page.locator('.isl-arrive-text h1')).toHaveText('One ticket, one run');
  });

  test('a checked lab accepts the pass code that ./academy check prints', async ({ page }) => {
    const code = `APA-p7-4-${createHash('sha256').update('apa:p7-4').digest('hex').slice(0, 6)}`;
    await test.step('Given the Build step of the p7-4 lesson is open', async () => {
      await page.goto('/#/islands/temporal/p7-4');
      await page.locator('.isl-trail-step', { hasText: 'Build' }).click();
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

  test("the Who's who page introduces the cast", async ({ page }) => {
    await page.goto('/#/cast');
    await expect(page.getByRole('heading', { name: 'Everyone in the story' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Nova', exact: true })).toBeVisible();
  });

  test('a ticket card links back to its lesson and offers a Claude Code prompt', async ({ page }) => {
    await page.goto('/#/card/G5-09');
    await expect(page.getByRole('heading', { name: 'Do it with Claude Code' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'One red main, one fixer' })).toBeVisible();
  });
});
