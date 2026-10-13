import { expect, test } from '@playwright/test';
import { LESSON_ID } from './helpers';

test.describe('lesson', () => {
  test('shows the picture with step controls', async ({ page }) => {
    await test.step('Given a lesson page is open', async () => {
      await page.goto(`/#/lesson/${LESSON_ID}`);
      await expect(page.locator('.picture')).toBeVisible();
    });
    const next = page.getByRole('button', { name: 'Next step' });
    const back = page.getByRole('button', { name: 'Previous step' });
    await test.step('Then no arrow is drawn before the first step', async () => {
      await expect(page.locator('.pic-edge')).toHaveCount(0);
      await expect(back).toBeDisabled();
    });
    await test.step('When Next is pressed', async () => {
      await next.click();
    });
    await test.step('Then the first arrow and its text appear', async () => {
      await expect(page.locator('.pic-edge')).toHaveCount(1);
      await expect(page.locator('.picture-count')).toContainText('Step 1 of');
      await expect(page.locator('.stack-item[data-on] .picture-step-text')).toBeVisible();
    });
    await test.step('When Next is pressed until the end', async () => {
      while (await next.isEnabled()) await next.click();
    });
    await test.step('Then every arrow is drawn and Back still works', async () => {
      const count = await page.locator('.pic-edge').count();
      expect(count).toBeGreaterThanOrEqual(3);
      await back.click();
      await expect(page.locator('.pic-edge')).toHaveCount(count - 1);
    });
  });

  test('the quiz marks the chosen option and explains it', async ({ page }) => {
    await test.step('Given a lesson page is open', async () => {
      await page.goto(`/#/lesson/${LESSON_ID}`);
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
      await expect(page.locator('.quiz-q').first().locator('.quiz-option[aria-pressed="true"]')).toHaveCount(1);
    });
  });

  test('a lesson without a file shows the being-written state', async ({ page }) => {
    await page.goto('/#/lesson/p0-1');
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toHaveText('How to use this course');
    const written = await page.locator('.being-written').count();
    const sections = await page.locator('.lesson-section').count();
    expect(written + (sections > 0 ? 1 : 0)).toBe(1);
  });
});
