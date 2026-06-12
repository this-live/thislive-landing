/* Visual-verification capture for the signature hero.
   Drives the ?herocap=1 debug harness in hero.js to deterministically freeze
   ambient / each formed mind-map / a dissolve frame, plus the reduced-motion
   static fallback and the live hero at 4 breakpoints. Writes PNGs to OUT.
   Run: node scripts/capture_hero.js  (a static server must serve BASE) */
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE || 'http://localhost:8788';
const OUT = process.env.OUT || '/Users/jarvis/cortex-completion-2026-06-10/receipts/design/shots';
fs.mkdirSync(OUT, { recursive: true });

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function settleReveals(page) {
  await page.evaluate(() => {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
    window.scrollTo(0, 0);
  });
}
async function waitHarness(page) {
  await page.waitForFunction(() => !!window.__hero, null, { timeout: 8000 });
}

async function shot(page, name) {
  const p = path.join(OUT, name);
  await page.screenshot({ path: p });
  console.log('  saved', name);
}

(async () => {
  const browser = await chromium.launch({ args: ['--force-color-profile=srgb'] });
  const results = [];

  // --- A) live hero at 4 breakpoints (ambient, animation on) ---
  for (const [w, h, tag] of [[390, 844, '390'], [768, 1024, '768'], [1280, 832, '1280'], [1920, 1080, '1920']]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.goto(BASE + '/index.html?herocap=1', { waitUntil: 'networkidle' });
    await waitHarness(page);
    await settleReveals(page);
    await page.evaluate(() => window.__hero.ambient());
    await wait(700);
    await shot(page, `hero-ambient-${tag}.png`);
    await ctx.close();
  }

  // --- B) full morph cycle at 1280 (ambient -> 3 formed maps -> dissolve) ---
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 832 }, deviceScaleFactor: 2, colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.goto(BASE + '/index.html?herocap=1', { waitUntil: 'networkidle' });
    await waitHarness(page);
    await settleReveals(page);

    const ids = await page.evaluate(() => window.__hero.maps());
    console.log('maps:', ids.join(', '));

    for (let i = 0; i < ids.length; i++) {
      await page.evaluate((idx) => { window.scrollTo(0, 0); window.__hero.hold(idx); }, i);
      await wait(400);
      await shot(page, `hero-form-${i + 1}-${ids[i]}.png`);
    }
    // dissolve of the first map (morph-out)
    await page.evaluate(() => { window.scrollTo(0, 0); window.__hero.dissolve(0, 0.5); });
    await wait(400);
    await shot(page, `hero-dissolve-${ids[0]}.png`);
    await ctx.close();
  }

  // --- C) reduced-motion static fallback (must be beautiful, never blank) ---
  for (const [w, h, tag] of [[1280, 832, '1280'], [390, 844, '390']]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, colorScheme: 'dark', reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(BASE + '/index.html', { waitUntil: 'networkidle' });
    await wait(600);
    await shot(page, `hero-reduced-motion-${tag}.png`);
    await ctx.close();
  }

  await browser.close();
  console.log('DONE');
})().catch((e) => { console.error(e); process.exit(1); });
