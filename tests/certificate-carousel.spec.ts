import { expect, test } from '@playwright/test';

const badgeId = '476c1681-14e9-4413-83e9-fdd38818fffb';
const expectedImages = [
  'https://images.credly.com/images/af8c6b4e-fc31-47c4-8dcb-eb7a2065dc5b/I2CS__1_.png',
  'https://images.credly.com/images/e2d12302-10f9-40d4-8ff1-066a7008b61d/blob',
  'https://images.credly.com/images/f25ec9d4-c59d-49b9-944a-f160012e81cd/image.png',
  'https://images.credly.com/images/dcdf1a3c-2594-4f4c-a33a-050b4bca58b5/image.png',
];

test('shows the configured badge images without Credly embed chrome', async ({ page }) => {
  await page.goto('/');
  const badges = page.locator('[data-certificate] .certificate-badge');
  const sources = await badges.locator('img').evaluateAll((images) => images.map((image) => image.getAttribute('src')));
  expect(sources.sort()).toEqual([...expectedImages].sort());
  await expect(page.locator('script[src*="credly.com/assets/utilities/embed.js"]')).toHaveCount(0);
});

test('all certificates remain readable and verifiable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  const certificates = page.locator('[data-certificate]');
  await expect(certificates).toHaveCount(4);
  for (let i = 0; i < 4; i += 1) await expect(certificates.nth(i)).toBeVisible();
  const link = certificates.filter({ hasText: 'Introduction to Cybersecurity' }).getByRole('link', { name: /verify credential/i });
  await expect(link).toHaveAttribute('href', `https://www.credly.com/badges/${badgeId}/public_url`);
  await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  await context.close();
});

test('carousel controls navigate between certificates without horizontal scrolling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const previous = page.getByRole('button', { name: 'Previous certificate' });
  const next = page.getByRole('button', { name: 'Next certificate' });
  const slides = page.locator('[data-certificate]');
  await expect(slides).toHaveCount(4);
  await expect(previous).toBeDisabled();
  await expect(page.locator('[data-certificate]:visible')).toHaveCount(1);
  const initialHeight = (await page.locator('[data-certificate-list]').boundingBox())!.height;
  const contactTop = await page.locator('#contact').evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  for (let index = 2; index <= 4; index += 1) {
    await next.click();
    await expect(page.locator('[data-certificate-position]')).toHaveText(`${index} / 4`);
    await expect(page.locator('[data-certificate]:visible')).toHaveCount(1);
    expect((await page.locator('[data-certificate-list]').boundingBox())!.height).toBeCloseTo(initialHeight, 1);
    expect(await page.locator('#contact').evaluate((el) => el.getBoundingClientRect().top + window.scrollY)).toBeCloseTo(contactTop, 1);
    await expect(page.locator('[data-certificate][data-inactive]')).toHaveCount(3);
  }
  await expect(next).toBeDisabled();
  await previous.click();
  await expect(page.locator('[data-certificate-position]')).toHaveText('3 / 4');
  expect(await page.locator('[data-certificate-list]').evaluate((list) => list.scrollWidth - list.clientWidth)).toBe(0);
});

for (const width of [320, 375, 768, 1024, 1440]) {
  test(`home has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
    expect(await page.locator('[data-certificate-list]').evaluate((list) => list.scrollWidth - list.clientWidth)).toBe(0);
  });
}
