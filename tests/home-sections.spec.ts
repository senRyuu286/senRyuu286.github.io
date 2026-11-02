import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

const PHONE = { width: 375, height: 667 };
const SMALLEST_PHONE = { width: 320, height: 568 };
const TABLET = { width: 768, height: 1024 };
const DESKTOP = { width: 1280, height: 800 };
const LIFTED = 'matrix(1, 0, 0, 1, 0, -2)';

const stops = (page: Page) => page.locator('[data-stop]');
const tiles = (page: Page) => page.locator('[data-tile]');
const card = (page: Page) => page.locator('[data-card]');
const marker = (page: Page, index: number) => stops(page).nth(index).locator('.route-marker');
const tileChip = (page: Page, tileIndex: number) => tiles(page).nth(tileIndex).locator('.chip').first();

async function box(locator: Locator) {
  const result = await locator.boundingBox();
  if (!result) throw new Error('Element has no box on the page');
  return result;
}

const css = (locator: Locator, property: string) =>
  locator.evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), property);

const pseudoCss = (locator: Locator, property: string) =>
  locator.evaluate((el, prop) => getComputedStyle(el, '::before').getPropertyValue(prop), property);

/** Turns a token like --accent into the color the browser computes for it (for example rgb(36, 71, 224)). */
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

const scrollToBottom = (page: Page) => page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));

test.describe('Home sections: order and headings', () => {
  test('one h1, then three h2 sections in order, with h3 only inside the capstone card and the tiles', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveCount(1);

    const headings = page.locator('main h2');
    await expect(headings).toHaveCount(3);
    await expect(headings.nth(0)).toHaveText('Featured capstone');
    await expect(headings.nth(1)).toHaveText('Tech stack');
    await expect(headings.nth(2)).not.toHaveText('');

    await expect(card(page).locator('h3')).toHaveCount(1);
    const tileCount = await tiles(page).count();
    expect(tileCount).toBeGreaterThanOrEqual(3);
    await expect(tiles(page).locator('h3')).toHaveCount(tileCount);
    await expect(page.locator('main h3')).toHaveCount(1 + tileCount);
    await expect(page.locator('main h4, main h5, main h6')).toHaveCount(0);
  });

  test('the sections sit below the hero and run top to bottom in order', async ({ page }) => {
    await page.goto('/');
    const hero = await box(page.locator('[data-hero]'));
    const first = await box(stops(page).nth(0));
    const second = await box(stops(page).nth(1));
    const third = await box(stops(page).nth(2));
    expect(first.y).toBeGreaterThanOrEqual(hero.y + hero.height);
    expect(second.y).toBeGreaterThan(first.y + first.height - 1);
    expect(third.y).toBeGreaterThan(second.y + second.height - 1);
  });

  test('the closing stop has a heading, a Contact me button, and the About link stays under the tiles', async ({ page }) => {
    await page.goto('/');
    const closing = stops(page).nth(2);
    await expect(closing.getByRole('heading', { level: 2 })).toHaveCount(1);
    await expect(closing.getByRole('link', { name: 'Contact me', exact: true })).toHaveAttribute('href', '/contact/');
    await expect(stops(page).nth(1).getByRole('link', { name: 'See my learning journey on the About page' })).toHaveAttribute(
      'href',
      '/about/',
    );
  });
});

test.describe('Route spine', () => {
  test('has one numbered marker per section, hidden from assistive technology', async ({ page }) => {
    await page.goto('/');
    await expect(stops(page)).toHaveCount(3);
    for (let index = 0; index < 3; index += 1) {
      await expect(marker(page, index)).toHaveAttribute('aria-hidden', 'true');
      await expect(marker(page, index)).toHaveText(String(index + 1));
    }
  });

  test('each stop is a region named by its own heading, with no number in the name', async ({ page }) => {
    await page.goto('/');
    for (let index = 0; index < 3; index += 1) {
      const stop = stops(page).nth(index);
      const labelledBy = await stop.getAttribute('aria-labelledby');
      expect(labelledBy, `stop ${index + 1} needs aria-labelledby`).not.toBeNull();
      const heading = stop.locator(`h2#${labelledBy}`);
      await expect(heading).toHaveCount(1);
      const name = (await heading.textContent()) ?? '';
      expect(name.trim()).not.toMatch(/^\d/);
      await expect(page.getByRole('region', { name: name.trim(), exact: true })).toHaveCount(1);
    }
  });

  test('markers are 28px yellow squares with a 12px radius, ink on yellow', async ({ page }) => {
    await page.goto('/');
    const signal = await tokenColor(page, '--signal');
    const signalInk = await tokenColor(page, '--signal-ink');
    for (let index = 0; index < 3; index += 1) {
      const area = await box(marker(page, index));
      expect(area.width).toBe(28);
      expect(area.height).toBe(28);
      expect(await css(marker(page, index), 'border-radius')).toBe('12px');
      expect(await css(marker(page, index), 'background-color')).toBe(signal);
      expect(await css(marker(page, index), 'color')).toBe(signalInk);
    }
  });

  test('each marker lines up with the first line of its heading', async ({ page }) => {
    await page.goto('/');
    for (let index = 0; index < 3; index += 1) {
      const dot = await box(marker(page, index));
      const heading = await box(stops(page).nth(index).locator('h2'));
      const firstLineMiddle = heading.y + (await stops(page).nth(index).locator('h2').evaluate((el) => parseFloat(getComputedStyle(el).lineHeight))) / 2;
      expect(Math.abs(dot.y + dot.height / 2 - firstLineMiddle)).toBeLessThanOrEqual(2);
    }
  });

  test('the line is a 3px cobalt bar that runs from one marker to the next, and the last stop has none', async ({ page }) => {
    await page.goto('/');
    const accent = await tokenColor(page, '--accent');
    for (let index = 0; index < 2; index += 1) {
      const stop = stops(page).nth(index);
      expect(await pseudoCss(stop, 'width')).toBe('3px');
      expect(await pseudoCss(stop, 'background-color')).toBe(accent);
      const stopBox = await box(stop);
      const length = parseFloat(await pseudoCss(stop, 'height'));
      const nextMiddle = (await box(marker(page, index + 1))).y + 14;
      // The line starts at the middle of its own marker (14px down) and should end at the middle of the next one.
      expect(Math.abs(stopBox.y + 14 + length - nextMiddle)).toBeLessThanOrEqual(1);
    }
    expect(await pseudoCss(stops(page).nth(2), 'content')).toBe('none');
  });

  test('the line sits under the middle of its markers', async ({ page }) => {
    await page.goto('/');
    const stop = stops(page).nth(0);
    const dot = await box(marker(page, 0));
    const left = parseFloat(await pseudoCss(stop, 'left'));
    const width = parseFloat(await pseudoCss(stop, 'width'));
    const stopBox = await box(stop);
    expect(Math.abs(stopBox.x + left + width / 2 - (dot.x + dot.width / 2))).toBeLessThanOrEqual(0.5);
  });

  test('the scroll-drawn code sits behind @supports and prefers-reduced-motion: no-preference, with a 1ms duration', async ({ page }) => {
    await page.goto('/');
    const hits = await page.evaluate(() => {
      const found: Array<{ chain: string[]; duration: string }> = [];
      const walk = (rules: CSSRuleList, chain: string[]) => {
        for (const rule of Array.from(rules)) {
          if (rule instanceof CSSStyleRule && rule.style.getPropertyValue('animation-timeline').includes('view')) {
            found.push({ chain, duration: rule.style.getPropertyValue('animation-duration') });
          }
          const nested = (rule as CSSGroupingRule).cssRules;
          if (nested) {
            const label =
              rule instanceof CSSSupportsRule
                ? `supports: ${rule.conditionText}`
                : rule instanceof CSSMediaRule
                  ? `media: ${rule.conditionText}`
                  : 'other';
            walk(nested, [...chain, label]);
          }
        }
      };
      for (const sheet of Array.from(document.styleSheets)) walk(sheet.cssRules, []);
      return found;
    });
    expect(hits.length).toBeGreaterThan(0);
    for (const hit of hits) {
      expect(hit.chain.some((label) => label.startsWith('supports:') && label.includes('animation-timeline'))).toBe(true);
      expect(hit.chain.some((label) => label.startsWith('media:') && label.includes('no-preference'))).toBe(true);
      expect(hit.duration).toBe('1ms');
    }
  });

  test('with motion allowed, the line draws itself as you scroll and ends fully drawn', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/');
    const second = stops(page).nth(1);
    expect(scaleY(await pseudoCss(second, 'transform'))).toBeLessThan(1);
    await scrollToBottom(page);
    await expect.poll(async () => scaleY(await pseudoCss(second, 'transform'))).toBe(1);
    await expect.poll(async () => scaleY(await pseudoCss(stops(page).nth(0), 'transform'))).toBe(1);
  });

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('the line is fully drawn and still before any scrolling', async ({ page }) => {
      await page.setViewportSize(DESKTOP);
      await page.goto('/');
      for (const index of [0, 1]) {
        expect(await pseudoCss(stops(page).nth(index), 'animation-name')).toBe('none');
        expect(scaleY(await pseudoCss(stops(page).nth(index), 'transform'))).toBe(1);
      }
    });
  });

  test.describe('with JavaScript off', () => {
    test.use({ javaScriptEnabled: false });

    test('every section, marker and button is there, and the line ends fully drawn', async ({ page }) => {
      await page.setViewportSize(DESKTOP);
      await page.goto('/');
      await expect(stops(page)).toHaveCount(3);
      for (let index = 0; index < 3; index += 1) await expect(marker(page, index)).toBeVisible();
      await expect(page.getByRole('link', { name: 'Read the case study' })).toBeVisible();
      await expect(tiles(page).first()).toBeVisible();
      await expect(stops(page).nth(2).getByRole('link', { name: 'Contact me' })).toBeVisible();
      await stops(page).nth(2).scrollIntoViewIfNeeded();
      await page.mouse.wheel(0, 4000);
      await expect.poll(async () => scaleY(await pseudoCss(stops(page).nth(1), 'transform'))).toBe(1);
    });
  });
});

test.describe('Featured capstone card', () => {
  test('shows the title, summary and stack chips, and no role row or case study sections', async ({ page }) => {
    await page.goto('/');
    await expect(card(page).locator('h3')).toBeVisible();
    await expect(card(page).locator('.chip').first()).toBeVisible();
    await expect(card(page).getByText('Role', { exact: true })).toHaveCount(0);
    await expect(card(page).locator('dl')).toHaveCount(0);
    for (const word of ['Problem', 'Approach', 'Result', 'What I learned']) {
      await expect(card(page).getByText(word, { exact: true })).toHaveCount(0);
    }
  });

  for (const size of [SMALLEST_PHONE, TABLET, DESKTOP]) {
    test(`shows the [CAPSTONE SCREENSHOT] placeholder at a 16:10 ratio at ${size.width}px`, async ({ page }) => {
      await page.setViewportSize(size);
      await page.goto('/');
      const shot = page.locator('[data-card-screenshot]');
      await expect(shot).toContainText('[CAPSTONE SCREENSHOT]');
      const area = await box(shot);
      expect(area.width / area.height).toBeCloseTo(1.6, 1);
    });
  }

  test('links to the case study, and shows GitHub and demo links only when they are real addresses', async ({ page }) => {
    await page.goto('/');
    await expect(card(page).getByRole('link', { name: 'Read the case study' })).toHaveAttribute('href', '/work/capstone/');
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

test.describe('Tech tiles', () => {
  test('are one full-width column on a phone', async ({ page }) => {
    await page.setViewportSize(PHONE);
    await page.goto('/');
    const count = await tiles(page).count();
    const boxes = [];
    for (let index = 0; index < count; index += 1) boxes.push(await box(tiles(page).nth(index)));
    for (const area of boxes) {
      expect(area.x).toBeCloseTo(boxes[0]!.x, 0);
      expect(area.width).toBeCloseTo(boxes[0]!.width, 0);
    }
    for (let index = 1; index < count; index += 1) {
      expect(boxes[index]!.y).toBeGreaterThanOrEqual(boxes[index - 1]!.y + boxes[index - 1]!.height);
    }
  });

  for (const size of [TABLET, DESKTOP]) {
    test(`use the staggered two-column pattern at ${size.width}px: yellow tile full width, then a wide and a narrow tile`, async ({ page }) => {
      await page.setViewportSize(size);
      await page.goto('/');
      const grid = await box(page.locator('[data-tiles]'));
      const first = await box(tiles(page).nth(0));
      const second = await box(tiles(page).nth(1));
      const third = await box(tiles(page).nth(2));
      expect(first.width).toBeCloseTo(grid.width, 0);
      expect(Math.abs(second.y - third.y)).toBeLessThanOrEqual(1);
      expect(second.x).toBeLessThan(third.x);
      expect(second.width).toBeGreaterThan(third.width);
      const ratio = second.width / third.width;
      expect(ratio).toBeGreaterThan(1.3);
      expect(ratio).toBeLessThan(1.7);
      expect(second.x + second.width).toBeLessThanOrEqual(third.x);
      expect(third.x + third.width).toBeLessThanOrEqual(grid.x + grid.width + 0.5);
    });
  }

  test('exactly one tile is yellow, and it is the first', async ({ page }) => {
    await page.goto('/');
    const signal = await tokenColor(page, '--signal');
    const colors = await tiles(page).evaluateAll((els) => els.map((el) => getComputedStyle(el).backgroundColor));
    expect(colors.filter((color) => color === signal)).toHaveLength(1);
    expect(colors[0]).toBe(signal);
    const surface = await tokenColor(page, '--surface');
    for (const color of colors.slice(1)) expect(color).toBe(surface);
  });

  test('other tiles have a 1px rule border, and every tile has a 12px radius', async ({ page }) => {
    await page.goto('/');
    const rule = await tokenColor(page, '--rule');
    const count = await tiles(page).count();
    for (let index = 0; index < count; index += 1) {
      expect(await css(tiles(page).nth(index), 'border-radius')).toBe('12px');
    }
    for (let index = 1; index < count; index += 1) {
      expect(await css(tiles(page).nth(index), 'border-top-width')).toBe('1px');
      expect(await css(tiles(page).nth(index), 'border-top-color')).toBe(rule);
    }
  });

  test('use real list markup and contain nothing to tab to', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('ul[data-tiles] > li[data-tile]').first()).toBeVisible();
    await expect(tiles(page).first().locator('ul > li .chip').first()).toBeVisible();
    await expect(page.locator('[data-tiles] a, [data-tiles] button, [data-tiles] [tabindex]')).toHaveCount(0);
  });

  test('do not animate', async ({ page }) => {
    await page.goto('/');
    const states = await tiles(page).evaluateAll((els) =>
      els.map((el) => {
        const style = getComputedStyle(el);
        return [style.animationName, style.transitionDuration, style.transform];
      }),
    );
    for (const state of states) expect(state).toEqual(['none', '0s', 'none']);
  });
});

test.describe('Chips', () => {
  test('are plain labels: no pointer cursor and no focus stop', async ({ page }) => {
    await page.goto('/');
    const chip = tileChip(page, 1);
    expect(await css(chip, 'cursor')).not.toBe('pointer');
    await expect(chip).not.toHaveAttribute('tabindex', /.*/);
    expect(await chip.evaluate((el) => el.tagName)).toBe('SPAN');
  });

  test('rise 2px under a mouse and turn the border cobalt', async ({ page }) => {
    await page.goto('/');
    const chip = tileChip(page, 1);
    await chip.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    expect(await css(chip, 'transform')).toBe('none');
    const before = await css(chip, 'border-top-color');
    await chip.hover();
    await expect.poll(() => css(chip, 'transform')).toBe(LIFTED);
    const accent = await tokenColor(page, '--accent');
    await expect.poll(() => css(chip, 'border-top-color')).toBe(accent);
    expect(before).not.toBe(accent);
  });

  test('hold steady when the mouse rests on the bottom edge and wobbles a little', async ({ page }) => {
    await page.goto('/');
    const chip = tileChip(page, 1);
    await chip.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    const area = await box(chip);
    const x = area.x + area.width / 2 - 5;
    const y = area.y + area.height - 1;
    await page.mouse.move(x, y);
    await expect.poll(() => css(chip, 'transform')).toBe(LIFTED);

    const samples: string[] = [];
    for (let step = 1; step <= 10; step += 1) {
      await page.mouse.move(x + step, y);
      await page.waitForTimeout(150);
      samples.push(await css(chip, 'transform'));
    }
    expect(new Set(samples)).toEqual(new Set([LIFTED]));
  });

  test('inside the yellow tile the hover border is signal-ink', async ({ page }) => {
    await page.goto('/');
    const chip = tileChip(page, 0);
    await chip.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await chip.hover();
    await expect.poll(() => css(chip, 'transform')).toBe(LIFTED);
    const signalInk = await tokenColor(page, '--signal-ink');
    await expect.poll(() => css(chip, 'border-top-color')).toBe(signalInk);
  });

  test('have a 2px hit strip under them, so the lift cannot flicker', async ({ page }) => {
    await page.goto('/');
    const strip = await tileChip(page, 1).evaluate((el) => {
      const style = getComputedStyle(el, '::after');
      return { height: style.height, content: style.content, position: style.position };
    });
    expect(strip).toEqual({ height: '2px', content: '""', position: 'absolute' });
  });

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('change their border color on hover but do not move', async ({ page }) => {
      await page.goto('/');
      const chip = tileChip(page, 1);
      await chip.evaluate((el) => el.scrollIntoView({ block: 'center' }));
      const before = await css(chip, 'border-top-color');
      await chip.hover();
      await expect.poll(() => css(chip, 'border-top-color')).not.toBe(before);
      expect(await css(chip, 'transform')).toBe('none');
    });
  });
});

test.describe('Home sections on small screens', () => {
  test.use({ viewport: SMALLEST_PHONE });

  test('have no sideways scrolling, and the text column stays wide enough to read', async ({ page }) => {
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    for (let index = 0; index < 3; index += 1) {
      const heading = await box(stops(page).nth(index).locator('h2'));
      expect(heading.width, `stop ${index + 1} text width`).toBeGreaterThanOrEqual(240);
    }
    const fits = await tiles(page).evaluateAll((els) => els.every((el) => el.scrollWidth <= el.clientWidth));
    expect(fits).toBe(true);
    const cardFits = await card(page).evaluate((el) => el.scrollWidth <= el.clientWidth);
    expect(cardFits).toBe(true);
  });
});

test.describe('Keyboard', () => {
  test('focus moves down the page in order and never hides under the sticky bar', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/');
    const bar = await box(page.getByRole('banner'));
    await page.locator('[data-hero]').getByRole('link', { name: 'Contact me', exact: true }).focus();
    for (const name of ['Read the case study', 'See my learning journey on the About page', 'Contact me']) {
      await page.keyboard.press('Tab');
      const focused = page.locator(':focus');
      await expect(focused).toHaveText(name);
      const area = await box(focused);
      expect(area.y, `${name} should clear the bar`).toBeGreaterThanOrEqual(bar.y + bar.height);
    }
  });
});

test.describe('Layout shift below the hero', () => {
  for (const size of [PHONE, DESKTOP]) {
    test(`stays very small at ${size.width}px, even after scrolling to the bottom`, async ({ page }) => {
      await page.setViewportSize(size);
      await page.addInitScript(() => {
        (window as unknown as { __cls: number }).__cls = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as unknown as Array<{ value: number; hadRecentInput: boolean }>) {
            if (!entry.hadRecentInput) (window as unknown as { __cls: number }).__cls += entry.value;
          }
        }).observe({ type: 'layout-shift', buffered: true });
      });
      await page.goto('/');
      await expect(page.locator('[data-hero]').locator('> *').last()).toHaveCSS('opacity', '1');
      await scrollToBottom(page);
      await page.waitForTimeout(300);
      const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
      expect(cls).toBeLessThan(0.02);
    });
  }
});

test.describe('Accessibility of the new sections', () => {
  for (const scheme of ['light', 'dark'] as const) {
    test(`have no serious or critical issues in ${scheme} mode with reduced motion`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
      await page.goto('/');
      const results = await new AxeBuilder({ page })
        .include('[data-spine]')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious).toEqual([]);
    });
  }
});