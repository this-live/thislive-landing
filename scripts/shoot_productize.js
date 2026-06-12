/* Focused capture for the productize task — Cortex page identity correction.
   Screenshots the Cortex pillar page + homepage at 1280 and 390 (full page),
   and captures console errors per (page,viewport).
   Run: node scripts/shoot_productize.js */
const { chromium } = require('/Users/jarvis/tmp/thislive-fonttest/node_modules/playwright-core');
const fs = require('fs');

const BASE = process.env.BASE || 'http://localhost:8799';
const OUT = process.env.OUT || '/Users/jarvis/cortex-completion-2026-06-10/receipts/site-mission/shots/productize';
fs.mkdirSync(OUT, { recursive: true });

const PAGES = [
  ['cortex/', 'cortex'],
  ['index.html', 'home'],
];
const VIEWPORTS = [[1280, 832, '1280'], [390, 844, '390']];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const report = {};

(async () => {
  const browser = await chromium.launch({ args: ['--force-color-profile=srgb'] });
  for (const [route, name] of PAGES) {
    report[name] = {};
    for (const [w, h, tag] of VIEWPORTS) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1.5, colorScheme: 'dark' });
      const page = await ctx.newPage();
      const errors = [];
      page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
      page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
      await page.goto(`${BASE}/${route}`, { waitUntil: 'networkidle' });
      // The .reveal sections fade in via IntersectionObserver on scroll; a
      // full-page screenshot fires before they enter view. Scroll through the
      // page to trigger the observer, then force any stragglers visible so the
      // capture matches what a scrolling visitor actually sees.
      await page.evaluate(async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const total = document.body.scrollHeight;
        for (let y = 0; y < total; y += window.innerHeight) {
          window.scrollTo(0, y); await sleep(120);
        }
        window.scrollTo(0, 0);
        document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
      });
      await wait(900); // let reveal transitions + hero particles settle
      const file = `${OUT}/${name}-${tag}.png`;
      await page.screenshot({ path: file, fullPage: true });
      report[name][tag] = { errors, file };
      console.log(`${name} @ ${tag}: ${errors.length} console errors -> ${file}`);
      await ctx.close();
    }
  }
  fs.writeFileSync(`${OUT}/_report.json`, JSON.stringify(report, null, 2));
  await browser.close();
})();
