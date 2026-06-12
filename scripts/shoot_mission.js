/* Visual verification for slug mission-founder.
   Captures umbrella at 1280 + 390 full page; waits for living-resume strips.
   Run: node scripts/shoot_mission.js   (server must serve BASE) */
const { chromium } = require('/Users/jarvis/tmp/thislive-fonttest/node_modules/playwright-core');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE || 'http://localhost:8799';
const OUT = '/Users/jarvis/cortex-completion-2026-06-10/receipts/site-mission/shots';
fs.mkdirSync(OUT, { recursive: true });
const VIEWPORTS = [[1280, 832, '1280'], [390, 844, '390']];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch({ args: ['--force-color-profile=srgb'] });
  const errors = [];
  for (const [w, h, tag] of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1.5, colorScheme: 'dark' });
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error') errors.push(`[${tag}] ${m.text()}`); });
    page.on('pageerror', (e) => errors.push(`[${tag}] pageerror: ${e.message}`));
    await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.querySelectorAll('.reveal, .fade-in-up').forEach((el) => el.classList.add('in')));
    // wait for living-resume strips to populate from JSON
    await page.waitForFunction(() => {
      const t = document.querySelector('[data-living-track="building"]');
      const c = document.querySelector('[data-living-chips="active"]');
      return t && t.children.length > 0 && c && c.children.length > 0;
    }, { timeout: 5000 }).catch(() => errors.push(`[${tag}] living strips did not populate`));
    await wait(400);
    await page.evaluate(() => window.scrollTo(0, 0));
    await wait(200);
    await page.screenshot({ path: path.join(OUT, `umbrella-${tag}.png`), fullPage: true });
    console.log('saved', `umbrella-${tag}.png`);

    // tight crop of #about for review
    const about = await page.$('#about');
    if (about) await about.screenshot({ path: path.join(OUT, `about-${tag}.png`) });
    const hero = await page.$('.hero');
    if (hero && tag === '1280') await hero.screenshot({ path: path.join(OUT, `hero-${tag}.png`) });
    await ctx.close();
  }
  await browser.close();
  console.log('CONSOLE_ERRORS', JSON.stringify(errors, null, 2));
  console.log('DONE');
})().catch((e) => { console.error(e); process.exit(1); });
