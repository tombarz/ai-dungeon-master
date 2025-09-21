import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/AI Dungeon Master/);
});

test('start new game button', async ({ page }) => {
  await page.goto('/');

  // Click the start new game button
  await page.getByRole('button', { name: 'Start New Game' }).click();

  // Should see game session card
  await expect(page.getByText('Game Session')).toBeVisible();
});
