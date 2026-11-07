import { expect, test, type Locator, type Page } from '@playwright/test';

const PHONE = { width: 375, height: 667 };
const SMALLEST_PHONE = { width: 320, height: 568 };
const DESKTOP = { width: 1280, height: 800 };

const titleLink = (page: Page) => page.locator('a.work-link').first();
const controls = (page: Page) => page.locator('[data-work-controls]');

async function box(locator: Locator) {
  const result = await locator.boundingBox();
  if (!result) throw new Error('Element has no box on the page');
  return result;
}

const barStyle = (link: Locator, property: string) =>
  link.evaluate((el, prop) => getComputedStyle(el, '::before').getPropertyValue(prop), property);

/** Reads the vertical scale from a computed transform. "none" means 1. */
function scaleY(transform: string): number {
  if (transform === 'none') return 1;
  const parts = transform.replace(/^matrix\(|\)$/g, '').split(',').map(Number);
  return parts[3] ?? 1;
}

const barScale = async (link: Locator) => scaleY(await barStyle(link, 'transform'));

/** Turns a token like --accent into the color the browser computes for it. */
function tokenColor(page: Page, token: string): Promise<string> {
  return page.evaluate((name) => {
    const probe = document.createElement('i');
    probe.style.color = `var(${name})`;
    document.body.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, token);
}

/** Loads /work/ with every script removed from the page, as if the script had not run yet. */
async function loadWithoutScripts(page: Page) {
  await page.route('**/work/', async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace(/<script[\s\S]*?<\/script>/g, '');
    await route.fulfill({
      response,
      body,
      headers: { ...response.headers(), 'content-length': String(Buffer.byteLength(body)) },
    });
  });
  await page.goto('/work/');
  await page.evaluate(() => document.fonts.ready);
}

test.describe('Work page: no layout jump when the script starts', () => {
  for (const size of [PHONE, DESKTOP]) {
    test(`the list sits in the same place before and after the script runs at ${size.width}px`, async ({ page }) => {
      await page.setViewportSize(size);

      // Before the script: the controls must already be on screen, and we note where the list starts.
      await loadWithoutScripts(page);
      await expect(controls(page)).toBeVisible();
      const before = await box(page.locator('table'));
      await page.unroute('**/work/');

      // After the script: the list must not have moved.
      await page.goto('/work/');
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('[data-work-controls][data-ready]')).toHaveCount(1);
      const after = await box(page.locator('table'));
      expect(Math.abs(after.y - before.y)).toBeLessThanOrEqual(1);
    });
  }

  test.describe('with JavaScript off', () => {
    test.use({ javaScriptEnabled: false });

    test('the controls stay hidden, and the status line already holds the starting text', async ({ page }) => {
      await page.goto('/work/');
      await expect(controls(page)).toBeHidden();
      await expect(page.locator('[data-work-status]')).toHaveText(/^Showing \d+ of \d+ items?$/);
    });
  });

  test('the status text does not change when the script starts', async ({ page }) => {
    await page.goto('/work/');
    await expect(page.locator('[data-work-controls][data-ready]')).toHaveCount(1);
    const total = await page.locator('[data-work-row]').count();
    await expect(page.locator('[data-work-status]')).toHaveText(`Showing ${total} of ${total} item${total === 1 ? '' : 's'}`);
  });
});

test.describe('Work row bar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/work/');
    await expect(controls(page)).toBeVisible();
    test.skip(await titleLink(page).count() === 0, 'No real project or certificate links are configured');
  });

  test('only title links carry a bar, and each is a 3px cobalt bar that starts folded away', async ({ page }) => {
    const links = page.locator('[data-work-row] a');
    await expect(page.locator('a.work-link')).toHaveCount(await links.count());
    expect(await links.count()).toBeGreaterThan(0);

    const link = titleLink(page);
    expect(await barStyle(link, 'width')).toBe('3px');
    expect(await barStyle(link, 'background-color')).toBe(await tokenColor(page, '--accent'));
    expect(await barStyle(link, 'left')).toBe('-12px');
    expect(await barScale(link)).toBe(0);
  });

  test('the bar grows under a mouse and folds away when the mouse leaves', async ({ page }) => {
    const link = titleLink(page);
    await link.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await link.hover();
    await expect.poll(() => barScale(link)).toBe(1);
    await page.mouse.move(2, 2);
    await expect.poll(() => barScale(link)).toBe(0);
  });

  test('keyboard focus shows the same bar as hover, plus the focus ring', async ({ page }) => {
    const link = titleLink(page);
    for (let presses = 0; presses < 60; presses += 1) {
      await page.keyboard.press('Tab');
      if (await link.evaluate((el) => el === document.activeElement)) break;
    }
    await expect(link).toBeFocused();
    await expect.poll(() => barScale(link)).toBe(1);
    expect(await link.evaluate((el) => getComputedStyle(el).outlineWidth)).toBe('2px');
  });

  test('the bar spans the height of its row cell', async ({ page }) => {
    const link = titleLink(page);
    const cell = await box(link.locator('xpath=ancestor::td[1]'));
    const height = parseFloat(await barStyle(link, 'height'));
    expect(Math.abs(height - cell.height)).toBeLessThanOrEqual(1);
  });

  test('hovering a row does not move anything on the page', async ({ page }) => {
    const link = titleLink(page);
    await link.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    const before = await box(page.locator('table'));
    const linkBefore = await box(link);
    await link.hover();
    await expect.poll(() => barScale(link)).toBe(1);
    const after = await box(page.locator('table'));
    const linkAfter = await box(link);
    expect(after).toEqual(before);
    expect(linkAfter).toEqual(linkBefore);
  });

  test.describe('on the smallest phone', () => {
    test.use({ viewport: SMALLEST_PHONE });

    test('the bar stays inside the page edge and nothing scrolls sideways', async ({ page }) => {
      const cell = await box(titleLink(page).locator('xpath=ancestor::td[1]'));
      expect(cell.x - 12).toBeGreaterThanOrEqual(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    });
  });

  test.describe('in dark mode', () => {
    test.use({ colorScheme: 'dark' });

    test('the bar uses the dark cobalt', async ({ page }) => {
      expect(await barStyle(titleLink(page), 'background-color')).toBe(await tokenColor(page, '--accent'));
    });
  });
});

test.describe('Work row bar on touch screens', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: PHONE });

  test('hover does not draw the bar, because touch screens have no hover', async ({ page }) => {
    await page.goto('/work/');
    expect(await page.evaluate(() => matchMedia('(hover: hover)').matches)).toBe(false);
    test.skip(await titleLink(page).count() === 0, 'No real project or certificate links are configured');
    const link = titleLink(page);
    await link.hover();
    await page.waitForTimeout(300);
    expect(await barScale(link)).toBe(0);
  });
});

test.describe('Work row bar with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('there is no bar, but the link still changes color on hover and shows its focus ring', async ({ page }) => {
    await page.goto('/work/');
    test.skip(await titleLink(page).count() === 0, 'No real project or certificate links are configured');
    const link = titleLink(page);
    expect(await barStyle(link, 'display')).toBe('none');

    await link.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    const before = await link.evaluate((el) => getComputedStyle(el).color);
    await link.hover();
    await expect.poll(() => link.evaluate((el) => getComputedStyle(el).color)).not.toBe(before);

    await page.mouse.move(2, 2);
    await link.focus();
    expect(await link.evaluate((el) => getComputedStyle(el).outlineWidth)).toBe('2px');
  });
});

test.describe('Work filter fade', () => {
  test('rows that come back after a filter fade in over 120ms', async ({ page }) => {
    await page.goto('/work/');
    await expect(controls(page)).toBeVisible();
    await page.getByRole('button', { name: 'Projects', exact: true }).click();
    await page.getByRole('button', { name: 'All', exact: true }).click();
    const returned = page.locator('[data-work-row][data-type="Certificate"]').first();
    await expect(returned).toHaveClass(/animate-in/);
    expect(await returned.evaluate((el) => getComputedStyle(el).animationDuration)).toBe('0.12s');
  });

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('rows come back without any animation', async ({ page }) => {
      await page.goto('/work/');
      await expect(controls(page)).toBeVisible();
      await page.getByRole('button', { name: 'Projects', exact: true }).click();
      await page.getByRole('button', { name: 'All', exact: true }).click();
      const returned = page.locator('[data-work-row][data-type="Certificate"]').first();
      await expect(returned).toBeVisible();
      expect(await returned.evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
    });
  });
});