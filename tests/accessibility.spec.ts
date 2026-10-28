import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Add every new page here as it is built.
const pages = ['/', '/work/', '/work/capstone/', '/about/', '/contact/', '/404.html'];
const schemes = ['light', 'dark'] as const;

for (const scheme of schemes) {
  for (const path of pages) {
    test(`${path} has no serious or critical accessibility issues (${scheme} mode)`, async ({ page }) => {
      // Reduced motion keeps the Home headline animation from affecting contrast checks.
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious).toEqual([]);
    });
  }
}