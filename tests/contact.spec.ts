import { expect, test, type Page } from '@playwright/test';

const SUCCESS = 'Message sent. I’ll reply as soon as I can.';
const FAILURE_START = 'Your message did not send.';

/** Answers every Formspree request with a fixed reply, so tests never use your real submissions. */
async function mockFormspree(page: Page, status: number, body: unknown) {
  const requests: Array<{ accept: string | undefined }> = [];
  await page.route('https://formspree.io/**', async (route) => {
    requests.push({ accept: route.request().headers()['accept'] });
    await route.fulfill({
      status,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify(body),
    });
  });
  return requests;
}

async function fill(page: Page, name: string, email: string, message: string) {
  await page.locator('#contact-name').fill(name);
  await page.locator('#contact-email').fill(email);
  await page.locator('#contact-message').fill(message);
}

/** Where the footer sits on the whole page. If it moves, the layout shifted. */
function footerTop(page: Page): Promise<number> {
  return page.evaluate(() => {
    const footer = document.querySelector('footer');
    return footer ? footer.getBoundingClientRect().top + window.scrollY : -1;
  });
}

const send = (page: Page) => page.getByRole('button', { name: /^send message$/i }).click();

test.describe('Contact form with JavaScript', () => {
  test('a valid message is sent, shows success, resets, and causes no layout shift', async ({ page }) => {
    const requests = await mockFormspree(page, 200, { ok: true });
    await page.goto('/contact/');
    const before = await footerTop(page);

    await fill(page, 'Test Person', 'test@example.com', 'Hello from a test.');
    await send(page);

    await expect(page.getByRole('status')).toHaveText(SUCCESS);
    expect(requests).toHaveLength(1);
    expect(requests[0]?.accept).toContain('application/json');
    await expect(page.locator('#contact-name')).toHaveValue('');
    expect(await footerTop(page)).toBe(before);
  });

  test('a bad email shows an error tied to its field, sends nothing, and causes no layout shift', async ({ page }) => {
    const requests = await mockFormspree(page, 200, { ok: true });
    await page.goto('/contact/');
    const before = await footerTop(page);

    await fill(page, 'Test Person', 'not-an-email', 'Hello from a test.');
    await send(page);

    const email = page.locator('#contact-email');
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(email).toHaveAttribute('aria-describedby', 'contact-email-error');
    await expect(page.locator('#contact-email-error')).toHaveText('Enter a valid email address.');
    await expect(email).toBeFocused();
    expect(requests).toHaveLength(0);
    expect(await footerTop(page)).toBe(before);
  });

  test('empty required fields each show an error and focus goes to the first one', async ({ page }) => {
    await page.goto('/contact/');
    await send(page);

    await expect(page.locator('#contact-name-error')).toHaveText('Enter your name.');
    await expect(page.locator('#contact-email-error')).toHaveText('Enter a valid email address.');
    await expect(page.locator('#contact-message-error')).toHaveText('Write a message.');
    await expect(page.locator('#contact-name')).toBeFocused();
  });

  test('a server failure shows the failure message and keeps what was typed', async ({ page }) => {
    await mockFormspree(page, 500, { error: 'Server error' });
    await page.goto('/contact/');

    await fill(page, 'Test Person', 'test@example.com', 'Hello from a test.');
    await send(page);

    await expect(page.getByRole('status')).toContainText(FAILURE_START);
    await expect(page.locator('#contact-message')).toHaveValue('Hello from a test.');
  });

  test('a field error from Formspree appears on that field', async ({ page }) => {
    await mockFormspree(page, 422, {
      errors: [{ field: 'email', code: 'TYPE_EMAIL', message: 'must be a valid email' }],
    });
    await page.goto('/contact/');

    await fill(page, 'Test Person', 'test@example.com', 'Hello from a test.');
    await send(page);

    await expect(page.locator('#contact-email-error')).toHaveText('Enter a valid email address.');
    await expect(page.getByRole('status')).toHaveText('');
  });

  test('the spam trap exists in the form and is hidden from people', async ({ page }) => {
    await page.goto('/contact/');
    const trap = page.locator('#contact-form input[name="_gotcha"]');
    await expect(trap).toHaveCount(1);
    await expect(trap).toBeHidden();
  });
});

test.describe('Contact form without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('is still a normal form that posts to Formspree with browser validation on', async ({ page }) => {
    await page.goto('/contact/');
    const form = page.locator('#contact-form');
    await expect(form).toHaveAttribute('action', /^https:\/\/formspree\.io\/f\//);
    await expect(form).toHaveAttribute('method', /post/i);
    await expect(form).not.toHaveAttribute('novalidate', '');
    for (const id of ['#contact-name', '#contact-email', '#contact-message']) {
      await expect(page.locator(id)).toHaveAttribute('required', '');
    }
  });
});