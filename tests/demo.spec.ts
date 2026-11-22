import { test, expect } from '@playwright/test';

test('mobile flow: manual arrival, level, image, drafts, sources and reset', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByTestId('empty-state')).toBeVisible();
  await expect(page.getByTestId('story-card')).toHaveCount(0);
  await page.getByTestId('location-tosun').click();
  await expect(page.getByTestId('story-level')).toHaveText('Medium');
  await expect(page.getByTestId('location-ic')).toBeVisible();
  await expect(page.getByTestId('location-lake')).toBeVisible();
  for (const chapter of ['person','university','nature','garden']) await expect(page.getByTestId(`chapter-${chapter}`)).toBeVisible();
  await expect(page.getByTestId('figure-garden')).toBeVisible();
  await expect(page.getByTestId('figure-founder')).toHaveCount(0);
  await expect(page.getByTestId('figure-nature')).toHaveCount(0);
  const mediumText = await page.getByTestId('story-text').textContent();
  await page.getByTestId('level-short').click();
  await expect(page.getByTestId('story-level')).toHaveText('Short');
  const shortText = await page.getByTestId('story-text').textContent();
  expect(shortText!.length).toBeLessThan(mediumText!.length);
  await expect(page.getByTestId('figure-garden')).toHaveCount(0);
  await page.getByTestId('level-detailed').click();
  await expect(page.getByTestId('figure-garden')).toBeVisible();
  await expect(page.getByTestId('figure-founder')).toBeVisible();
  await expect(page.getByTestId('figure-nature')).toBeVisible();
  await expect(page.getByTestId('visual-timeline')).toBeVisible();
  expect((await page.getByTestId('story-text').textContent())!.length).toBeGreaterThan(mediumText!.length);
  await page.getByTestId('sources-toggle').click();
  await expect(page.getByTestId('sources').getByRole('link')).toHaveCount(7);
  await page.screenshot({ path: 'docs/demo-mobile.png', fullPage: true });
  for (const location of ['ic', 'lake', 'outside']) {
    await page.getByTestId(`location-${location}`).click();
    await expect(page.getByTestId('story-card')).toHaveCount(0);
    await expect(page.getByTestId('empty-state')).toBeVisible();
    await expect(page.getByTestId('speech-toggle')).toHaveCount(0);
    if (location !== 'outside') await expect(page.getByTestId('empty-state')).toContainText('Story coming soon');
  }
  await page.getByTestId('location-tosun').click();
  await page.getByTestId('log-toggle').click();
  await expect(page.getByTestId('event-log')).toContainText('Location: Tosun');
  await page.getByTestId('reset').click();
  await expect(page.getByTestId('story-card')).toHaveCount(0);
  await page.getByTestId('location-tosun').click();
  await expect(page.getByTestId('story-level')).toHaveText('Medium');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('speech can stop and never continues across a manual level/location change', async ({ page }) => {
  await page.addInitScript(() => {
    const state = { texts: [] as string[], languages: [] as string[], cancelled: 0 };
    Object.assign(window, { testSpeech: state });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: class { text = ''; } });
    Object.defineProperty(window, 'speechSynthesis', { value: {
      getVoices: () => [{ voiceURI: 'test-en', lang: 'en-GB', name: 'Test English', default: true, localService: true }],
      speak: (message: { text: string; lang: string }) => { state.texts.push(message.text); state.languages.push(message.lang); },
      cancel: () => { state.cancelled++; },
    } });
  });
  await page.goto('/');
  await page.getByTestId('location-tosun').click();
  await page.getByTestId('speech-toggle').click();
  await expect(page.getByTestId('speech-toggle')).toContainText('Stop narration');
  await expect.poll(() => page.evaluate(() => (window as any).testSpeech.texts.length)).toBe(1);
  expect(await page.evaluate(() => (window as any).testSpeech.languages[0])).toBe('en-GB');
  await page.getByTestId('level-short').click();
  await expect(page.getByTestId('speech-toggle')).toContainText('Listen to the story');
  await page.getByTestId('speech-toggle').click();
  await expect.poll(() => page.evaluate(() => (window as any).testSpeech.texts.length)).toBe(2);
  await page.getByTestId('location-outside').click();
  await expect(page.getByTestId('speech-toggle')).toHaveCount(0);
  expect(await page.evaluate(() => (window as any).testSpeech.cancelled)).toBeGreaterThanOrEqual(4);
});

test('missing English voice gives a usable message', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'speechSynthesis', { value: {
      getVoices: () => [{ voiceURI: 'test-tr', lang: 'tr-TR', name: 'Turkish', default: true }],
      cancel: () => {},
    } });
  });
  await page.goto('/');
  await page.getByTestId('location-tosun').click();
  await page.getByTestId('speech-toggle').click();
  await expect(page.getByTestId('audio-error')).toContainText('No English voice was found');
  await expect(page.getByTestId('speech-toggle')).toContainText('Listen to the story');
});

test('desktop layout fits and shows the same narrative', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await page.getByTestId('location-tosun').click();
  await page.getByTestId('level-short').click();
  await expect(page.getByTestId('story-text')).toContainText('founding rector');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'docs/demo-desktop.png', fullPage: true });
});
