import { expect, test } from '@playwright/test';

test('the CESAFI photo carousel starts at the cover and navigates', async ({ page }) => {
  await page.goto('/');
  const entry = page.locator('[data-experience]').filter({ hasText: 'CESAFI Computer Quiz Bowl 2026' });
  await entry.locator('summary').click();
  const dialog = entry.getByRole('dialog');
  const photos = dialog.locator('[data-experience-photo]');
  await expect(photos.nth(0)).toBeVisible();
  await expect(photos.nth(1)).toBeHidden();
  await expect(dialog.locator('[data-photo-position]')).toHaveText('1 / 4');
  await dialog.getByRole('button', { name: 'Next photo' }).click();
  await expect(photos.nth(0)).toBeHidden();
  await expect(photos.nth(1)).toBeVisible();
  await expect(dialog.locator('[data-photo-position]')).toHaveText('2 / 4');
  await dialog.getByRole('button', { name: 'Previous photo' }).click();
  await expect(photos.nth(0)).toBeVisible();
});

test('opens the experience as an accessible dialog and restores focus', async ({ page }) => {
  await page.goto('/');
  const entry = page.locator('[data-experience]').first();
  const trigger = entry.locator('summary');
  const dialog = entry.getByRole('dialog');
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('h3')).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'What I Learned' })).toHaveCount(0);
  await expect(dialog.getByRole('button', { name: 'Close experience' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('clicking outside closes the dialog while clicking inside keeps it open', async ({ page }) => {
  await page.goto('/');
  const entry = page.locator('[data-experience]').first();
  const trigger = entry.locator('summary');
  await trigger.click();
  const dialog = entry.getByRole('dialog');
  const bounds = await dialog.boundingBox();
  if (!bounds) throw new Error('Dialog has no bounding box');
  await page.mouse.click(bounds.x + 5, bounds.y + 5);
  await expect(dialog).toBeVisible();
  await page.mouse.click(1, 1);
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('keeps the close button available while the modal content scrolls', async ({ page }) => {
  await page.goto('/');
  const entry = page.locator('[data-experience]').filter({ hasText: 'CESAFI Computer Quiz Bowl 2026' });
  await entry.locator('summary').click();
  const dialog = entry.getByRole('dialog');
  const scroller = dialog.locator('[data-experience-dialog-content]');
  await scroller.evaluate((element) => { element.scrollTop = element.scrollHeight; });
  expect(await scroller.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await expect(dialog.getByRole('button', { name: 'Close experience' })).toBeInViewport();
  await dialog.getByRole('button', { name: 'Close experience' }).click();
  await entry.locator('summary').click();
  await expect.poll(() => scroller.evaluate((element) => element.scrollTop)).toBe(0);
});

for (const width of [320, 1440]) {
  test(`experience cards are static without JavaScript at ${width}px`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } });
    const page = await context.newPage();
    await page.goto('/');
    const entry = page.locator('[data-experience]').first();
    await expect(entry.locator('[data-experience-static]')).toBeVisible();
    const achievement = await entry.locator('[data-experience-static] .experience-achievement').boundingBox();
    const event = await entry.locator('[data-experience-static] .experience-event').boundingBox();
    const date = await entry.locator('[data-experience-static] .experience-date').boundingBox();
    expect(achievement && event && date).toBeTruthy();
    expect(event!.y).toBeGreaterThanOrEqual(achievement!.y + achievement!.height);
    expect(date!.y).toBeGreaterThanOrEqual(event!.y + event!.height);
    await expect(entry.locator('[data-experience-details]')).toBeHidden();
    await expect(entry.locator('[data-experience-static] :is(a, button, summary, [tabindex])')).toHaveCount(0);
    await entry.locator('[data-experience-static]').click();
    await expect(entry.locator('[data-experience-details]')).toBeHidden();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    await context.close();
  });
}
