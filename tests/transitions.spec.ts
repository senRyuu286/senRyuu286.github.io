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
    await page.goto('/404.html');
    await page.locator('header a.nav-logo').click();
    await page.waitForURL(/\/$/);
    expect(await usedTransition(page)).toBe('true');
    await context.close();
  });

  test('the Back button runs the crossfade too', async ({ browser }) => {
    const { page, context } = await newPage(browser, 'no-preference');
    await page.goto('/404.html');
    await page.locator('header a.nav-logo').click();
    await page.waitForURL(/\/$/);
    await page.goBack();
    await page.waitForURL('**/404.html');
    expect(await usedTransition(page)).toBe('true');
    await context.close();
  });

  test('with reduced motion there is no crossfade, for links or for Back', async ({ browser }) => {
    const { page, context } = await newPage(browser, 'reduce');
    await page.goto('/404.html');
    await page.locator('header a.nav-logo').click();
    await page.waitForURL(/\/$/);
    expect(await usedTransition(page)).toBe('false');
    await page.goBack();
    await page.waitForURL('**/404.html');
    expect(await usedTransition(page)).toBe('false');
    await expect(page.locator('h1')).toBeVisible();
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

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('links still move between pages (the crossfade is CSS only)', async ({ page }) => {
      await page.goto('/404.html');
      await page.locator('header a.nav-logo').click();
      await expect(page).toHaveURL(/\/$/);
      await expect(page.locator('h1')).toBeVisible();
    });
  });
});
