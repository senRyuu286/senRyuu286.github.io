import { expect, test, type Locator, type Page } from '@playwright/test';

const SMALLEST_PHONE = { width: 320, height: 568 };
const TABLET = { width: 768, height: 1024 };
const DESKTOP = { width: 1280, height: 800 };
const card = (page: Page) => page.locator('[data-selected-work]');

async function box(locator: Locator) {
  const result = await locator.boundingBox();
  if (!result) throw new Error('Element has no box on the page');
  return result;
}

test.describe('Selected works', () => {
  test('shows the title, role, summary and stack without case study sections', async ({ page }) => {
    await page.goto('/');
    await expect(card(page).locator('h3')).toBeVisible();
    await expect(card(page).locator('.selected-work-subtitle')).toBeVisible();
    await expect(card(page).getByRole('list', { name: 'Stack' }).locator('.chip').first()).toBeVisible();
    await expect(card(page).locator('.selected-work-stack + .selected-work-summary')).toBeVisible();
    await expect(card(page).locator('.selected-work-role')).toContainText('Role:');
    await expect(card(page).locator('dl')).toHaveCount(0);
    for (const word of ['Problem', 'Approach', 'Result', 'What I learned']) {
      await expect(card(page).getByText(word, { exact: true })).toHaveCount(0);
    }
  });

  for (const size of [SMALLEST_PHONE, TABLET, DESKTOP]) {
    test(`shows the Veritas cover at a 16:10 ratio at ${size.width}px`, async ({ page }) => {
      await page.setViewportSize(size);
      await page.goto('/');
      const shot = page.locator('[data-card-screenshot]');
      await expect(shot.locator('img')).toHaveAttribute('src', '/veritas-cover.png');
      const area = await box(shot);
      expect(area.width / area.height).toBeCloseTo(1.6, 1);
    });
  }

  test('shows GitHub and demo links only when they are real addresses', async ({ page }) => {
    await page.goto('/');
    await expect(card(page).locator('a[href^="/work/"]')).toHaveCount(0);
    const links = card(page).getByRole('link');
    const hrefs = await links.evaluateAll((els) => els.map((el) => el.getAttribute('href') ?? ''));
    for (const href of hrefs) {
      if (/^https?:\/\//.test(href)) {
        // Real external links must open safely in a new tab.
        const link = card(page).locator(`a[href="${href}"]`);
        await expect(link).toHaveAttribute('target', '_blank');
        await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      } else {
        expect(href.startsWith('/'), `${href} should be an internal path`).toBe(true);
      }
    }
    await expect(card(page).getByText('[GITHUB LINK]')).toHaveCount(0);
    await expect(card(page).getByText('[LIVE DEMO LINK]')).toHaveCount(0);
  });
});

test('the stack groups remain visible and labelled', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Tech Stack' })).toBeVisible();
  expect(await page.locator('[data-stack-group]').count()).toBeGreaterThan(0);
  await expect(page.locator('[data-stack-group] .tech-item').first()).toBeVisible();
  await expect(page.locator('[data-stack-group] .tech-item svg').first()).toBeVisible();
});
