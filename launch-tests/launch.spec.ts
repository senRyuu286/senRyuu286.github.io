import { expect, test, type Page } from '@playwright/test';

const SITE = 'https://senryuu286.github.io';

// Matches unfinished placeholders such as [MY NAME] or [CONFIRM: availability, for example ...].
const PLACEHOLDER = /\[[A-Z][^\]]*\]/g;

/** Reads every <loc> address from a sitemap file. */
async function locs(page: Page, path: string): Promise<string[]> {
  const response = await page.request.get(path);
  expect(response.ok(), `${path} should exist`).toBe(true);
  return [...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1] ?? '');
}

/** Every page in the sitemap, as paths, plus the 404 page. */
async function pagePaths(page: Page): Promise<string[]> {
  const sitemaps = await locs(page, '/sitemap-index.xml');
  const urls = (await Promise.all(sitemaps.map((loc) => locs(page, new URL(loc).pathname)))).flat();
  return [...urls.map((url) => new URL(url).pathname), '/404.html'];
}

/** Text a visitor or a search tool can see: page text, title, meta tags, link addresses, form address, JSON-LD. */
function visibleStrings(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const parts: string[] = [document.title, document.body.innerText];
    document.querySelectorAll('meta[content]').forEach((meta) => parts.push(meta.getAttribute('content') ?? ''));
    document.querySelectorAll('a[href], form[action]').forEach((element) => {
      const value = element.getAttribute('href') ?? element.getAttribute('action') ?? '';
      try {
        parts.push(decodeURIComponent(value));
      } catch {
        parts.push(value);
      }
    });
    document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => parts.push(script.textContent ?? ''));
    return parts;
  });
}

test('no placeholders are left on any page', async ({ page }) => {
  for (const path of await pagePaths(page)) {
    await page.goto(path);
    const found = new Set((await visibleStrings(page)).flatMap((text) => text.match(PLACEHOLDER) ?? []));
    expect([...found], `Placeholders still on ${path}`).toEqual([]);
  }
});

test('every page has its own title and description', async ({ page }) => {
  const titles: string[] = [];
  const descriptions: string[] = [];
  for (const path of await pagePaths(page)) {
    await page.goto(path);
    titles.push(await page.title());
    descriptions.push((await page.locator('meta[name="description"]').getAttribute('content')) ?? '');
  }
  expect(new Set(titles).size, `Duplicate titles: ${titles.join(' | ')}`).toBe(titles.length);
  expect(new Set(descriptions).size, 'Duplicate descriptions').toBe(descriptions.length);
});

test('every indexable page has the right canonical address', async ({ page }) => {
  for (const path of (await pagePaths(page)).filter((p) => p !== '/404.html')) {
    await page.goto(path);
    await expect(page.locator('link[rel="canonical"]'), path).toHaveAttribute('href', `${SITE}${path}`);
  }
});

test('GoatCounter is set up with a real site code', async ({ page }) => {
  await page.goto('/');
  const script = page.locator('script[data-goatcounter]');
  await expect(script).toHaveCount(1);
  await expect(script).toHaveAttribute('data-goatcounter', /^https:\/\/[a-z0-9-]+\.goatcounter\.com\/count$/);
  await expect(script).toHaveAttribute('src', 'https://gc.zgo.at/count.js');
});

test('Home has Person structured data with a name', async ({ page }) => {
  await page.goto('/');
  const text = await page.locator('script[type="application/ld+json"]').textContent();
  const data: unknown = JSON.parse(text ?? '{}');
  expect(data).toMatchObject({ '@type': 'Person', name: expect.any(String) });
});

test('the link-preview image is set and loads', async ({ page }) => {
  await page.goto('/');
  const content = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(content, 'Set ogImage in src/lib/site.ts and add the file to public/').not.toBeNull();
  const response = await page.request.get(new URL(content ?? '', SITE).pathname);
  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toMatch(/^image\//);
});

test('robots.txt points to the sitemap', async ({ page }) => {
  const response = await page.request.get('/robots.txt');
  expect(response.ok()).toBe(true);
  expect(await response.text()).toContain(`Sitemap: ${SITE}/sitemap-index.xml`);
});