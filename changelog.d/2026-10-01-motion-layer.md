## 2026-10-01 — Site: motion layer, resume trim, philosophy page removed

- Problem: motion was scattered across site.css and design-system.css with no scroll reveals, no accordion motion and no nav state; the resume still listed old projects; Bryce wants the philosophy essay off the site.
- Change: new `motion.css` + `motion.js` (vanilla, documented in `MOTION.md`, patterns adapted from Motion Primitives, MIT, credited) on every page: staggered hero entrance with a word-by-word text effect, a pointer spotlight on cards, IntersectionObserver scroll reveals (once), press feedback and card lift, interruptible FAQ accordion, sticky nav that deepens on scroll. Tokens only, transform/opacity only (plus FAQ height), reduced motion honored, no transition-all. Resume project list trimmed to current work (this.live, Maestro, Mnemos, Ostium, Beacon) and the operating-model paragraph moved to first person. `philosophy.html` deleted, removed from footer, About page and sitemap; nginx 301s `/philosophy.html` and `/philosophy` to `/`.
- Reason: Bryce's PR #19 feedback.
- Verified: repo checks; local nginx (redirects, 404, all pages 200); link check; Playwright screenshots, hero/scroll frame sequences and video; no console errors; reduced motion on/off; layout-shift measurement.
- Rollback: revert this commit.
