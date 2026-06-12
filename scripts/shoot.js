/* Full-page visual verification capture for site-reframe.
   Captures umbrella + 6 pillar pages at 1280 + 390, full page.
   Run: node scripts/shoot.js <phase>   (phase = before|after, default after)
   A static server must serve BASE. */
const { chromium } = require('/Users/jarvis/tmp/thislive-fonttest/node_modules/playwright-core');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE || 'http://localhost:8799';
const PHASE = process.argv[2] || 'after';
const OUT = `/Users/jarvis/cortex-completion-2026-06-10/receipts/site-reframe/shots/${PHASE}`;
fs.mkdirSync(OUT, { recursive: true });

const PAGES = [
  ['index.html', 'umbrella'],
  ['cortex/', 'cortex'],
  ['maestro/', 'maestro'],
  ['mnemos/', 'mnemos'],
  ['fabric/', 'fabric'],
  ['surfaces/', 'surfaces'],
  ['forge/', 'forge'],
];
const VIEWPORTS = [[1280, 832, '1280'], [390, 844, '390']];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch({ args: ['--force-color-profile=srgb'] });
  for (const [route, name] of PAGES) {
    for (const [w, h, tag] of VIEWPORTS) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1.5, colorScheme: 'dark' });
      const page = await ctx.newPage();
      await page.goto(`${BASE}/${route}`, { waitUntil: 'networkidle' });
      // settle reveals + scroll-driven animations so full page renders visible
      await page.evaluate(() => {
        document.querySelectorAll('.reveal, .fade-in-up').forEach((el) => el.classList.add('in'));
      });
      await wait(500);
      await page.evaluate(() => window.scrollTo(0, 0));
      await wait(200);
      const file = path.join(OUT, `${name}-${tag}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log('saved', `${name}-${tag}.png`);
      await ctx.close();
    }
  }
  await browser.close();
  console.log('DONE', PHASE);
})().catch((e) => { console.error(e); process.exit(1); });
