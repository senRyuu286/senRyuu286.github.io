import { expect, test } from '@playwright/test';

test('Home combines the introduction, journey and contact with links to Work', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('#about')).toBeVisible();
  await expect(page.locator('ol[data-journey] > li')).toHaveCount(3);
  await expect(page.locator('#contact-form')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Read the case study' })).toHaveAttribute('href', '/work/capstone/');
  await expect(page.locator('header a[href="/#contact"]').first()).toHaveAttribute('href', '/#contact');
});

test('a project detail page renders its Markdown', async ({ page }) => {
  await page.goto('/work/capstone/');
  await expect(page.locator('.project-content').getByRole('heading', { name: 'Problem' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back to all work' })).toHaveAttribute('href', '/work/');
});

test('the navigation and work list remain usable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 700 } });
  const page = await context.newPage();
  await page.goto('/');
  await page.locator('[data-nav-menu] summary').click();
  await expect(page.locator('[data-nav-panel] a[href="/#contact"]')).toBeVisible();
  await page.goto('/work/');
  await expect(page.locator('[data-work-row]').first()).toBeVisible();
  await expect(page.locator('[data-work-controls]')).toBeHidden();
  await context.close();
});
