import { expect, test } from '@playwright/test';

test('About section and links are removed from every page', async ({ page }) => {
  for (const path of ['/', '/work/']) {
    await page.goto(path);
    await expect(page.locator('#about, a[href="/#about"], a[href="#about"]')).toHaveCount(0);
  }
});
