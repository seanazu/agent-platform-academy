import { expect, test } from '@playwright/test';

test.describe('islands map', () => {
  test('a learner can open an island, play a lesson through its five steps and finish it', async ({ page }) => {
    await test.step('Given the islands map is open, with reduced motion so the islands hold still', async () => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/#/islands');
    });
    await test.step('Then all nine islands are on the map', async () => {
      await expect(page.locator('.isl-island')).toHaveCount(9);
    });
    await test.step('When the learner opens the Clock Tower', async () => {
      await page.getByRole('button', { name: /^Clock Tower:/ }).click();
    });
    await test.step('Then its panel lists the playable lesson first', async () => {
      await expect(page.getByRole('heading', { name: 'Clock Tower' })).toBeVisible();
      await expect(page.locator('.isl-lesson').first()).toContainText('One ticket, one run');
    });
    await test.step('When the learner starts the lesson and walks every step', async () => {
      await page.getByRole('button', { name: /^▶ Start: One ticket, one run/ }).click();
      for (const step of ['Watch', 'Play', 'Build', 'Checkpoint']) {
        await page.getByRole('button', { name: new RegExp(`^Continue: ${step}`) }).click();
      }
      const questions = page.locator('.quiz-q');
      for (let i = 0; i < 3; i++) await questions.nth(i).locator('.quiz-option').first().click();
      await page.getByRole('button', { name: 'Finish and return to the map' }).click();
    });
    await test.step('Then the island says the lesson is done', async () => {
      await expect(page.getByText(/You finished “One ticket, one run”/)).toBeVisible();
    });
  });
});
