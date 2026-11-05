import { expect, test, type Locator, type Page } from '@playwright/test';

const WIDE = { width: 1024, height: 768 };
const JUST_UNDER = { width: 1023, height: 768 };
const PHONE = { width: 375, height: 667 };
const SMALLEST_PHONE = { width: 320, height: 568 };

const hero = (page: Page) => page.locator('[data-hero]');
const portrait = (page: Page) => page.locator('[data-portrait]');
const portraitBox = (page: Page) => page.locator('[data-portrait-box]');
const heroButton = (page: Page, name: string) => hero(page).getByRole('link', { name, exact: true });

async function box(locator: Locator) {
  const result = await locator.boundingBox();
  if (!result) throw new Error('Element has no box on the page');
  return result;
}

const css = (locator: Locator, property: string) =>
  locator.evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), property);

test.describe('Home hero layout', () => {
  test('sits side by side from 1024px', async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto('/');
    const sign = await box(hero(page));
    const frame = await box(portrait(page));
    expect(frame.x).toBeGreaterThanOrEqual(sign.x + sign.width);
    expect(frame.y).toBeLessThan(sign.y + sign.height);
  });

  test('stacks below 1024px, sign panel first', async ({ page }) => {
    await page.setViewportSize(JUST_UNDER);
    await page.goto('/');
    const sign = await box(hero(page));
    const frame = await box(portrait(page));
    expect(frame.y).toBeGreaterThanOrEqual(sign.y + sign.height);
  });

  test('has one h1 and two hero buttons that link to Work and Contact', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toContainText('BSIT student building');
    await expect(heroButton(page, 'View my work')).toHaveAttribute('href', '/work/');
    await expect(heroButton(page, 'Contact me')).toHaveAttribute('href', '/#contact');
  });

  test('hero buttons have 44px tall targets', async ({ page }) => {
    await page.setViewportSize(PHONE);
    await page.goto('/');
    for (const name of ['View my work', 'Contact me']) {
      expect((await box(heroButton(page, name))).height, name).toBeGreaterThanOrEqual(44);
    }
  });
});

test.describe('Portrait frame', () => {
  for (const size of [SMALLEST_PHONE, PHONE, { width: 768, height: 900 }, WIDE, { width: 1440, height: 900 }]) {
    test(`keeps a 4:5 ratio at ${size.width}px, so nothing shifts when a photo arrives`, async ({ page }) => {
      await page.setViewportSize(size);
      await page.goto('/');
      const frame = await box(portraitBox(page));
      expect(frame.width / frame.height).toBeCloseTo(0.8, 2);
    });
  }

  test('shows the visible placeholder label until a photo exists', async ({ page }) => {
    await page.goto('/');
    await expect(portraitBox(page)).toContainText('[PORTRAIT PHOTO]');
  });

  test('has two decorative brackets in opposite corners', async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto('/');
    const brackets = page.locator('[data-bracket]');
    await expect(brackets).toHaveCount(2);
    await expect(brackets.nth(0)).toHaveAttribute('aria-hidden', 'true');
    await expect(brackets.nth(1)).toHaveAttribute('aria-hidden', 'true');

    const frame = await box(portraitBox(page));
    const first = await box(brackets.nth(0));
    const second = await box(brackets.nth(1));
    // First sits on the top-left corner, second on the bottom-right corner.
    expect(first.x).toBeLessThan(frame.x);
    expect(first.y).toBeLessThan(frame.y);
    expect(second.x + second.width).toBeGreaterThan(frame.x + frame.width);
    expect(second.y + second.height).toBeGreaterThan(frame.y + frame.height);
  });
});

test.describe('Hero reveal', () => {
  test('rises and fades in with an 80ms stagger, then rests fully visible', async ({ page }) => {
    await page.goto('/');
    const lines = hero(page).locator('> *');
    await expect(lines).toHaveCount(4);
    const delays = await lines.evaluateAll((els) => els.map((el) => getComputedStyle(el).animationDelay));
    expect(delays).toEqual(['0s', '0.08s', '0.16s', '0.24s']);
    const names = await lines.evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName));
    expect(new Set(names)).toEqual(new Set(['enter']));

    for (let index = 0; index < 4; index += 1) {
      await expect.poll(() => css(lines.nth(index), 'opacity')).toBe('1');
      await expect.poll(() => css(lines.nth(index), 'transform')).toBe('none');
    }
  });

  test('brackets scale out from their corners, then rest', async ({ page }) => {
    await page.setViewportSize(WIDE);
    await page.goto('/');
    const brackets = page.locator('[data-bracket]');
    expect(await css(brackets.nth(0), 'transform-origin')).toBe('0px 0px');
    for (const index of [0, 1]) {
      await expect.poll(() => css(brackets.nth(index), 'transform')).toBe('none');
    }
  });

  test.describe('with JavaScript off', () => {
    test.use({ javaScriptEnabled: false });

    test('the whole hero is visible and complete', async ({ page }) => {
      await page.goto('/');
      await expect(hero(page).locator('h1')).toBeVisible();
      await expect(hero(page).locator('h1')).toHaveCSS('opacity', '1');
      await expect(heroButton(page, 'View my work')).toBeVisible();
      await expect(heroButton(page, 'Contact me')).toBeVisible();
      await expect(portraitBox(page)).toBeVisible();
    });
  });

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('every line is visible at once, with no animation', async ({ page }) => {
      await page.goto('/');
      const lines = hero(page).locator('> *');
      const states = await lines.evaluateAll((els) =>
        els.map((el) => {
          const style = getComputedStyle(el);
          return [style.animationName, style.opacity, style.transform];
        }),
      );
      for (const state of states) expect(state).toEqual(['none', '1', 'none']);
    });

    test('the brackets are drawn and still', async ({ page }) => {
      await page.setViewportSize(WIDE);
      await page.goto('/');
      for (const index of [0, 1]) {
        const bracket = page.locator('[data-bracket]').nth(index);
        expect(await css(bracket, 'animation-name')).toBe('none');
        expect(await css(bracket, 'opacity')).toBe('1');
        expect(await css(bracket, 'transform')).toBe('none');
      }
    });

    test('buttons change color on hover but do not lift', async ({ page }) => {
      await page.goto('/');
      const button = heroButton(page, 'Contact me');
      const before = await css(button, 'background-color');
      await button.hover();
      await expect.poll(() => css(button, 'background-color')).not.toBe(before);
      expect(await css(button, 'transform')).toBe('none');
    });
  });
});

test.describe('Button lift', () => {
  test('a hero button rises 2px on hover and settles back while pressed', async ({ page }) => {
    await page.goto('/');
    await expect(hero(page).locator('> *').last()).toHaveCSS('opacity', '1');
    const button = heroButton(page, 'View my work');
    expect(await css(button, 'transform')).toBe('none');
    await button.hover();
    await expect.poll(() => css(button, 'transform')).toBe('matrix(1, 0, 0, 1, 0, -2)');
    await page.mouse.down();
    await expect.poll(async () => ['none', 'matrix(1, 0, 0, 1, 0, 0)'].includes(await css(button, 'transform'))).toBe(true);
    await page.mouse.up();
  });

  test('the lift stays steady when the mouse rests on the bottom edge of a button', async ({ page }) => {
    await page.goto('/');
    await expect(hero(page).locator('> *').last()).toHaveCSS('opacity', '1');
    const button = heroButton(page, 'View my work');
    await button.scrollIntoViewIfNeeded();
    const area = await box(button);
    const x = area.x + area.width / 2;
    const y = area.y + area.height - 1;
    await page.mouse.move(x, y);
    await expect.poll(() => css(button, 'transform')).toBe('matrix(1, 0, 0, 1, 0, -2)');

    // A real hand never rests perfectly still. Nudge the mouse along the bottom edge and check each time.
    const samples: string[] = [];
    for (let step = 1; step <= 10; step += 1) {
      await page.mouse.move(x + step, y);
      await page.waitForTimeout(150);
      samples.push(await css(button, 'transform'));
    }
    expect(new Set(samples)).toEqual(new Set(['matrix(1, 0, 0, 1, 0, -2)']));
  });

  test('buttons on other pages lift too', async ({ page }) => {
    await page.goto('/#contact');
    const send = page.getByRole('button', { name: /^send message$/i });
    await send.hover();
    await expect.poll(() => css(send, 'transform')).toBe('matrix(1, 0, 0, 1, 0, -2)');
  });
});

test.describe('Hero on the smallest phone (320px)', () => {
  test.use({ viewport: SMALLEST_PHONE });

  test('has no sideways scrolling and the headline fits its panel', async ({ page }) => {
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    const fits = await hero(page).locator('h1').evaluate((el) => el.scrollWidth <= el.clientWidth);
    expect(fits).toBe(true);
    const bracket = await box(page.locator('[data-bracket]').first());
    expect(bracket.x).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Layout shift on Home', () => {
  for (const size of [PHONE, { width: 1280, height: 800 }]) {
    test(`stays very small at ${size.width}px`, async ({ page }) => {
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
      await expect(hero(page).locator('> *').last()).toHaveCSS('opacity', '1');
      const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
      expect(cls).toBeLessThan(0.02);
    });
  }
});