import { expect, test } from '@playwright/test';

for (const javaScriptEnabled of [false, true]) {
  for (const width of [320, 768, 1440]) {
    test(`certificates work at ${width}px with JavaScript ${javaScriptEnabled ? 'on' : 'off'}`, async ({ browser }) => {
      const context = await browser.newContext({ javaScriptEnabled, reducedMotion: 'reduce', viewport: { width, height: 800 } });
      const page = await context.newPage();
      await page.goto('/');
      const slides = page.locator('[data-certificate]');
      await expect(slides).toHaveCount(4);
      await expect(slides.nth(0)).toBeVisible();
      await expect(slides.nth(1)).toBeHidden();
      await slides.nth(0).getByRole('link', { name: 'Next certificate' }).focus();
      const scrollBefore = await page.evaluate(() => window.scrollY);
      await page.keyboard.press('Enter');
      await expect(slides.nth(1)).toBeVisible();
      await expect(slides.nth(0)).toBeHidden();
      if (javaScriptEnabled) expect(await page.evaluate(() => window.scrollY)).toBe(scrollBefore);
      await expect(slides.nth(1).getByRole('link', { name: /verify credential/i })).toHaveAttribute('rel', 'noopener noreferrer');
      await slides.nth(1).getByRole('link', { name: 'Previous certificate' }).focus();
      await page.keyboard.press('Enter');
      await expect(slides.nth(0)).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
      await context.close();
    });
  }
}
