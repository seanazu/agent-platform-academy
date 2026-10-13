import { expect, test } from '@playwright/test';
import { course } from './helpers';

test.describe('ticket map', () => {
  test('shows every ticket and the lesson that teaches it', async ({ page }) => {
    await test.step('Given the ticket map is open', async () => {
      await page.goto('/#/tickets');
    });
    await test.step('Then all tickets are listed', async () => {
      await expect(page.getByTestId('ticket')).toHaveCount(course.ticketCount);
      await expect(page.getByTestId('tickets-progress')).toContainText(`of ${course.ticketCount} tickets`);
    });
    await test.step('And every ticket links to a lesson', async () => {
      await expect(page.locator('.tmap-lesson[href]')).toHaveCount(course.ticketCount);
    });
    await test.step('When a goal filter is chosen', async () => {
      await page.getByRole('button', { name: 'G0', exact: true }).click();
    });
    await test.step('Then only that goal remains', async () => {
      const keys = await page.locator('.tmap-key').allTextContents();
      expect(keys.length).toBeGreaterThan(0);
      expect(keys.every((k) => k.startsWith('G0-'))).toBe(true);
    });
  });

  test('a finished lesson unlocks its tickets', async ({ page }) => {
    await test.step('Given a walkthrough lesson is marked done', async () => {
      await page.goto('/#/lesson/g0-1');
      await page.getByRole('button', { name: 'Mark lesson done' }).click();
      await expect(page.getByRole('button', { name: 'Lesson done' })).toBeVisible();
    });
    await test.step('When the ticket map opens', async () => {
      await page.goto('/#/tickets?k=G0-01');
      await expect(page.getByTestId('ticket')).toHaveCount(course.ticketCount);
    });
    await test.step('Then the tickets it covers are marked as doable', async () => {
      const can = await page.locator('.tmap[data-can]').count();
      expect(can).toBeGreaterThanOrEqual(2);
      await expect(page.locator('#ticket-G0-01')).toHaveAttribute('data-focus', 'true');
      await expect(page.getByTestId('tickets-progress')).toContainText(`You can do ${can} of`);
    });
  });
});
