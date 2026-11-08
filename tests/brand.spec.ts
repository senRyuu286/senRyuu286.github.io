import { expect, test } from '@playwright/test';

for (const path of ['/', '/404.html']) {
  test(`${path} uses the portfolio logo and browser icons`, async ({ page }) => {
    await page.goto(path);
    const logo = page.locator('header .nav-logo');
    await expect(logo).toHaveAccessibleName('Justin Ramas');
    await expect(logo.locator('svg[data-icon="jr"]')).toBeVisible();
    await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute('href', '/favicon.svg');
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/apple-touch-icon.png');
  });
}

test('fallback and home-screen icons have valid image headers', async ({ page }) => {
  const ico = await (await page.request.get('/favicon.ico')).body();
  expect(ico.readUInt16LE(2)).toBe(1);
  expect(ico.readUInt16LE(4)).toBe(3);
  const png = await (await page.request.get('/apple-touch-icon.png')).body();
  expect([...png.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  expect(png.readUInt32BE(16)).toBe(180);
  expect(png.readUInt32BE(20)).toBe(180);
});
