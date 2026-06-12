/* Final QA capture for ship-qa.
   Screenshots umbrella + 6 pillars + blog + resume at 390/768/1280/1920 full page.
   Captures console errors + CLS per (page,viewport).
   Run: node scripts/qa_shoot.js
   A static server must serve BASE. */
const { chromium } = require('/Users/jarvis/tmp/thislive-fonttest/node_modules/playwright-core');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE || 'http://localhost:8799';
const OUT = process.env.OUT || '/Users/jarvis/cortex-completion-2026-06-10/receipts/site-reframe/shots/ship-qa';
fs.mkdirSync(OUT, { recursive: true });

const PAGES = [
  ['index.html', 'umbrella'],
  ['cortex/', 'cortex'],
  ['maestro/', 'maestro'],
  ['mnemos/', 'mnemos'],
  ['fabric/', 'fabric'],
  ['surfaces/', 'surfaces'],
  ['forge/', 'forge'],
  ['blog/', 'blog'],
  ['resume.html', 'resume'],
];
const VIEWPORTS = [[390, 844, '390'], [768, 1024, '768'], [1280, 832, '1280'], [1920, 1080, '1920']];
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
      // install CLS observer before any layout
      await page.addInitScript(() => {
        window.__cls = 0;
        try {
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) window.__cls += entry.value;
            }
          }).observe({ type: 'layout-shift', buffered: true });
        } catch (e) {}
      });
      await page.goto(`${BASE}/${route}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => {
        document.querySelectorAll('.reveal, .fade-in-up').forEach((el) => el.classList.add('in'));
      });
      await wait(700);
      const cls = await page.evaluate(() => Math.round((window.__cls || 0) * 1000) / 1000);
      await page.evaluate(() => window.scrollTo(0, 0));
      await wait(200);
      const file = path.join(OUT, `${name}-${tag}.png`);
      await page.screenshot({ path: file, fullPage: true });
      report[name][tag] = { cls, errors };
      const flag = errors.length ? ` ERR(${errors.length})` : '';
      const clsFlag = cls > 0.1 ? ` CLS!${cls}` : (cls > 0 ? ` cls=${cls}` : '');
      console.log(`saved ${name}-${tag}.png${clsFlag}${flag}`);
      await ctx.close();
    }
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, '_report.json'), JSON.stringify(report, null, 2));
  console.log('DONE — report at', path.join(OUT, '_report.json'));
})().catch((e) => { console.error(e); process.exit(1); });
