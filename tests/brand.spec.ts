import { expect, test, type Page } from '@playwright/test';

const PAGES = ['/', '/work/', '/about/', '/contact/', '/work/capstone/', '/404.html'];
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/** Reads "rgb(36, 71, 224)" into numbers. */
function rgb(value: string): [number, number, number] {
  const parts = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/.exec(value);
  if (!parts) throw new Error(`Not an rgb color: ${value}`);
  return [Number(parts[1]), Number(parts[2]), Number(parts[3])];
}

/** WCAG contrast ratio between two colors. */
function contrast(a: [number, number, number], b: [number, number, number]): number {
  const lum = ([r, g, bl]: [number, number, number]) => {
    const f = (c: number) => ((c / 255) <= 0.03928 ? c / 255 / 12.92 : (((c / 255) + 0.055) / 1.055) ** 2.4);
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl);
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

async function bytesOf(page: Page, path: string) {
  const response = await page.request.get(path);
  expect(response.ok(), `${path} should exist`).toBe(true);
  return { response, body: await response.body() };
}

test.describe('Brand: favicons and the home-screen icon', () => {
  for (const path of PAGES) {
    test(`${path} links the ICO (32x32), the SVG, and the apple-touch-icon`, async ({ page }) => {
      await page.goto(path);
      const icons = page.locator('link[rel="icon"]');
      await expect(icons).toHaveCount(2);
      // The ICO says it is 32x32 so Chrome prefers the SVG. The SVG comes second.
      await expect(icons.nth(0)).toHaveAttribute('href', '/favicon.ico');
      await expect(icons.nth(0)).toHaveAttribute('sizes', '32x32');
      await expect(icons.nth(1)).toHaveAttribute('href', '/favicon.svg');
      await expect(icons.nth(1)).toHaveAttribute('type', 'image/svg+xml');
      await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/apple-touch-icon.png');
    });
  }

  test('favicon.svg is the J on a cobalt square: small, self-contained, and not the Astro default', async ({ page }) => {
    const { response, body } = await bytesOf(page, '/favicon.svg');
    expect(response.headers()['content-type']).toContain('image/svg+xml');
    const svg = body.toString('utf8');
    expect(svg).toContain('viewBox="0 0 32 32"');
    expect(svg).toContain('fill="#2447E0"');
    expect(svg).toContain('fill="#F6F7F8"');
    expect(svg).not.toContain('M50.4 78.5');
    expect(svg).not.toMatch(/<script|href=|xlink|<image|<style/i);
    expect(body.length).toBeLessThan(2048);
  });

  test('favicon.ico is a real ICO file with 16, 32, and 48 pixel pictures', async ({ page }) => {
    const { response, body } = await bytesOf(page, '/favicon.ico');
    expect(response.headers()['content-type']).toMatch(/^image\//);
    expect(body.readUInt16LE(0)).toBe(0); // reserved
    expect(body.readUInt16LE(2)).toBe(1); // type: icon
    const count = body.readUInt16LE(4);
    expect(count).toBe(3);
    const sizes: number[] = [];
    for (let i = 0; i < count; i += 1) {
      const entry = 6 + i * 16;
      sizes.push(body[entry] || 256);
      const length = body.readUInt32LE(entry + 8);
      const offset = body.readUInt32LE(entry + 12);
      expect([...body.subarray(offset, offset + 8)], `picture ${i} is a PNG`).toEqual(PNG_SIGNATURE);
      expect(offset + length).toBeLessThanOrEqual(body.length);
    }
    expect(sizes).toEqual([16, 32, 48]);
    expect(body.length).toBeLessThan(10 * 1024);
  });

  test('apple-touch-icon.png is a 180 by 180 PNG', async ({ page }) => {
    const { response, body } = await bytesOf(page, '/apple-touch-icon.png');
    expect(response.headers()['content-type']).toContain('image/png');
    expect([...body.subarray(0, 8)]).toEqual(PNG_SIGNATURE);
    expect(body.readUInt32BE(16)).toBe(180);
    expect(body.readUInt32BE(20)).toBe(180);
    expect(body.length).toBeLessThan(20 * 1024);
  });

  test('both icons really draw: a cobalt square with a light letter, and a full-bleed home-screen icon', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(async () => {
      const load = (src: string) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error(`could not load ${src}`));
          img.src = src;
        });
      const read = async (src: string, size: number) => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(await load(src), 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        let cobalt = 0;
        let light = 0;
        const near = (i: number, r: number, g: number, b: number) =>
          Math.hypot(data[i]! - r, data[i + 1]! - g, data[i + 2]! - b) < 40 && data[i + 3]! > 200;
        for (let i = 0; i < data.length; i += 4) {
          if (near(i, 36, 71, 224)) cobalt += 1;
          else if (near(i, 246, 247, 248)) light += 1;
        }
        const total = size * size;
        return { cobalt: cobalt / total, light: light / total, cornerAlpha: data[3]! };
      };
      return { svg: await read('/favicon.svg', 64), apple: await read('/apple-touch-icon.png', 180) };
    });
    // The SVG has rounded corners (transparent corner pixel). The J covers a modest part of the square.
    expect(result.svg.cornerAlpha).toBe(0);
    expect(result.svg.cobalt).toBeGreaterThan(0.5);
    expect(result.svg.light).toBeGreaterThan(0.06);
    expect(result.svg.light).toBeLessThan(0.3);
    // The home-screen icon is full-bleed (iOS rounds it) with a solid corner.
    expect(result.apple.cornerAlpha).toBe(255);
    expect(result.apple.cobalt).toBeGreaterThan(0.5);
    expect(result.apple.light).toBeGreaterThan(0.06);
  });
});

test.describe('Brand: the header logo mark', () => {
  for (const width of [375, 1280]) {
    test(`the mark is a 32px J in an aria-hidden SVG, centered and not clipped, at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/');
      const mark = page.locator('header .nav-logo-mark');
      const box = await mark.boundingBox();
      expect(box?.width).toBe(32);
      expect(box?.height).toBe(32);
      await expect(mark).toHaveAttribute('aria-hidden', 'true');
      await expect(mark.locator('svg')).toHaveCount(1);
      await expect(mark.locator('svg path')).toHaveCount(1);
      // The old placeholder (a small outlined square) is gone.
      await expect(mark.locator('.border-accent-ink')).toHaveCount(0);

      const bbox = await mark.locator('svg path').evaluate((p) => {
        const b = (p as SVGGraphicsElement).getBBox();
        return { x: b.x, y: b.y, w: b.width, h: b.height };
      });
      expect(bbox.x).toBeGreaterThanOrEqual(4);
      expect(bbox.y).toBeGreaterThanOrEqual(4);
      expect(bbox.x + bbox.w).toBeLessThanOrEqual(28);
      expect(bbox.y + bbox.h).toBeLessThanOrEqual(28);
      expect(Math.abs(bbox.x + bbox.w / 2 - 16)).toBeLessThanOrEqual(0.5);
      expect(Math.abs(bbox.y + bbox.h / 2 - 16)).toBeLessThanOrEqual(0.5);
    });
  }

  for (const scheme of ['light', 'dark'] as const) {
    test(`the J reads clearly on its square in ${scheme} mode (contrast at least 4.5:1)`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto('/');
      const colors = await page.evaluate(() => {
        const mark = document.querySelector('header .nav-logo-mark')!;
        const path = mark.querySelector('path')!;
        const probe = document.createElement('div');
        probe.style.backgroundColor = 'var(--accent)';
        document.body.append(probe);
        const accent = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return { square: getComputedStyle(mark).backgroundColor, letter: getComputedStyle(path).fill, accent };
      });
      expect(colors.square).toBe(colors.accent);
      expect(contrast(rgb(colors.letter), rgb(colors.square))).toBeGreaterThanOrEqual(4.5);
    });
  }

  test('the header J and the favicon J are the same drawing', async ({ page }) => {
    await page.goto('/');
    const header = await page.locator('header .nav-logo-mark path').getAttribute('d');
    const svg = (await (await page.request.get('/favicon.svg')).text());
    const favicon = /<path[^>]* d="([^"]+)"/.exec(svg)?.[1];
    expect(header).toBeTruthy();
    expect(header).toBe(favicon);
  });
});