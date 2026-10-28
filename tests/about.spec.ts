import { expect, test } from '@playwright/test';

test('the learning journey is an ordered list with at least three stops', async ({ page }) => {
  await page.goto('/about/');
  const journey = page.locator('ol[data-journey]');
  await expect(journey).toHaveCount(1);
  expect(await journey.locator(':scope > li').count()).toBeGreaterThanOrEqual(3);
});