import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

const SMALLEST_PHONE = { width: 320, height: 568 };
const TABLET = { width: 768, height: 1024 };
const DESKTOP = { width: 1280, height: 800 };

const journey = (page: Page) => page.locator('ol[data-journey]');
const stops = (page: Page) => journey(page).locator(':scope > li');
const marker = (page: Page, index: number) => stops(page).nth(index).locator('.route-marker');

async function box(locator: Locator) {
  const result = await locator.boundingBox();
  if (!result) throw new Error('Element has no box on the page');
  return result;
}

const css = (locator: Locator, property: string) =>
  locator.evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), property);

const pseudoCss = (locator: Locator, property: string) =>
  locator.evaluate((el, prop) => getComputedStyle(el, '::before').getPropertyValue(prop), property);

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

/** Reads the vertical scale from a computed transform. "none" means 1. */
function scaleY(transform: string): number {
  if (transform === 'none') return 1;
  const parts = transform.replace(/^matrix\(|\)$/g, '').split(',').map(Number);
  return parts[3] ?? 1;
}

test.describe('Capstone page', () => {
  test('has one h1, a summary, and none of the removed case study sections', async ({ page }) => {
    await page.goto('/work/capstone/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main h2, main h3, main h4')).toHaveCount(0);
    await expect(page.locator('main dl')).toHaveCount(0);
    const article = page.locator('article');
    for (const word of ['Role', 'Problem', 'Approach', 'Outcome', 'Result', 'What I learned']) {
      await expect(article.getByText(word, { exact: true })).toHaveCount(0);
    }
    expect(await article.locator('> p').count()).toBe(2);
  });

  test('shows the stack as chips in a labelled list', async ({ page }) => {
    await page.goto('/work/capstone/');
    const list = page.getByRole('list', { name: 'Stack' });
    await expect(list).toHaveCount(1);
    await expect(list.locator('li .chip').first()).toBeVisible();
  });

  test('keeps its links near the top: chips, then links, then the screenshot', async ({ page }) => {
    await page.goto('/work/capstone/');
    const chips = await box(page.getByRole('list', { name: 'Stack' }));
    const shot = await box(page.locator('[data-card-screenshot]'));
    expect(shot.y).toBeGreaterThan(chips.y + chips.height);
    const links = page.locator('[data-case-links]');
    if ((await links.count()) > 0) {
      const area = await box(links);
      expect(area.y).toBeGreaterThan(chips.y + chips.height - 1);
      expect(area.y + area.height).toBeLessThanOrEqual(shot.y);
    }
  });

  test('real links are buttons that open safely in a new tab, and placeholders stay plain text', async ({ page }) => {
    await page.goto('/work/capstone/');
    const items = page.locator('[data-case-links] > li');
    const count = await items.count();
    for (let index = 0; index < count; index += 1) {
      const item = items.nth(index);
      if ((await item.locator('a').count()) > 0) {
        await expect(item.locator('a')).toHaveAttribute('target', '_blank');
        await expect(item.locator('a')).toHaveAttribute('rel', 'noopener noreferrer');
      } else {
        // A placeholder such as [GITHUB LINK] is shown as visible text, so the launch gate can catch it.
        expect(((await item.textContent()) ?? '').trim().startsWith('[')).toBe(true);
      }
    }
  });

  for (const size of [SMALLEST_PHONE, TABLET, DESKTOP]) {
    test(`shows the [CAPSTONE SCREENSHOT] placeholder at 16:10 at ${size.width}px, never wider than the text column`, async ({ page }) => {
      await page.setViewportSize(size);
      await page.goto('/work/capstone/');
      const shot = page.locator('[data-card-screenshot]');
      await expect(shot).toContainText('[CAPSTONE SCREENSHOT]');
      const area = await box(shot);
      expect(area.width / area.height).toBeCloseTo(1.6, 1);
      expect(area.width).toBeLessThanOrEqual(768 + 1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    });
  }

  test('the page and the Home card share one screenshot frame', async ({ page }) => {
    await page.goto('/');
    const home = await page.locator('[data-card-screenshot]').evaluate((el) => el.className);
    await page.goto('/work/capstone/');
    const detail = await page.locator('[data-card-screenshot]').evaluate((el) => el.className);
    for (const shared of ['aspect-16/10', 'rounded-control', 'border-rule', 'bg-paper']) {
      expect(home).toContain(shared);
      expect(detail).toContain(shared);
    }
  });
});

test.describe('About journey on the route spine', () => {
  test('is still an ordered list with at least three stops, each a list item on the spine', async ({ page }) => {
    await page.goto('/about/');
    await expect(journey(page)).toHaveCount(1);
    await expect(journey(page)).toHaveAttribute('role', 'list');
    await expect(journey(page)).toHaveClass(/route-spine/);
    expect(await stops(page).count()).toBeGreaterThanOrEqual(3);
    // Only list items sit directly inside the list, and every one is a stop.
    expect(await journey(page).locator(':scope > *:not(li)').count()).toBe(0);
    expect(await journey(page).locator(':scope > li:not([data-stop])').count()).toBe(0);
  });

  test('numbers its stops 1 to n with hidden 28px yellow markers', async ({ page }) => {
    await page.goto('/about/');
    const count = await stops(page).count();
    const signal = await tokenColor(page, '--signal');
    for (let index = 0; index < count; index += 1) {
      await expect(marker(page, index)).toHaveAttribute('aria-hidden', 'true');
      await expect(marker(page, index)).toHaveText(String(index + 1));
      const area = await box(marker(page, index));
      expect(area.width).toBe(28);
      expect(area.height).toBe(28);
      expect(await css(marker(page, index), 'background-color')).toBe(signal);
    }
  });

  test('the line is a 3px cobalt bar between markers, and the last stop has none', async ({ page }) => {
    await page.goto('/about/');
    const count = await stops(page).count();
    const accent = await tokenColor(page, '--accent');
    for (let index = 0; index < count - 1; index += 1) {
      const stop = stops(page).nth(index);
      expect(await pseudoCss(stop, 'width')).toBe('3px');
      expect(await pseudoCss(stop, 'background-color')).toBe(accent);
      const stopBox = await box(stop);
      const length = parseFloat(await pseudoCss(stop, 'height'));
      const nextMiddle = (await box(marker(page, index + 1))).y + 14;
      expect(Math.abs(stopBox.y + 14 + length - nextMiddle)).toBeLessThanOrEqual(1);
    }
    expect(await pseudoCss(stops(page).nth(count - 1), 'content')).toBe('none');
  });

  test('each marker lines up with the first line of its stop', async ({ page }) => {
    await page.goto('/about/');
    const count = await stops(page).count();
    for (let index = 0; index < count; index += 1) {
      const dot = await box(marker(page, index));
      const title = stops(page).nth(index).locator('p').first();
      const titleBox = await box(title);
      const lineHeight = await title.evaluate((el) => parseFloat(getComputedStyle(el).lineHeight));
      expect(Math.abs(dot.y + dot.height / 2 - (titleBox.y + lineHeight / 2))).toBeLessThanOrEqual(2);
    }
  });

  test('the old round journey markers are gone', async ({ page }) => {
    await page.goto('/about/');
    await expect(journey(page).locator('.rounded-full')).toHaveCount(0);
    await expect(journey(page).locator('.size-10')).toHaveCount(0);
  });

  test('keeps the same headings, and the skills still use the spec table', async ({ page }) => {
    await page.goto('/about/');
    await expect(page.locator('h1')).toHaveCount(1);
    const headings = page.locator('main h2');
    await expect(headings).toHaveCount(3);
    await expect(headings.nth(0)).toHaveText('Learning journey');
    await expect(headings.nth(1)).toHaveText('Skills');
    await expect(headings.nth(2)).toHaveText('Currently learning');
    await expect(page.locator('main h3')).toHaveCount(0);
    await expect(page.locator('section[aria-labelledby="skills-heading"] dl')).toHaveCount(1);
    await expect(page.locator('[data-tiles]')).toHaveCount(0);
  });

  test('has nothing in the journey to tab to', async ({ page }) => {
    await page.goto('/about/');
    await expect(journey(page).locator('a, button, [tabindex]')).toHaveCount(0);
  });

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('the line is fully drawn and still', async ({ page }) => {
      await page.setViewportSize(DESKTOP);
      await page.goto('/about/');
      const count = await stops(page).count();
      for (let index = 0; index < count - 1; index += 1) {
        expect(await pseudoCss(stops(page).nth(index), 'animation-name')).toBe('none');
        expect(scaleY(await pseudoCss(stops(page).nth(index), 'transform'))).toBe(1);
      }
    });
  });

  test.describe('with JavaScript off', () => {
    test.use({ javaScriptEnabled: false });

    test('the whole journey is there and readable', async ({ page }) => {
      await page.goto('/about/');
      const count = await stops(page).count();
      expect(count).toBeGreaterThanOrEqual(3);
      for (let index = 0; index < count; index += 1) {
        await expect(stops(page).nth(index)).toBeVisible();
        await expect(marker(page, index)).toBeVisible();
      }
    });
  });

  test.describe('on the smallest phone', () => {
    test.use({ viewport: SMALLEST_PHONE });

    test('has no sideways scrolling, and the text stays wide enough to read', async ({ page }) => {
      await page.goto('/about/');
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
      const count = await stops(page).count();
      for (let index = 0; index < count; index += 1) {
        const text = await box(stops(page).nth(index).locator('p').first());
        expect(text.width, `stop ${index + 1} text width`).toBeGreaterThanOrEqual(240);
      }
    });
  });

  for (const scheme of ['light', 'dark'] as const) {
    test(`the journey has no serious or critical accessibility issues in ${scheme} mode`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
      await page.goto('/about/');
      const results = await new AxeBuilder({ page })
        .include('[data-journey]')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious).toEqual([]);
    });
  }
});