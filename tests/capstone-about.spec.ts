import { expect, test } from '@playwright/test';

test('the project appears without a case-study link', async ({ page }) => {
  await page.goto('/work/');
  const project = page.locator('[data-work-row][data-type="Project"]').first();
  await expect(project).toContainText('Veritas');
  await expect(project.locator('a[href^="/work/"]')).toHaveCount(0);
});
