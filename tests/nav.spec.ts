import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const pages = ['/', '/404.html'];
const schemes = ['light', 'dark'] as const;

const DESKTOP = { width: 1024, height: 768 };
const PHONE = { width: 375, height: 667 };
const SMALLEST_PHONE = { width: 320, height: 568 };

const banner = (page: Page) => page.getByRole('banner');
const menuButton = (page: Page) => page.locator('[data-nav-menu] summary');
const panel = (page: Page) => page.locator('[data-nav-panel]');
const panelLink = (page: Page, name: string) => panel(page).getByRole('link', { name, exact: true });

function underlineTransform(page: Page, label: string): Promise<string> {
  return banner(page)
    .getByRole('link', { name: label, exact: true })
    .evaluate((link) => getComputedStyle(link, '::after').transform);
}

test.describe('Navigation on a desktop screen', () => {
  test.use({ viewport: DESKTOP });

  test('highlights the section in view and clears the highlight between sections', async ({ page }) => {
    await page.goto('/');
    const work = banner(page).locator('a.nav-link[href="/#works"]');
    const contact = banner(page).locator('a.nav-link[href="/#contact"]');
    await expect(work).not.toHaveAttribute('aria-current', 'location');
    await page.locator('#works').evaluate((heading) => heading.scrollIntoView({ behavior: 'instant' }));
    await expect(work).toHaveAttribute('aria-current', 'location');
    await expect(contact).not.toHaveAttribute('aria-current', 'location');
    await page.locator('#tech-stack-heading').evaluate((heading) => heading.scrollIntoView({ behavior: 'instant' }));
    await expect(work).not.toHaveAttribute('aria-current', 'location');
    await page.locator('#contact').evaluate((section) => section.scrollIntoView({ behavior: 'instant' }));
    await expect(contact).toHaveAttribute('aria-current', 'location');
  });

  test('shows the links and hides the menu button', async ({ page }) => {
    await page.goto('/');
    for (const label of ['Work', 'Contact']) {
      await expect(banner(page).getByRole('link', { name: label, exact: true })).toBeVisible();
    }
    await expect(menuButton(page)).toBeHidden();
    await expect(panel(page)).toBeHidden();
  });

  test('the logo links home and is named after the site', async ({ page }) => {
    await page.goto('/');
    const logo = banner(page).locator('a.nav-logo');
    await expect(logo).toHaveAttribute('href', '/');
    expect((await logo.textContent())?.trim()).not.toBe('');
    const box = await logo.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(box?.width).toBeGreaterThanOrEqual(44);
  });

  const current: Array<[string, string | null]> = [
    ['/', null],
  ];

  for (const [path, label] of current) {
    test(`${path} marks ${label ?? 'no link'} as the current page`, async ({ page }) => {
      await page.goto(path);
      const marked = await banner(page).locator('a[aria-current="page"]:visible').allTextContents();
      expect(marked.map((text) => text.trim())).toEqual(label ? [label] : []);
    });
  }

  test('the bar stays 12px from the top, before and after scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 400 });
    await page.goto('/');
    const bar = banner(page).locator('> div');
    const before = await bar.boundingBox();
    expect(before?.y).toBeCloseTo(12, 0);

    await page.evaluate(() => window.scrollTo(0, 500));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
    const after = await bar.boundingBox();
    expect(after?.y).toBeCloseTo(12, 0);
  });

  test('scroll-padding-top keeps linked and focused content clear of the bar', async ({ page }) => {
    await page.goto('/');
    const bottom = await banner(page).locator('> div').evaluate((el) => el.getBoundingClientRect().bottom);
    const padding = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop));
    expect(padding).toBeGreaterThanOrEqual(bottom);
  });

  test('the skip link is the first stop and sits above the bar', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await expect
      .poll(() =>
        skip.evaluate((el) => {
          const box = el.getBoundingClientRect();
          return document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2) === el;
        }),
      )
      .toBe(true);
  });

  test('links have 44px tall targets', async ({ page }) => {
    await page.goto('/');
    for (const label of ['Work', 'Contact']) {
      const box = await banner(page).getByRole('link', { name: label, exact: true }).boundingBox();
      expect(box?.height, label).toBeGreaterThanOrEqual(44);
    }
  });

  test('hovering a link grows its underline and changes its color', async ({ page }) => {
    await page.goto('/');
    const link = banner(page).getByRole('link', { name: 'Work', exact: true });
    const before = await link.evaluate((el) => getComputedStyle(el).color);
    expect(await underlineTransform(page, 'Work')).toBe('matrix(0, 0, 0, 1, 0, 0)');
    await link.hover();
    await expect.poll(() => underlineTransform(page, 'Work')).toBe('matrix(1, 0, 0, 1, 0, 0)');
    await expect.poll(() => link.evaluate((el) => getComputedStyle(el).color)).not.toBe(before);
  });

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('the logo does not twist', async ({ page }) => {
      await page.goto('/');
      const mark = banner(page).locator('.nav-logo-mark');
      await banner(page).locator('a.nav-logo').hover();
      await expect.poll(() => mark.evaluate((el) => getComputedStyle(el).transform)).toBe('none');
    });

    test('a hovered link changes color but its underline stays hidden', async ({ page }) => {
      await page.goto('/');
      const link = banner(page).getByRole('link', { name: 'Work', exact: true });
      const before = await link.evaluate((el) => getComputedStyle(el).color);
      await link.hover();
      await expect.poll(() => link.evaluate((el) => getComputedStyle(el).color)).not.toBe(before);
      expect(await underlineTransform(page, 'Work')).toBe('matrix(0, 0, 0, 1, 0, 0)');
    });

  });

  test('without reduced motion the logo twists on hover', async ({ page }) => {
    await page.goto('/');
    const mark = banner(page).locator('.nav-logo-mark');
    await banner(page).locator('a.nav-logo').hover();
    await expect.poll(() => mark.evaluate((el) => getComputedStyle(el).transform)).not.toBe('none');
  });
});

test.describe('Navigation on a phone', () => {
  test.use({ viewport: PHONE });

  test('shows the menu button and keeps the links hidden until it opens', async ({ page }) => {
    await page.goto('/');
    await expect(menuButton(page)).toBeVisible();
    await expect(menuButton(page)).toContainText('Menu');
    await expect(panel(page)).toBeHidden();

    await menuButton(page).click();
    await expect(panel(page)).toBeVisible();
    for (const label of ['Work', 'Contact']) {
      await expect(panelLink(page, label)).toBeVisible();
    }

    await menuButton(page).click();
    await expect(panel(page)).toBeHidden();
  });

  test('the menu opens from the keyboard', async ({ page }) => {
    await page.goto('/');
    await menuButton(page).focus();
    await page.keyboard.press('Enter');
    await expect(panel(page)).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(panelLink(page, 'Work')).toBeFocused();
  });

  test('Escape closes the menu and returns focus to the button', async ({ page }) => {
    await page.goto('/');
    await menuButton(page).click();
    await page.keyboard.press('Tab');
    await expect(panelLink(page, 'Work')).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(panel(page)).toBeHidden();
    await expect(menuButton(page)).toBeFocused();
  });

  test('a click outside the menu closes it', async ({ page }) => {
    await page.goto('/');
    await menuButton(page).click();
    await expect(panel(page)).toBeVisible();
    await page.mouse.click(4, 600);
    await expect(panel(page)).toBeHidden();
  });

  test('choosing a link closes the menu', async ({ page }) => {
    await page.goto('/');
    await menuButton(page).click();
    await expect(panel(page)).toBeVisible();
    await page.evaluate(() => window.addEventListener('click', (event) => event.preventDefault(), true));
    await panelLink(page, 'Contact').click();
    await expect(panel(page)).toBeHidden();
  });

  test('growing past 768px closes the menu, so it is not open when the screen shrinks again', async ({ page }) => {
    await page.goto('/');
    await menuButton(page).click();
    await expect(panel(page)).toBeVisible();
    await page.setViewportSize(DESKTOP);
    await expect(menuButton(page)).toBeHidden();
    await page.setViewportSize(PHONE);
    await expect(menuButton(page)).toBeVisible();
    await expect(panel(page)).toBeHidden();
  });

  test('Work points to selected works in the menu', async ({ page }) => {
    await page.goto('/');
    await menuButton(page).click();
    await expect(panelLink(page, 'Work')).toHaveAttribute('href', '/#works');
    await expect(panelLink(page, 'Contact')).not.toHaveAttribute('aria-current', 'page');
  });

  test('menu rows and the button have 44px tall targets', async ({ page }) => {
    await page.goto('/');
    const button = await menuButton(page).boundingBox();
    expect(button?.height).toBeGreaterThanOrEqual(44);
    await menuButton(page).click();
    for (const label of ['Work', 'Contact']) {
      const box = await panelLink(page, label).boundingBox();
      expect(box?.height, label).toBeGreaterThanOrEqual(44);
    }
  });

  test('the menu button label is visible text, not only an icon', async ({ page }) => {
    await page.goto('/');
    expect((await menuButton(page).innerText()).trim()).toBe('Menu');
  });
});

test.describe('Navigation with JavaScript off', () => {
  test.use({ viewport: PHONE, javaScriptEnabled: false });

  test('the menu still opens and closes', async ({ page }) => {
    await page.goto('/');
    await expect(panel(page)).toBeHidden();
    await menuButton(page).click();
    await expect(page.locator('[data-nav-menu]')).toHaveAttribute('open', '');
    await expect(panel(page)).toBeVisible();
    await expect(panelLink(page, 'Contact')).toBeVisible();
    await menuButton(page).click();
    await expect(panel(page)).toBeHidden();
  });
});

test.describe('Navigation on the smallest phone (320px)', () => {
  test.use({ viewport: SMALLEST_PHONE });

  for (const path of pages) {
    test(`${path} has no sideways scrolling and the bar fits`, async ({ page }) => {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      const bar = await banner(page).locator('> div').boundingBox();
      expect((bar?.x ?? 0) + (bar?.width ?? 0)).toBeLessThanOrEqual(320);
    });
  }
});

test.describe('Profile icons in the bar', () => {
  test('follow the external link rules and are never fake links', async ({ page }) => {
    for (const path of pages) {
      await page.goto(path);
      const links = banner(page).locator('a[href]');
      const bad = await links.evaluateAll((elements) =>
        (elements as HTMLAnchorElement[])
          .filter((link) => {
            const href = link.getAttribute('href') ?? '';
            if (href === '#' || href.includes('[')) return true;
            if (!/^https?:/.test(href)) return false;
            const rel = (link.getAttribute('rel') ?? '').split(/\s+/);
            return link.target !== '_blank' || !rel.includes('noopener') || !rel.includes('noreferrer');
          })
          .map((link) => link.getAttribute('href')),
      );
      expect(bad, path).toEqual([]);
    }
  });

  test('icons that are not real links yet are hidden from assistive tech and cannot be focused', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/');
    const inert = banner(page).locator('[data-nav-inert]');
    for (let index = 0; index < (await inert.count()); index += 1) {
      const icon = inert.nth(index);
      await expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(await icon.evaluate((el) => el.closest('a') === null && el.tabIndex < 0)).toBe(true);
    }
  });
});

for (const scheme of schemes) {
  test.describe(`Navigation accessibility (${scheme} mode)`, () => {
    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
    });

    const serious = async (page: Page) => {
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      return results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    };

    test('desktop bar has no serious or critical issues', async ({ page }) => {
      await page.setViewportSize(DESKTOP);
      await page.goto('/');
      expect(await serious(page)).toEqual([]);
    });

    test('phone with the menu closed has no serious or critical issues', async ({ page }) => {
      await page.setViewportSize(PHONE);
      await page.goto('/');
      expect(await serious(page)).toEqual([]);
    });

    test('phone with the menu open has no serious or critical issues', async ({ page }) => {
      await page.setViewportSize(PHONE);
      await page.goto('/');
      await menuButton(page).click();
      await expect(panel(page)).toBeVisible();
      expect(await serious(page)).toEqual([]);
    });
  });
}
