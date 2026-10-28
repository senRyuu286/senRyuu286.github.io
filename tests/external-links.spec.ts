import { expect, test, type Page } from '@playwright/test';

// Add every new page here as it is built.
const pages = ['/', '/work/', '/work/capstone/', '/about/', '/contact/', '/404.html'];

/** Returns the address of every external link missing target="_blank" or rel="noopener noreferrer". */
async function findBadExternalLinks(page: Page): Promise<string[]> {
  return page.$$eval('a[href]', (elements) =>
    (elements as HTMLAnchorElement[])
      .filter((link) => {
        const url = new URL(link.href);
        const isWeb = url.protocol === 'http:' || url.protocol === 'https:';
        if (!isWeb || url.origin === window.location.origin) return false;
        const rel = (link.getAttribute('rel') ?? '').split(/\s+/);
        return link.target !== '_blank' || !rel.includes('noopener') || !rel.includes('noreferrer');
      })
      .map((link) => link.href),
  );
}

for (const path of pages) {
  test(`external links on ${path} open safely in a new tab`, async ({ page }) => {
    await page.goto(path);
    expect(await findBadExternalLinks(page)).toEqual([]);
  });
}

// Proves the checker works even while no real external links exist yet.
test('the checker catches an unsafe external link and accepts a safe one', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    document.body.insertAdjacentHTML(
      'beforeend',
      '<a id="bad" href="https://example.com/a">bad</a>' +
        '<a id="good" href="https://example.com/b" target="_blank" rel="noopener noreferrer">good</a>',
    );
  });
  expect(await findBadExternalLinks(page)).toEqual(['https://example.com/a']);
});