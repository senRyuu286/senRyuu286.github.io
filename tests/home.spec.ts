import { expect, test } from '@playwright/test';

test.describe('Home hero', () => {
  for (const width of [320, 375, 768, 1024, 1440]) {
    test(`fits at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/');
      const hero = page.locator('[data-hero]');
      await expect(hero.getByRole('heading', { level: 1, name: 'Justin Ramas' })).toBeVisible();
      await expect(hero.locator('[data-portrait-box] img')).toBeVisible();
      await expect(hero.getByRole('heading', { name: 'Areas of interest' })).toBeVisible();
      await expect(hero.getByRole('link', { name: 'Scroll to explore selected works' })).toHaveAttribute('href', '#selected-works-heading');
      await expect(hero.getByRole('link', { name: 'View my work' })).toHaveAttribute('href', '/work/');
      await expect(hero.getByRole('link', { name: 'Contact me' })).toHaveAttribute('href', '/#contact');
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
      const heading = await hero.locator('h1').boundingBox();
      const nav = await page.locator('.nav-shell').boundingBox();
      const nameText = await hero.locator('h1 text').boundingBox();
      const intro = await hero.locator('.hero-intro').boundingBox();
      const work = await hero.getByRole('link', { name: 'View my work' }).boundingBox();
      const contact = await hero.getByRole('link', { name: 'Contact me' }).boundingBox();
      const panel = await hero.boundingBox();
      expect(heading && nav && intro && work && contact && panel).toBeTruthy();
      expect(nameText).toBeTruthy();
      expect(nameText!.x + nameText!.width).toBeLessThanOrEqual(heading!.x + heading!.width + 1);
      expect(Math.abs(heading!.x - nav!.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(heading!.width - nav!.width)).toBeLessThanOrEqual(1);
      expect(Math.abs(intro!.x - heading!.x)).toBeLessThanOrEqual(1);
      if (width >= 768) expect(contact!.y).toBeGreaterThanOrEqual(work!.y + work!.height);
      expect(panel!.y + panel!.height).toBeGreaterThanOrEqual(900);

    });
  }

  test('mobile menu keeps an accessible name and the hero puts the illustration before the intro', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('[data-nav-menu] summary')).toHaveAccessibleName('Menu');
    const portrait = await page.locator('[data-portrait]').boundingBox();
    const intro = await page.locator('.hero-intro').boundingBox();
    expect(portrait!.y + portrait!.height).toBeLessThanOrEqual(intro!.y);
  });

  test('navigation becomes frosted after scrolling', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('.site-header');
    await expect(header).not.toHaveAttribute('data-scrolled');
    await page.evaluate(() => window.scrollTo(0, 300));
    await expect(header).toHaveAttribute('data-scrolled', '');
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(header).not.toHaveAttribute('data-scrolled');
  });

  test('shows the navigation name after the hero name passes without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const name = page.locator('.nav-name');
    await expect(name).toBeHidden();
    await expect(name).toHaveCSS('max-width', '0px');
    await page.evaluate(() => window.scrollTo(0, 500));
    await expect(name).toBeVisible();
    await context.close();
  });

  test('contact action navigates to the contact section', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.locator('[data-hero]').getByRole('link', { name: 'Contact me' }).click();
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.locator('#contact')).toBeInViewport();
  });

  test('remains readable without JavaScript and with reduced motion', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('[data-hero]').getByRole('heading')).toBeVisible();
    await expect(page.locator('[data-portrait-box]')).toBeVisible();
    await context.close();
  });
});

const hero = (page: import('@playwright/test').Page) => page.locator('[data-hero]');
const heroButton = (page: import('@playwright/test').Page, name: string) => hero(page).getByRole('link', { name, exact: true });
const css = (locator: import('@playwright/test').Locator, property: string) => locator.evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), property);
async function box(locator: import('@playwright/test').Locator) {
  const result = await locator.boundingBox();
  if (!result) throw new Error('Element has no box on the page');
  return result;
}test.describe('Button lift', () => {
  test('a hero button rises 2px on hover and settles back while pressed', async ({ page }) => {
    await page.goto('/');

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


