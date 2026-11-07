import { expect, test } from '@playwright/test';

test('the project appears without a case-study link', async ({ page }) => {
  await page.goto('/');
  const project = page.locator('[data-selected-work]').first();
  await expect(project).toContainText('Veritas');
  await expect(project.locator('a[href^="/work/"]')).toHaveCount(0);
});
