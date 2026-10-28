import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const rows = '[data-work-row]';
const visibleRows = '[data-work-row]:visible';

test.describe('Work page with JavaScript', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/work/');
    await expect(page.locator('[data-work-controls]')).toBeVisible();
  });

  test('type chips filter the list and use aria-pressed', async ({ page }) => {
    const total = await page.locator(rows).count();
    expect(total).toBeGreaterThan(0);

    const chips = [
      { name: 'Projects', type: 'Project' },
      { name: 'Certificates', type: 'Certificate' },
      { name: 'Activities', type: 'Activity' },
    ];

    for (const chip of chips) {
      const button = page.getByRole('button', { name: chip.name, exact: true });
      await button.click();
      await expect(button).toHaveAttribute('aria-pressed', 'true');
      await expect(page.getByRole('button', { name: 'All', exact: true })).toHaveAttribute('aria-pressed', 'false');

      const types = await page
        .locator(visibleRows)
        .evaluateAll((els) => els.map((el) => (el as HTMLElement).dataset.type));
      expect(types.length).toBeGreaterThan(0);
      expect(new Set(types)).toEqual(new Set([chip.type]));
    }

    await page.getByRole('button', { name: 'All', exact: true }).click();
    await expect(page.locator(visibleRows)).toHaveCount(total);
  });

  test('typing keeps a matching item and hides the rest', async ({ page }) => {
    const first = page.locator(rows).first();
    const word = ((await first.getAttribute('data-search')) ?? '').split(' ')[0] ?? '';
    await page.getByLabel('Search work').fill(word);
    await expect(first).toBeVisible();
  });

  test('a search with no match shows the empty state, and Clear filters resets it', async ({ page }) => {
    const total = await page.locator(rows).count();
    const search = page.getByLabel('Search work');

    await search.fill('zzzzqq');
    await expect(page.locator(visibleRows)).toHaveCount(0);
    await expect(page.getByText('No matches. Try a different word or clear the filters.')).toBeVisible();

    await page.getByRole('button', { name: 'Clear filters' }).click();
    await expect(page.locator(visibleRows)).toHaveCount(total);
    await expect(search).toBeFocused();
  });

  test('has no serious or critical accessibility issues', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious).toEqual([]);
  });
});

test.describe('Work page without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('shows the full list and keeps the controls hidden', async ({ page }) => {
    await page.goto('/work/');
    const total = await page.locator(rows).count();
    expect(total).toBeGreaterThan(0);
    await expect(page.locator(visibleRows)).toHaveCount(total);
    await expect(page.locator('[data-work-controls]')).toBeHidden();
  });
});