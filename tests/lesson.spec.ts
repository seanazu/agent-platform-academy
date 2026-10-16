import { expect, test } from '@playwright/test';
import { LESSON_URL } from './helpers';

test.describe('lesson', () => {
  test('the checkpoint marks the chosen option and explains it', async ({ page }) => {
    await test.step('Given a lesson is open on its checkpoint', async () => {
      await page.goto(LESSON_URL);
      await page.locator('.isl-trail-step', { hasText: 'Checkpoint' }).click();
      await expect(page.locator('.quiz-q')).toHaveCount(3);
    });
    const first = page.locator('.quiz-q').first();
    await test.step('When an option is chosen', async () => {
      await first.locator('.quiz-option').first().click();
    });
    await test.step('Then the option is marked and the why is shown', async () => {
      await expect(first.locator('.quiz-option[aria-pressed="true"]')).toHaveCount(1);
      await expect(first.locator('.quiz-option[data-mark="right"]')).toHaveCount(1);
      const why = first.locator('.quiz-feedback .stack-item[data-on] .quiz-why');
      await expect(why).toBeVisible();
      await expect(why).toContainText(/Correct\.|Not quite\./);
    });
    await test.step('And the answer survives a reload', async () => {
      await page.reload();
      await page.locator('.isl-trail-step', { hasText: 'Checkpoint' }).click();
      await expect(page.locator('.quiz-q').first().locator('.quiz-option[aria-pressed="true"]')).toHaveCount(1);
    });
  });

  test('an unknown lesson id says so', async ({ page }) => {
    await page.goto('/#/lesson/no-such-lesson');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('No such lesson');
  });
});
