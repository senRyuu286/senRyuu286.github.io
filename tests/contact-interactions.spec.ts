import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

const SUCCESS = 'Message sent. I’ll reply as soon as I can.';
const FAILURE = /^Your message did not send\. Check your connection and try again, or email me at .+\.$/;
// 64 characters: the longest address the reserved status height is built for.
const LONG_EMAIL = `${'a'.repeat(38)}@university-example.edu.ph`;

type Mock = { status?: number; body?: unknown; gate?: Promise<void>; abort?: boolean };

/** Answers every Formspree request with a fixed reply. Tests never send a real message. */
async function mockFormspree(page: Page, mock: Mock = {}) {
  const requests: string[] = [];
  await page.route('https://formspree.io/**', async (route) => {
    requests.push(route.request().postData() ?? '');
    if (mock.gate) await mock.gate;
    if (mock.abort) {
      await route.abort('failed');
      return;
    }
    await route.fulfill({
      status: mock.status ?? 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify(mock.body ?? { ok: true }),
    });
  });
  return requests;
}

/** Serves the Contact page with a long email address inside the failure message (the worst case for height). */
async function useLongEmail(page: Page, email = LONG_EMAIL) {
  await page.route('**/contact/', async (route) => {
    const response = await route.fetch();
    const html = (await response.text()).replace(
      /data-failure="[^"]*"/,
      `data-failure="Your message did not send. Check your connection and try again, or email me at ${email}."`,
    );
    await route.fulfill({ response, body: html });
  });
}

async function fill(page: Page, name = 'Test Person', email = 'test@example.com', message = 'Hello from a test.') {
  await page.locator('#contact-name').fill(name);
  await page.locator('#contact-email').fill(email);
  await page.locator('#contact-message').fill(message);
}

const send = (page: Page) => page.getByRole('button', { name: /^send message$/i }).click();
const status = (page: Page) => page.locator('[data-contact-status]');

/** Waits for fonts and for every running animation to finish, so measurements are steady. */
async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready.then(() => true));
  await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished)).then(() => true));
}

type Win = Window & { __anims: string[]; __texts: string[] };

/** Records every CSS animation that starts, as "name:who". Lets tests count shakes and pops without racing the clock. */
async function recordAnimations(page: Page) {
  await page.evaluate(() => {
    const log: string[] = [];
    (window as unknown as Win).__anims = log;
    document.addEventListener(
      'animationstart',
      (event) => {
        const target = event.target as HTMLElement;
        const who = target.id || (target.hasAttribute('data-contact-status') ? 'status' : target.tagName.toLowerCase());
        log.push(`${event.animationName}:${who}`);
      },
      true,
    );
  });
}

const started = (page: Page, name: string) =>
  page.evaluate((n) => (window as unknown as Win).__anims.filter((a) => a.startsWith(`${n}:`)).sort(), name);

/** Where things sit on the whole page. If any of this moves, the layout shifted. */
function positions(page: Page) {
  return page.evaluate(() => {
    const top = (selector: string) => {
      const el = document.querySelector(selector);
      return el ? Math.round((el.getBoundingClientRect().top + window.scrollY) * 100) / 100 : -1;
    };
    return {
      heading: top('#profiles-heading'),
      footer: top('footer'),
      sideways: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
}

/** The keyframes of a named animation as written in the site's CSS: which properties, and how many steps. */
function keyframesOf(page: Page, name: string) {
  return page.evaluate((n) => {
    for (const sheet of Array.from(document.styleSheets)) {
      for (const rule of Array.from(sheet.cssRules)) {
        if (rule instanceof CSSKeyframesRule && rule.name === n) {
          const steps = Array.from(rule.cssRules) as CSSKeyframeRule[];
          return {
            steps: steps.length,
            properties: [...new Set(steps.flatMap((s) => Array.from(s.style)))].sort(),
            texts: steps.map((s) => s.style.cssText),
          };
        }
      }
    }
    return null;
  }, name);
}

/** The color a token resolves to, so a test can compare against it without hard-coding hex values. */
function tokenColor(page: Page, token: string, property: 'color' | 'backgroundColor') {
  return page.evaluate(
    ([t, p]) => {
      const probe = document.createElement('div');
      probe.style.setProperty(p === 'color' ? 'color' : 'background-color', `var(${t})`);
      document.body.append(probe);
      const value = getComputedStyle(probe)[p as 'color'];
      probe.remove();
      return value;
    },
    [token, property] as const,
  );
}

const css = (locator: Locator, property: string) =>
  locator.evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), property);

test.describe('Contact interactions: the shake', () => {
  test('each invalid field shakes once when Send is pressed', async ({ page }) => {
    await page.goto('/contact/');
    await recordAnimations(page);
    await send(page);

    await expect
      .poll(() => started(page, 'field-shake'))
      .toEqual(['field-shake:contact-email', 'field-shake:contact-message', 'field-shake:contact-name']);
    await expect(page.locator('#contact-name')).toBeFocused();
  });

  test('only a Send attempt shakes: not leaving a field, not typing', async ({ page }) => {
    await page.goto('/contact/');
    await recordAnimations(page);

    // Tab through the empty fields without sending: nothing shakes and nothing is marked invalid.
    await page.locator('#contact-name').focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);
    expect(await started(page, 'field-shake')).toEqual([]);
    await expect(page.locator('[aria-invalid="true"]')).toHaveCount(0);

    // Send once, then fix the name by typing: the error clears and there is no second shake.
    await send(page);
    await expect.poll(() => started(page, 'field-shake')).toHaveLength(3);
    await page.locator('#contact-name').pressSequentially('Ana');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);
    expect(await started(page, 'field-shake')).toHaveLength(3);
    await expect(page.locator('#contact-name-error')).toHaveText('');
  });

  test('pressing Send again replays the shake, even while it is still running', async ({ page }) => {
    await page.goto('/contact/');
    await recordAnimations(page);
    await send(page);
    await send(page);

    await expect.poll(() => started(page, 'field-shake')).toHaveLength(6);
  });

  test('the shake is short, small, and moves only by transform', async ({ page }) => {
    await page.goto('/contact/');
    await send(page);
    await settle(page);

    const name = page.locator('#contact-name');
    expect(await css(name, 'animation-name')).toBe('field-shake');
    expect(await css(name, 'animation-duration')).toBe('0.2s');
    expect(await css(name, 'animation-iteration-count')).toBe('1');

    const frames = await keyframesOf(page, 'field-shake');
    expect(frames?.properties).toEqual(['transform']);
    expect(frames?.steps).toBeLessThanOrEqual(4);
    const distances = (frames?.texts ?? []).map((t) => Math.abs(Number(/translateX\(([-\d.]+)px\)/.exec(t)?.[1] ?? 0)));
    expect(Math.max(...distances)).toBeLessThanOrEqual(4);
  });

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('there is no shake, but the border, the error text, and the focus still show', async ({ page }) => {
      await page.goto('/contact/');
      await recordAnimations(page);
      await send(page);

      await expect(page.locator('#contact-name')).toBeFocused();
      await expect(page.locator('#contact-name')).toHaveAttribute('aria-invalid', 'true');
      await expect(page.locator('#contact-name-error')).toHaveText('Enter your name.');
      await expect(page.locator('#contact-email-error')).toHaveText('Enter a valid email address.');
      await expect(page.locator('#contact-message-error')).toHaveText('Write a message.');
      await page.waitForTimeout(400);
      expect(await started(page, 'field-shake')).toEqual([]);
      expect(await css(page.locator('#contact-name'), 'animation-name')).toBe('none');
    });
  });
});

test.describe('Contact interactions: sending', () => {
  test('shows the label, keeps its width, stays still, and ignores a second submit', async ({ page }) => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    const requests = await mockFormspree(page, { gate });
    await page.goto('/contact/');
    await fill(page);

    const button = page.locator('[data-contact-submit]');
    const idle = await button.boundingBox();

    // Idle: a mouse lifts the button 2px (the Phase 6 button feel).
    await button.hover();
    await expect.poll(() => css(button, 'transform')).toBe('matrix(1, 0, 0, 1, 0, -2)');

    await button.click();
    await expect(button).toHaveText('Sending…');
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    expect((await button.boundingBox())?.width).toBe(idle?.width);

    // Busy: the mouse is still on it, but it does not lift, keeps its resting color, and shows a busy cursor.
    await expect.poll(() => css(button, 'transform')).toBe('none');
    await expect.poll(() => css(button, 'background-color')).toBe(await tokenColor(page, '--accent', 'backgroundColor'));
    expect(await css(button, 'cursor')).toBe('progress');

    // A second click and the Enter key both do nothing.
    await button.click({ force: true });
    await page.locator('#contact-email').press('Enter');
    await page.waitForTimeout(250);
    expect(requests).toHaveLength(1);

    release();
    await expect(status(page)).toHaveText(SUCCESS);
    await expect(button).toHaveText('Send message');
    await expect(button).not.toHaveAttribute('aria-disabled', /.*/);
    expect(requests).toHaveLength(1);
  });

  test('a slow server keeps the sending state until the reply arrives', async ({ page }) => {
    await mockFormspree(page, { gate: new Promise<void>((resolve) => setTimeout(resolve, 1500)) });
    await page.goto('/contact/');
    await fill(page);
    await send(page);

    await page.waitForTimeout(900);
    await expect(page.locator('[data-contact-submit]')).toHaveText('Sending…');
    await expect(status(page)).toHaveText('');
    await expect(status(page)).toHaveText(SUCCESS, { timeout: 4000 });
    await expect(page.locator('[data-contact-submit]')).toHaveText('Send message');
  });

  test('the Send button taps without a delay or a grey flash', async ({ page }) => {
    await page.goto('/contact/');
    const button = page.locator('[data-contact-submit]');
    expect(await css(button, 'touch-action')).toBe('manipulation');
    expect(await css(button, '-webkit-tap-highlight-color')).toBe('rgba(0, 0, 0, 0)');
  });
});

test.describe('Contact interactions: success', () => {
  test('shows the exact text once, with a check mark and one pop, and resets the form', async ({ page }) => {
    await mockFormspree(page);
    await page.goto('/contact/');
    await recordAnimations(page);
    // Counts how many times the message text is written. A screen reader announces each write.
    await page.evaluate(() => {
      const box = document.querySelector('[data-contact-status]')!;
      const texts: string[] = [];
      // The observer reports a batch of changes at once, so count each written piece of text, not each batch.
      new MutationObserver((records) => {
        for (const record of records) {
          const pieces = record.type === 'characterData' ? [record.target] : Array.from(record.addedNodes);
          for (const piece of pieces) {
            const text = (piece.textContent ?? '').trim();
            if (text !== '') texts.push(text);
          }
        }
      }).observe(box, { subtree: true, childList: true, characterData: true });
      (window as unknown as Win).__texts = texts;
    });

    await fill(page);
    await send(page);
    await expect(status(page)).toHaveText(SUCCESS);
    await settle(page);

    expect(await page.evaluate(() => (window as unknown as Win).__texts.filter((t) => t !== ''))).toEqual([SUCCESS]);
    expect(await started(page, 'status-pop')).toEqual(['status-pop:status']);

    const icon = page.locator('[data-status-icon]');
    await expect(icon).toBeVisible();
    await expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(await css(icon, 'color')).toBe(await tokenColor(page, '--accent', 'color'));
    await expect(status(page)).not.toHaveClass(/text-error/);

    for (const id of ['#contact-name', '#contact-email', '#contact-message']) {
      await expect(page.locator(id)).toHaveValue('');
    }
    // Focus stays on the button that was pressed, so a keyboard user keeps their place.
    await expect(page.locator('[data-contact-submit]')).toBeFocused();
  });

  test('the pop is 200ms, uses opacity and transform only, and starts from a small scale, not zero', async ({ page }) => {
    await mockFormspree(page);
    await page.goto('/contact/');
    await fill(page);
    await send(page);
    await expect(status(page)).toHaveText(SUCCESS);
    await settle(page);

    expect(await css(status(page), 'animation-name')).toBe('status-pop');
    expect(await css(status(page), 'animation-duration')).toBe('0.2s');
    const frames = await keyframesOf(page, 'status-pop');
    expect(frames?.properties).toEqual(['opacity', 'transform']);
    const scale = Number(/scale\(([\d.]+)\)/.exec(frames?.texts.join(' ') ?? '')?.[1]);
    expect(scale).toBeGreaterThanOrEqual(0.95);
    expect(scale).toBeLessThan(1);
  });

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('the message and check mark appear at once, with no pop', async ({ page }) => {
      await mockFormspree(page);
      await page.goto('/contact/');
      await recordAnimations(page);
      await fill(page);
      await send(page);

      await expect(status(page)).toHaveText(SUCCESS);
      await expect(page.locator('[data-status-icon]')).toBeVisible();
      await page.waitForTimeout(400);
      expect(await started(page, 'status-pop')).toEqual([]);
      expect(await css(status(page), 'animation-name')).toBe('none');
    });
  });
});

test.describe('Contact interactions: failure', () => {
  const cases: Array<{ label: string; mock: Mock }> = [
    { label: 'a 500 reply', mock: { status: 500, body: { error: 'Server error' } } },
    { label: 'a 429 reply', mock: { status: 429, body: { error: 'Too many requests' } } },
    { label: 'no connection', mock: { abort: true } },
  ];

  for (const { label, mock } of cases) {
    test(`${label} shows the failure text once, keeps what was typed, and offers another try`, async ({ page }) => {
      await mockFormspree(page, mock);
      await page.goto('/contact/');
      await recordAnimations(page);
      await fill(page, 'Test Person', 'test@example.com', 'Keep this message.');
      await send(page);

      await expect(status(page)).toHaveText(FAILURE);
      const shown = (await status(page).innerText()).trim();
      expect(shown).toBe(await page.locator('#contact-form').getAttribute('data-failure'));
      await expect(status(page)).toHaveClass(/text-error/);
      await expect(page.locator('[data-status-icon]')).toBeHidden();
      await settle(page);
      expect(await started(page, 'status-pop')).toEqual(['status-pop:status']);

      await expect(page.locator('#contact-name')).toHaveValue('Test Person');
      await expect(page.locator('#contact-email')).toHaveValue('test@example.com');
      await expect(page.locator('#contact-message')).toHaveValue('Keep this message.');
      await expect(page.locator('[aria-invalid="true"]')).toHaveCount(0);
      await expect(page.locator('[data-contact-submit]')).toHaveText('Send message');
      await expect(page.locator('[data-contact-submit]')).not.toHaveAttribute('aria-disabled', /.*/);
    });
  }

  test('a 422 for all three fields marks and shakes each one and focuses the first', async ({ page }) => {
    await mockFormspree(page, {
      status: 422,
      body: {
        errors: [
          { field: 'name', code: 'REQUIRED_FIELD' },
          { field: 'email', code: 'TYPE_EMAIL' },
          { field: 'message', code: 'REQUIRED_FIELD' },
        ],
      },
    });
    await page.goto('/contact/');
    await recordAnimations(page);
    await fill(page);
    await send(page);

    await expect(page.locator('#contact-name-error')).toHaveText('Enter your name.');
    await expect(page.locator('#contact-email-error')).toHaveText('Enter a valid email address.');
    await expect(page.locator('#contact-message-error')).toHaveText('Write a message.');
    await expect(page.locator('#contact-name')).toBeFocused();
    await expect.poll(() => started(page, 'field-shake')).toHaveLength(3);
    await expect(status(page)).toHaveText('');
  });

  test('a 422 that names no known field falls back to the failure text', async ({ page }) => {
    await mockFormspree(page, { status: 422, body: { errors: [{ field: 'subject', code: 'X' }] } });
    await page.goto('/contact/');
    await fill(page);
    await send(page);

    await expect(status(page)).toHaveText(FAILURE);
  });
});

test.describe('Contact interactions: odd input', () => {
  test('a long name, a 5000 character message, emoji, and non-Latin text are sent whole and nothing moves', async ({
    page,
  }) => {
    const requests = await mockFormspree(page);
    await page.goto('/contact/');
    await settle(page);
    const before = await positions(page);

    const name = 'Ana María Ñandú '.repeat(20).trim();
    const message = 'Kumusta po! 你好 مرحبا 😀 '.repeat(200).slice(0, 5000);
    await fill(page, name, 'ana@example.com', message);
    await send(page);
    await expect(status(page)).toHaveText(SUCCESS);
    await settle(page);

    expect(requests).toHaveLength(1);
    expect(requests[0]).toContain(name);
    expect(requests[0]).toContain(message);
    expect(await positions(page)).toEqual(before);
  });
});

test.describe('Contact interactions: layout stability', () => {
  const widths = [320, 360, 375, 390, 414, 768, 1280];

  for (const width of widths) {
    test(`a failure with a 64 character address does not move the page at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await mockFormspree(page, { status: 500, body: {} });
      await useLongEmail(page);
      await page.goto('/contact/');
      await settle(page);
      const before = await positions(page);

      await fill(page);
      await send(page);
      await expect(status(page)).toContainText(LONG_EMAIL);
      await settle(page);

      expect(await positions(page)).toEqual(before);
      expect(before.sideways).toBe(0);
    });
  }

  for (const width of [320, 1280]) {
    test(`success and invalid states do not move the page at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await mockFormspree(page);
      await page.goto('/contact/');
      await settle(page);
      const before = await positions(page);

      await send(page);
      await expect(page.locator('#contact-name-error')).toHaveText('Enter your name.');
      await settle(page);
      expect(await positions(page)).toEqual(before);

      await fill(page);
      await send(page);
      await expect(status(page)).toHaveText(SUCCESS);
      await settle(page);
      expect(await positions(page)).toEqual(before);
    });
  }

  test('focus goes to the first invalid field, stays below the sticky bar, and shows its ring', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 700 });
    await page.goto('/contact/');
    // Scroll so the Name field sits under the sticky bar while the Send button is still on screen.
    await page.evaluate(() => {
      const top = document.querySelector('#contact-name')!.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top - 10);
    });
    await send(page);
    await settle(page);

    const name = page.locator('#contact-name');
    await expect(name).toBeFocused();
    const fieldTop = (await name.boundingBox())!.y;
    const barBottom = (await page.locator('header').first().boundingBox())!.y + (await page.locator('header').first().boundingBox())!.height;
    expect(fieldTop).toBeGreaterThanOrEqual(barBottom);
    expect(await css(name, 'outline-style')).toBe('solid');
    expect(await css(name, 'outline-width')).toBe('2px');
  });
});

test.describe('Contact form without JavaScript (Milestone 6 parts)', () => {
  test.use({ javaScriptEnabled: false });

  test('keeps a quiet status area, shows no check mark, and uses keyboard hints', async ({ page }) => {
    await page.goto('/contact/');
    await expect(page.locator('[data-status-icon]')).toBeHidden();
    await expect(status(page)).toHaveText('');
    await expect(page.locator('#contact-form')).not.toHaveAttribute('novalidate', /.*/);
    await expect(page.locator('#contact-name')).toHaveAttribute('enterkeyhint', 'next');
    await expect(page.locator('#contact-email')).toHaveAttribute('enterkeyhint', 'next');
    await expect(page.locator('#contact-email')).toHaveAttribute('type', 'email');
    await expect(page.locator('#contact-name')).toHaveAttribute('autocomplete', 'name');
    await expect(page.locator('#contact-email')).toHaveAttribute('autocomplete', 'email');
  });
});

test.describe('Contact interactions: accessibility', () => {
  const schemes = ['light', 'dark'] as const;
  const motions = ['no-preference', 'reduce'] as const;
  const states = ['invalid', 'success', 'failure'] as const;

  for (const scheme of schemes) {
    for (const motion of motions) {
      for (const state of states) {
        test(`${state} state has no serious or critical issues (${scheme}, motion ${motion})`, async ({ page }) => {
          await page.emulateMedia({ colorScheme: scheme, reducedMotion: motion });
          await mockFormspree(page, state === 'failure' ? { status: 500, body: {} } : {});
          await page.goto('/contact/');
          if (state === 'invalid') {
            await send(page);
            await expect(page.locator('#contact-name-error')).toHaveText('Enter your name.');
          } else {
            await fill(page);
            await send(page);
            await expect(status(page)).toHaveText(state === 'success' ? SUCCESS : FAILURE);
          }
          await settle(page);

          const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();
          const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
          expect(serious).toEqual([]);
        });
      }
    }
  }
});