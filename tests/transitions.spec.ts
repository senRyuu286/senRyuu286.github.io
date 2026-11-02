import { expect, test, type Browser, type Page } from '@playwright/test';

/**
 * Cross-page transitions are a Chromium and Safari feature. These tests run in Chromium.
 * The browser fires "pageswap" on the page being left. If it carries a viewTransition, the crossfade ran.
 */
async function newPage(browser: Browser, reducedMotion: 'no-preference' | 'reduce') {
  const context = await browser.newContext({ reducedMotion });
  const page = await context.newPage();
  await page.addInitScript(() => {
    window.addEventListener('pageswap', (event) => {
      sessionStorage.setItem('last-swap-used-transition', String(Boolean((event as PageSwapEvent).viewTransition)));
    });
  });
  return { page, context };
}

const usedTransition = (page: Page) => page.evaluate(() => sessionStorage.getItem('last-swap-used-transition'));

/** Reads one CSS rule from the site's own style sheets, looking inside media queries too. */
function findRule(page: Page, selector: string) {
  return page.evaluate((wanted) => {
    const walk = (rules: CSSRuleList, inside: string[]): { text: string; media: string[]; props: Record<string, string> } | null => {
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSMediaRule) {
          const found = walk(rule.cssRules, [...inside, rule.conditionText]);
          if (found) return found;
        } else if (rule instanceof CSSStyleRule && rule.selectorText.split(',').map((s) => s.trim()).includes(wanted)) {
          const props: Record<string, string> = {};
          for (const name of Array.from(rule.style)) props[name] = rule.style.getPropertyValue(name);
          return { text: rule.cssText, media: inside, props };
        }
      }
      return null;
    };
    for (const sheet of Array.from(document.styleSheets)) {
      const found = walk(sheet.cssRules, []);
      if (found) return found;
    }
    return null;
  }, selector);
}

test.describe('Page transitions', () => {
  test('moving to another page by link runs the crossfade', async ({ browser }) => {
    const { page, context } = await newPage(browser, 'no-preference');
    await page.goto('/about/');
    await page.locator('header nav a:text-is("Work")').first().click();
    await page.waitForURL('**/work/');
    expect(await usedTransition(page)).toBe('true');
    await context.close();
  });

  test('the Back button runs the crossfade too', async ({ browser }) => {
    const { page, context } = await newPage(browser, 'no-preference');
    await page.goto('/about/');
    await page.locator('header nav a:text-is("Work")').first().click();
    await page.waitForURL('**/work/');
    await page.goBack();
    await page.waitForURL('**/about/');
    expect(await usedTransition(page)).toBe('true');
    await context.close();
  });

  test('with reduced motion there is no crossfade, for links or for Back', async ({ browser }) => {
    const { page, context } = await newPage(browser, 'reduce');
    await page.goto('/about/');
    await page.locator('header nav a:text-is("Work")').first().click();
    await page.waitForURL('**/work/');
    expect(await usedTransition(page)).toBe('false');
    await page.goBack();
    await page.waitForURL('**/about/');
    expect(await usedTransition(page)).toBe('false');
    await expect(page.locator('h1')).toHaveText('About');
    await context.close();
  });

  test('the opt-in lives only inside the no-preference media query', async ({ page }) => {
    await page.goto('/');
    const where = await page.evaluate(() => {
      const top: string[] = [];
      const inside: string[] = [];
      for (const sheet of Array.from(document.styleSheets)) {
        for (const rule of Array.from(sheet.cssRules)) {
          if (rule.cssText.startsWith('@view-transition')) top.push(rule.cssText);
          if (rule instanceof CSSMediaRule) {
            for (const inner of Array.from(rule.cssRules)) {
              if (inner.cssText.startsWith('@view-transition')) inside.push(rule.conditionText);
            }
          }
        }
      }
      return { top, inside };
    });
    expect(where.top).toEqual([]);
    expect(where.inside).toHaveLength(1);
    expect(where.inside[0]).toContain('prefers-reduced-motion: no-preference');
  });

  test('the header has its own layer when motion is allowed, and none when it is reduced', async ({ browser }) => {
    for (const [motion, expected] of [['no-preference', 'site-header'], ['reduce', 'none']] as const) {
      const { page, context } = await newPage(browser, motion);
      await page.goto('/');
      expect(await page.locator('header.site-header').evaluate((el) => getComputedStyle(el).getPropertyValue('view-transition-name'))).toBe(expected);
      await context.close();
    }
  });

  test('the page fade is 200ms and uses the project easing token', async ({ page }) => {
    await page.goto('/');
    const rule = await findRule(page, '::view-transition-old(root)');
    expect(rule, 'fade rule exists').not.toBeNull();
    expect(rule?.media.join(' ')).toContain('no-preference');
    expect(rule?.props['animation-duration']).toBe('var(--dur-base)');
    expect(rule?.props['animation-timing-function']).toBe('var(--ease-enter)');
    // The build may write the token as "200ms" or ".2s". Both are the same duration, so compare in milliseconds.
    const token = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--dur-base').trim());
    const ms = token.endsWith('ms') ? parseFloat(token) : parseFloat(token) * 1000;
    expect(ms).toBe(200);
  });

  test('the header is held still: the old header is hidden and the new one does not fade', async ({ page }) => {
    await page.goto('/');
    const oldHeader = await findRule(page, '::view-transition-old(site-header)');
    const newHeader = await findRule(page, '::view-transition-new(site-header)');
    expect(oldHeader?.props['display']).toBe('none');
    expect(newHeader?.props['animation-name']).toBe('none');
  });

  test('after a crossfade the new page is ready to use: nothing blocks it and nothing scrolls sideways', async ({ browser }) => {
    const { page, context } = await newPage(browser, 'no-preference');
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto('/about/');
    await page.locator('header button, header summary').first().click();
    await page.getByRole('link', { name: 'Contact' }).last().click();
    await page.waitForURL('**/contact/');
    await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished)).then(() => true));

    expect(await usedTransition(page)).toBe('true');
    const state = await page.evaluate(() => {
      const h1 = document.querySelector('h1')!.getBoundingClientRect();
      const hit = document.elementFromPoint(h1.left + 5, h1.top + h1.height / 2);
      return {
        sideways: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        hitIsPage: hit !== null && hit !== document.documentElement,
        menuClosed: !document.querySelector('header details')?.hasAttribute('open'),
      };
    });
    expect(state.sideways).toBe(0);
    expect(state.hitIsPage).toBe(true);
    expect(state.menuClosed).toBe(true);
    await context.close();
  });

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('links still move between pages (the crossfade is CSS only)', async ({ page }) => {
      await page.goto('/');
      await page.locator('header nav a:text-is("Work")').first().click();
      await expect(page).toHaveURL(/\/work\/$/);
      await expect(page.locator('h1')).toBeVisible();
    });
  });
});