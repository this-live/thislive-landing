# Changelog

Project: This.Live
Purpose: Parent business/project umbrella covering company operations, GTM, pitch, and brand surfaces.

This file is the canonical record of meaningful project-level changes for this Claude Project surface.

Current known canonical workspace(s):
- /Users/admin/Desktop/This.Live
- /Users/fred/.openclaw/workspace/thislive-landing
- Claude Project folder as planning/handoff surface

Update rules:
- Log meaningful architecture, infra, routing, memory, deployment, auth/config, interface, and operator-workflow changes.
- Do not log trivial edits or every commit.
- Agents and AI tools working in this project must update this file as part of finishing meaningful work.

## 2026-06-11 — Signature hero animation: data-driven neural-constellation mind-maps (design/award-winning-v1, slug hero-build)
- Date: 2026-06-11
- Change: Replaced the umbrella hero's inline 64-point particle field with a hand-rolled Canvas-2D engine (`hero.js`, 7.5KB gzipped) that renders a living neural-network constellation in deep space which periodically self-organizes into truthful mind-maps of real projects, holds with labels, dissolves, and reforms as the next project. Ambient = drifting "neuron" nodes with z-depth (size/opacity), distance-faded edges (spatial-hash grid keeps it O(n), not O(n²)), soft additive glow, and depth-scaled mouse+scroll parallax (desktop only). The morph is data-driven from `assets/mindmaps.json` (editable, not hard-coded): particles spring/lerp to node targets, edges grow with an eased `formAmt`, labels fade in using the design-system mono token. Cycle: ambient 4.2s → form 1.3s (expo-out) → hold 3.4s → dissolve 1.2s (ease-in-out) → next. Three truthful maps: (1) Cortex 6-pillar topology with real dependency edges (Surfaces→Fabric→Maestro→Mnemos, Forge↔Maestro flywheel, Cortex governs all — dashed); (2) the fleet Tailscale mesh (Atlas/Fred/Jarvis/Sparky/NAS, with bob dimmed/offline); (3) the route→label→harvest→train→eval→serve→cheaper flywheel loop. Colors/type come live from design-system tokens (`--accent` + pillar hues). On wide layouts the map renders in the open right column beside the copy (whole map legible); on narrow/mobile it centres. Added a `.hero-scrim` (radial+linear vignette anchored to the text column) so copy stays AAA-legible over the busiest morph frame, and swapped the hero to load `/hero.js` (deferred, external — CSP `script-src 'self'`).
- Result (verified via playwright-core chromium dpr2 dark + CDP Performance metrics): 60fps — ~0.4ms JS/frame, main thread only 30.5% busy at the worst case (1920px, 150 particles, full edge pass), ScriptDuration 23.7ms/sec, LayoutDuration 1.67ms/sec (no reflow → zero layout shift). Pauses off-screen (IntersectionObserver threshold 0.02 on `.hero-bg`) and when the tab is hidden (canvas signature frozen on synthetic `visibilitychange→hidden`, animates while visible). `prefers-reduced-motion` paints one beautiful static composed Cortex constellation once with no rAF (not blank). Reduced particle floor + parallax disabled on mobile (`w<640`). 0 page console errors/warnings. Engine 7.5KB gzipped (<10KB bar). A debug-only `?herocap=1` hook (no-op in production) lets the capture script freeze each phase deterministically.
- Verification + receipts: `/Users/jarvis/cortex-completion-2026-06-10/receipts/design/signature-hero.md` + `shots/hero-ambient-{390,768,1280,1920}.png`, `shots/hero-form-{1-cortex,2-fleet,3-flywheel}.png`, `shots/hero-dissolve-cortex.png`, `shots/hero-reduced-motion-{1280,390}.png`. Capture harness: `scripts/capture_hero.js`.
- Files/systems touched: NEW `hero.js`, `assets/mindmaps.json`, `scripts/capture_hero.js`; `index.html` (hero hunks only — inline particle field removed, `.hero-scrim` + `/hero.js` added); `home.css` (`.hero-scrim`). Staged explicit paths only — a concurrent font-self-hosting pass touching `_headers`/`design-system.css`/all 7 `<head>`s/`fonts/` was left untouched for its owner (no `git add -A`). No deploy.
- Migration/operator action: Build-and-review only — main untouched, NOT deployed. Work is on branch `design/award-winning-v1`; Bryce merges to release.
- Author/agent: hero-build (design/award-winning-v1)

## 2026-06-11 — Award-winning QA polish pass on all 7 pages (design/award-winning-v1, slug design-polish)
- Date: 2026-06-11
- Change: Final award-winning QA pass over `index.html` + the six pillar pages. Screenshotted every page at 390 / 768 / 1280 / 1920 (28 shots), critiqued against the bar, and fixed every real issue found. Four shared, surgical fixes (CSS + structure — they correct all 7 pages at once): (1) **Nav CTA contrast bug** — `.nav-links a` (`--text-muted`) was beating `.btn-primary` on specificity, so the "Explore Cortex" / per-pillar CTA pill rendered muted-white-on-cyan at ~1.2:1 (effectively illegible); scoped the rule to `.nav-links a:not(.btn)` so the CTA keeps its dark `--on-accent` ink (now 12.3:1). (2) **AA contrast on dim labels** — `--text-subtle` 0.30→0.50 alpha, lifting the footer column labels, copyright, footer note, and trust-strip label from 2.49:1 (AA-fail) to 5:1. (3) **Landmark + region a11y** — wrapped each page's primary content in a single `<main id="main">` (was absent), resolving `landmark-one-main` and the 25–44 `region` warnings per page. (4) **Heading order** — the footer column labels and the flywheel step labels were `<h4>` following a section `<h2>` (a 2→4 skip); converted to non-heading `.footer-h` / `.fw-h` elements (styled identically) so the outline only ever steps by one. Plus a CLS fix: added metric-compatible `@font-face` fallbacks (`Inter-fallback`, `SpaceGrotesk-fallback` via `local('AvenirNext-Regular'), local('ArialMT')` + ascent/descent/size-adjust overrides) wired into the font stacks to kill font-swap reflow in the hero.
- Result (audited via Playwright chromium dpr2 dark + axe-core 4.x): **axe = 0 violations on all 7 pages** (was 4 classes each: a transient color-contrast artifact that disappears once reveals settle, heading-order, landmark-one-main, region). **0 console errors/warnings** at every breakpoint. Contrast: all body/heading/label/badge/accent text now ≥5:1 on `--bg` (headings 18:1, accent links 6.6–12.6:1, badges 5–12:1). Single h1/page; 0 images missing alt; keyboard focus order logical with a visible cyan focus ring on every interactive element; mobile nav toggle drives `aria-expanded` true/false and closes on link select; under `prefers-reduced-motion` reveals stay visible and the particle canvas never animates. CLS: 0 once webfonts load; cold-first-paint CLS dropped from ~0.22 (maestro/surfaces) to ~0.004 on 6 of 7 pillars and clean on all 7 at 390px — one residual remains (cortex desktop ≥768px cold-first-paint ~0.10, a single-line headline wrap difference no Arial/Avenir fallback can fully match; warm/repeat = 0, mobile = 0). No copy changed; the truthful-claims audit re-confirms every numeric/capability claim maps to `receipts/phase7/claims-ledger.md` (Forge "no adapter trained/served", Maestro auto-labeling "In Progress", Mnemos "75k+ / 7/7", managed tier "Planned"; the only forbidden-phrase grep hit is Maestro's disclaimer negating the killed pricing/managed claims).
- Verification + receipts: `/Users/jarvis/cortex-completion-2026-06-10/receipts/design/00-DESIGN-ROLLUP.md` (per-page before/after, critiques applied, claims audit, ready-to-merge checklist) + `shots/qa/{page}-{390,768,1280,1920}.png` (28 after-shots) alongside the prior `shots/{page}-{1280,390,arch}.png` before-shots.
- Files/systems touched: design-system.css (font fallbacks, `--text-subtle`, nav `:not(.btn)`, footer-label selector), home.css (`.fw-h` selector), and all 7 HTML files (`<main>` wrapper + footer-label tag swap). No deploy.
- Migration/operator action: Build-and-review only — main untouched, NOT deployed. Work is on branch `design/award-winning-v1`; Bryce merges to release.
- Author/agent: design-polish (design/award-winning-v1)

## 2026-06-11 — Award-winning rebuild of Fabric / Surfaces / Forge pillar pages (design/award-winning-v1, slug pages-b)
- Date: 2026-06-11
- Change: Rebuilt the remaining three pillar pages — `/fabric/`, `/surfaces/`, `/forge/` — to the award-winning bar set by `index.html` and the pages-a siblings, moving them off the forked legacy `pillar-legacy.css` onto the canonical `design-system.css` + `pillar.css` page layer. Each now follows the family spine: particle-field hero (hue-tinted per pillar) → "the problem it kills" → honest "how it works" steps → real capabilities → a bespoke architecture SVG → a "what's real today vs staged" truth ledger with an honesty note → CTA → shared footer. Hues match the umbrella pillar grid: Fabric `h-violet`, Surfaces `h-blue`, Forge `h-amber`. Bespoke diagrams (re-tinted via `color-mix(... var(--hue))` and the shared `.dg-*` language): Fabric = dispatch path (Task → Fabric :3333 → three isolated git-worktree agent lanes, a Maestro route tap, receipts back to the bus); Surfaces = surface stack (Pocket Agent / Personal Life OS / Fleet Terminal → shared :19000 backend → 6-tab desktop app with a promoted Voice tab, plus an Android Capacitor sideload branch); Forge = factory flywheel (Harvest → Curate → Train·Modal → a load-bearing Eval gate → Serve/Route, base-serve "live today" solid vs adapter route dashed/staged, with a cost-down return arc). Fabric adds a dispatch terminal demo; Surfaces uses the 3-section pattern (no terminal).
- Truth posture (per receipts/phase7/claims-ledger.md): Fabric claims the proven ":3333 execution service" + "dynamic-workflow engine proven end-to-end 29/29 with real git-worktree isolation" + "ExecutionReceipt v1 / 8-state lifecycle" + "live Maestro routing wired into dispatch (decision_id + cost)", and badges "the engine as the daily production driver" In Progress (proven e2e, NOT yet the default production driver — spec review-pending, routing default-off, migration 011 not applied live). Surfaces claims the built "6-tab desktop app (154/154 unit, 17/17 smoke)" + "one shared :19000 backend (150/150 tests, 7 modules)" + "live voice daemon / Fleet Terminal / PLO Android sideload", framed as desktop/local with app-store distribution badged Planned (sideload today, no store listings, awaits signed artifacts + Apple cert). Forge is framed exactly as "the factory is built; first adapters in training" — explicitly NO "trained adapters available": Live = factory built end-to-end (8 lanes, Modal proven CPU e2e $0, autonomous harvest) + base model served on own GPU (SGLang 262k base-only, eval 0.4727); trained/served adapters badged In Progress with the verbatim "no adapter is trained, none is served, all registry status: planned, Maestro can't route to what doesn't exist." No phantom claims, no fake testimonials/metrics, no invented GitHub URLs (the three non-OSS pillars use internal anchors + "See the full suite", matching the Mnemos/Cortex pattern).
- Verification: static `python3 -m http.server`; `playwright-core` (chromium, dpr 2, dark) full-page screenshots at 1280 and 390 for all three + element-crops of each architecture visual; audit confirms 0 console errors/warnings, single h1/page, labeled nav toggle with aria-expanded, 0 images missing alt, all internal links resolve to files on disk, and under `prefers-reduced-motion` the reveals stay visible and the particle canvas never animates. Receipts + screenshots: `/Users/jarvis/cortex-completion-2026-06-10/receipts/design/pages-b.md` (+ `shots/{fabric,surfaces,forge}-{1280,390,arch}.png`).
- Files/systems touched: fabric/index.html, surfaces/index.html, forge/index.html (rebuilt on the canonical system); CHANGELOG.md. No change to index.html (umbrella pillar grid already links all three with correct hues — minimal touch). `pillar-legacy.css` is now unreferenced by any page (all six pillars on `pillar.css`); left in place to avoid scope creep, flagged for separate cleanup.
- Migration/operator action: Build-and-review only — main untouched, NOT deployed. Work is on branch `design/award-winning-v1`; Bryce merges to release.

## 2026-06-11 — Award-winning rebuild of Cortex / Maestro / Mnemos pillar pages (design/award-winning-v1, slug pages-a)
- Date: 2026-06-11
- Change: Rebuilt `/cortex/`, `/maestro/`, and `/mnemos/` to the award-winning bar set by the flagship `index.html`, fully on the shared `design-system.css` (the canonical token + component kit) instead of the legacy `pillar.css`. Each page now follows the same spine as the umbrella: particle-field hero (hue-tinted per pillar) → "the problem it kills" → honest "how it works" steps → real capabilities → a bespoke architecture/integration SVG → a "what's real today vs staged" truth ledger with an honesty note → CTA → shared footer. `pillar.css` was rewritten from a legacy self-contained sheet into a thin hue-driven page layer on top of `design-system.css` (hero, kill cards, step cards, capability cards, an `.arch-visual` frame + a shared `.dg-*` SVG node-diagram language, ledger, quickstart). Bespoke diagrams: Maestro = routing path (Prompt → Vega → Local/Quorum/Frontier with a redaction gate → durable decision_id); Mnemos = memory plane (harnesses → MCP/REST bus → `cortex/*` hierarchy with write-protected root → SQLite + Qdrant on the NAS); Cortex = hub-and-spoke topology (Cortex canon/gates core → six pillars + shared Contracts, with an animated contract pulse).
- Truth posture (per receipts/phase7/claims-ledger.md): Maestro claims "live routing proven" + "~63k historical labels (caveated, not growing)" and badges auto-labeling "In Progress — no useful training signal yet (consensus pool empty)"; no pricing/managed-tier/"Enterprise AI Orchestration"/"54+ models" copy (killed claims confirmed absent). Mnemos claims "75k+ memories in production (dated snapshot)" + "7/7 acceptance gates PASS" and badges BGE "In Progress — production reindex pending"; hyphen-slug drift stated as a Known limit. Cortex claims "6-pillar topology ratified (ADR-0014→0016)" + "shared contracts imported never redefined" and badges the managed/dashboard tier "Planned — parked until governance clears."
- Compatibility: rewriting `pillar.css` would have broken the still-legacy pages, so the original sheet was forked verbatim to `pillar-legacy.css` (new) and `/fabric/`, `/surfaces/`, `/forge/` were repointed to it with a one-line `<link>` change each — no visual or content change to those three (forge re-rendered to confirm unchanged). Those three remain owned by other phases.
- Verification: static `python3 -m http.server`; Playwright (chromium, dpr 2, dark) full-page screenshots at 1280 and 390 for all three + element-crops of each architecture visual; audit confirms 0 console errors/warnings, single h1/page, labeled nav toggle with aria-expanded, 0 images missing alt, all internal links resolve, and under `prefers-reduced-motion` the reveals stay visible and the particle canvas never animates. Receipts + screenshots: `/Users/jarvis/cortex-completion-2026-06-10/receipts/design/pages-a.md` (+ `shots/{cortex,maestro,mnemos}-{1280,390,arch}.png`).
- Files/systems touched: cortex/index.html, maestro/index.html, mnemos/index.html (rebuilt); pillar.css (rewritten as canonical thin layer); pillar-legacy.css (new); fabric/index.html, surfaces/index.html, forge/index.html (one-line stylesheet repoint only); CHANGELOG.md.
- Migration/operator action: Build-and-review only — main untouched, NOT deployed. Work is on branch `design/award-winning-v1`; Bryce merges to release. Deploy remains repo-driven (Railway + Cloudflare); `git push origin main` would trigger the build, which this change deliberately does not do.
- Author/agent: pages-a (design/award-winning-v1)

## 2026-04-15 — Changelog policy initialized
- Date: 2026-04-15
- Change: Initialized canonical CHANGELOG.md for this Claude Project and adopted the mandatory project-level changelog standard.
- Why it matters: Gives this Claude Project a durable project-local record that future agents can use without reconstructing state from chat history.
- Files/systems touched: CHANGELOG.md
- Migration/operator action: Append one entry for each meaningful project-level change before considering work complete.
- Author/agent: Hermes (Sparky)

## 2026-04-15 — Project mapping recorded
- Date: 2026-04-15
- Change: Recorded the current known canonical workspace mapping for this Claude Project so the project folder can serve as a reliable handoff/control surface.
- Why it matters: The Claude Project name now points at known repo/workspace truth instead of relying on implicit memory.
- Files/systems touched: CHANGELOG.md
- Migration/operator action: Update the workspace list whenever a canonical repo/workspace changes or a new primary surface is introduced.
- Author/agent: Hermes (Sparky)

## 2026-05-16 - Landing page redesign: new mission, Cortex stack, problem section
- Date: 2026-05-16
- Change: Redesigned this.live landing page with new mission statement, Cortex stack cards (Cortex, Mnemos, Agent Fabric, Maestro), 6-card problem grid, updated products section.
- Files/systems touched: index.html, style.css
- Author/agent: Hermes (NAS)

## 2026-06-11 - Six evidence-gated pillar product pages + grid wiring (Phase 7, SITE-WS3)
- Date: 2026-06-11
- Change: Added six pillar product pages on the existing static no-build stack — `/cortex/`, `/maestro/`, `/mnemos/`, `/fabric/`, `/surfaces/` (Pocket Agent / Personal Life OS / Fleet Terminal sub-sections), `/forge/` — each its own `index.html` under a new shared `pillar.css` using the this.live brand tokens (navy #0A0F2E / cyan #00D4FF, dark-only, no emojis). Every page carries a "Live / Active Build / Specced" status section where each claim maps to a receipt path; copy follows plans/08-sites.md claims tables and receipts/phase7/claims-ledger.md. Truth posture enforced: Mnemos claims "~92k-95k memories, 7/7 gates" (allowed); Maestro claims "live routing proven" (allowed) but auto-labeling is framed "in progress, no useful signal yet" (consensus pool empty); Forge explicitly states "no trained adapter, none served" (factory-not-adapters framing, R3/R4 blocked); Surfaces states "Android sideload today, desktop in active build, no store listings". Updated the homepage stack + products grids so each pillar card links to its page and the card hero == page hero (kills click-through dissonance); Maestro card now links to /maestro/ instead of the console domain. Added `a.card { text-decoration:none }` guard to style.css for anchored cards.
- Why it matters: Six pillars had one card each and no pages; the umbrella story now resolves to evidence-gated pillar pages instead of dead links or an off-canon enterprise-SaaS page. No phantom maturity: every public claim is gated to a receipt and staged work is labeled as such.
- Files/systems touched: pillar.css (new); cortex/index.html, maestro/index.html, mnemos/index.html, fabric/index.html, surfaces/index.html, forge/index.html (new); index.html (grid wiring); style.css (anchored-card guard); CHANGELOG.md
- Migration/operator action: Deploy is repo-driven via Railway + Cloudflare (no Vercel). Operator deploy: `git push origin main` triggers the Railway build (Dockerfile → nginx:alpine, healthcheck `/`); Cloudflare fronts this.live. nginx `try_files $uri $uri/ /index.html` serves the new `/<pillar>/index.html` directories. NOT auto-deployed by this change — commit is pushed; operator promotes.
- Author/agent: sites (Phase 7, SITE-WS3)

## 2026-06-08 - Cortex Suite cards corrected to component grid
- Date: 2026-06-08
- Change: Reframed the top `#stack` section so Cortex is the umbrella suite, not a peer component card.
- Change: The Cortex Suite component card grid now contains exactly five cards: Mnemos, Agent Fabric, Maestro, Forge, and Surfaces.
- Change: Surfaces card explicitly names Personal Life OS, Pocket Agent, Fleet Terminal, and the Even Realities interface.
- Change: Updated `scripts/check_stack_cards.py` to fail if Cortex appears as a peer card, if the component grid is not exactly five cards, or if any required suite component/copy is missing.
- Why it matters: Cortex Suite means Mnemos + Agent Fabric + Maestro + Surfaces + Forge; the page should not imply Cortex is a sixth sibling product.
- Files/systems touched: index.html, scripts/check_stack_cards.py, CHANGELOG.md.
- Verification: `python3 scripts/check_stack_cards.py`; full site checks.
- Author/agent: Jarvis/Hermes

## 2026-06-08 - Cortex stack cards expanded to six first-class pillars
- Date: 2026-06-08
- Change: Updated the top `#stack` Cortex card grid from four cards to six: Cortex, Mnemos, Agent Fabric, Maestro, Forge, and Surfaces.
- Change: Removed stale/overclaiming stack copy and replaced it with pillar-specific descriptions for runtime, memory, orchestration, routing/consensus, source-grounded engineering, and Pocket Agent / Personal Life OS / Fleet Terminal surfaces.
- Change: Added `scripts/check_stack_cards.py` to require all six Cortex pillars in the stack section and guard against prior stale copy.
- Why it matters: Forge and Surfaces were only fixed in product cards; the actual Cortex suite card grid still omitted them.
- Files/systems touched: index.html, scripts/check_stack_cards.py, CHANGELOG.md.
- Verification: `python3 scripts/check_stack_cards.py`; `python3 scripts/check_product_cards.py`; `python3 scripts/check_blog_archive_cleanup.py`; `python3 scripts/check_blog_surface.py`; `python3 scripts/check_resume_surface.py`; `python3 scripts/check_founder_proficiencies.py`; HTMLParser over index/resume/blog.
- Author/agent: Jarvis/Hermes

## 2026-06-08 - Cortex Suite card names Forge and Surfaces pillars
- Date: 2026-06-08
- Change: Updated the Cortex Suite product card to explicitly name the six Cortex pillars: Hermes runtime, Mnemos memory, Agent Fabric orchestration, Maestro routing, Forge adapter factory, and Surfaces for Pocket Agent, Personal Life OS, and Fleet Terminal.
- Why it matters: Forge and Surfaces were present as separate cards but under-specified inside the Cortex Suite card, which made the suite map incomplete.
- Files/systems touched: index.html, scripts/check_product_cards.py, CHANGELOG.md.
- Verification: `python3 scripts/check_product_cards.py`; `python3 scripts/check_blog_surface.py`; `python3 scripts/check_resume_surface.py`; `python3 scripts/check_founder_proficiencies.py`; HTMLParser over index/resume/blog.
- Author/agent: Jarvis/Hermes

## 2026-06-08 - Prior professional experience restored to resume
- Date: 2026-06-08
- Change: Restored the actual professional-experience material recovered from the stale `bryce.this.live` artifact into canonical `/resume.html`.
- Details: Added Network Solutions Architect role, 02/2022-2025 Chicago, HLD network architecture for 60+ Fortune 1000 clients and State/Local governments, >50% close rate on complex enterprise deals across Fortune 1000 and 10+ government agencies, enterprise cost modeling, RFP/RFQ, Microsoft mainframe-as-a-service public cloud product, custom CPQ/platform standardization, Pre-Sales/Network Intern role, data center scripting, Blockchain CMDB presentation, CCNA/Azure Fundamentals, SCSU education, NexGenT, athletics, and global perspective.
- Why it matters: The previous canonical resume had flattened Bryce's actual work history into generic founder/tooling copy.
- Files/systems touched: resume.html, scripts/check_resume_surface.py, CHANGELOG.md.
- Verification: `python3 scripts/check_resume_surface.py`; `python3 scripts/check_founder_proficiencies.py`; `python3 scripts/check_product_cards.py`; `python3 scripts/check_blog_surface.py`; HTMLParser over index/resume/blog.
- Author/agent: Jarvis/Hermes

## 2026-06-08 - Founder background and principles restored
- Date: 2026-06-08
- Change: Expanded `/resume.html` from a thin tool/project inventory into a fuller living resume with Bryce's swim coach background, nationally ranked swimming background, network solution architect experience, Singapore/US and travel perspective, active project portfolio, AI/tooling stack, infrastructure stack, and operating principles.
- Change: Added a short personal About the Founder section to the landing page covering swim coaching, hard work, treating people right, truth/accountability, teaching, experiences, practice, composure, and competitive standards.
- Why it matters: Restores the human/resume context that had been flattened during earlier production shoring and keeps This.Live from reading like only a technical tool inventory.
- Files/systems touched: index.html, resume.html, style.css, scripts/check_founder_proficiencies.py, scripts/check_resume_surface.py, CHANGELOG.md.
- Verification: `python3 scripts/check_resume_surface.py`; `python3 scripts/check_founder_proficiencies.py`; `python3 scripts/check_product_cards.py`; `python3 scripts/check_blog_surface.py`; HTMLParser over index/resume/blog; local HTTP probes for `/` and `/resume.html`.
- Author/agent: Jarvis/Hermes

## 2026-06-08 - FTAG public copy corrected away from MiniMax-backed framing
- Date: 2026-06-08
- Change: Updated the FTAG product card to frame FTAG as Future Throwback Arcade Games, not as a MiniMax-backed game studio.
- Why it matters: FTAG is the public studio/brand concept; MiniMax is an execution workspace detail and should not be the public descriptor for FTAG.
- Files/systems touched: index.html, scripts/check_product_cards.py, CHANGELOG.md.
- Verification: `python3 scripts/check_product_cards.py`; `python3 scripts/check_resume_surface.py`; `python3 scripts/check_blog_surface.py`; `python3 scripts/check_founder_proficiencies.py`; HTMLParser over index/resume/blog.
- Author/agent: Jarvis/Hermes

## 2026-06-08 - Forge and Surfaces cards added
- Date: 2026-06-08
- Change: Added explicit Forge and Surfaces cards to the Products section and added Forge/Surfaces details to the canonical founder resume page.
- Why it matters: Corrects the public suite map so Forge and the Surfaces pillar are not hidden under Cortex Suite. Surfaces now names Pocket Agent for live voice sessions into punched-up intent and Agent Fabric parallelization, Personal Life OS for dynamic calendar/todo, and Fleet Terminal for the Even Realities interface.
- Files/systems touched: index.html, resume.html, scripts/check_product_cards.py, scripts/check_resume_surface.py, CHANGELOG.md.
- Verification: `python3 scripts/check_product_cards.py`; `python3 scripts/check_resume_surface.py`; `python3 scripts/check_blog_surface.py`; `python3 scripts/check_founder_proficiencies.py`; HTMLParser over index/resume/blog.
- Note: global hook's project changelog target `/Users/jarvis/Documents/Claude/Projects/This.Live/CHANGELOG.md` is protected by macOS permissions from this process; repo-local changelog and project receipt were updated instead.
- Author/agent: Jarvis/Hermes

## 2026-06-08 - Canonical founder resume page added to deploy repo
- Date: 2026-06-08
- Change: Added `/resume.html` as the canonical in-repo founder/resume surface and repointed landing About/Footer links from stale `bryce.this.live` to `/resume.html`.
- Why it matters: Gives This.Live a deployable, up-to-date resume page covering active projects, MiniMax Code /team migrations, FTAG, AI coding harnesses, models, training/inference, and deployment stack without depending on the separate old `bryce.this.live` Railway artifact.
- Files/systems touched: resume.html, index.html, blog.css, scripts/check_resume_surface.py, CHANGELOG.md.
- Verification: `python3 scripts/check_resume_surface.py`; blog/product/founder checks; HTMLParser pass over landing/legal/blog/resume files; local HTTP probes for `/resume.html` and `/` returned 200 with expected resume/tooling/project sentinels.
- Author/agent: Jarvis/Hermes

## 2026-06-08 - Blog surface merged into canonical deploy repo
- Date: 2026-06-08
- Change: Copied the blog HTML surface into the canonical Railway deploy repo, added `/blog/` and 38 post pages, created `blog.css`, added a Blog section/link on the landing page, and normalized blog index links to `/blog/*.html`.
- Why it matters: Fixes the source-side cause of live `/blog/*` routes serving the homepage fallback once Railway deploys the current repo. Excluded the broken generated draft `2026-04-22-project-scoping.html` from the deploy copy.
- Files/systems touched: index.html, style.css, blog.css, blog/*.html, scripts/check_blog_surface.py, CHANGELOG.md.
- Verification: `python3 scripts/check_blog_surface.py`; product/founder checks; HTMLParser pass over landing/legal/blog files; local HTTP probes for `/`, `/blog/`, `/blog/2026-06-01-supermemory.html`, `/blog/2026-06-08-building-with-ai.html`, and `/blog.css` all returned 200 with expected titles/sentinels.
- Author/agent: Jarvis/Hermes

## 2026-06-04 - FTAG Studio added and MiniMax team-backed project language reflected
- Date: 2026-06-04
- Change: Added FTAG Studio / Future Throwback Arcade Games to the Products section and updated Fieldhouse copy to reflect MiniMax team-backed project execution.
- Why it matters: Captures the MiniMax Code /team migration layer Bryce added around existing projects, while separating FTAG as the new non-sports arcade-game studio from Fieldhouse's sports-game studio.
- Files/systems touched: index.html, scripts/check_product_cards.py, CHANGELOG.md.
- Verification: `python3 scripts/check_product_cards.py`; `python3 scripts/check_founder_proficiencies.py`; HTMLParser pass over index.html, terms.html, privacy.html; local HTTP render check confirmed 8 product cards and FTAG/Ages and Arrows copy.
- Author/agent: Jarvis/Hermes

## 2026-06-04 - Product cards corrected for live/build/R&D status
- Date: 2026-06-04
- Change: Reworked the Products section from a stale four-card snapshot into a seven-card suite map: Cortex Suite, Beacon, Maestro, Signal & Noise, Digital Products Lab, Fieldhouse Games, and DRAAN.
- Why it matters: Removes unsupported or confusing public claims (`Shipped`, DPL `Open Source`, DRAAN perfect-retrieval wording) and replaces them with evidence-aligned statuses such as `Public Beta`, `Live Surface`, `Production Pipeline`, `Active Build`, `In Build`, and `R&D Track`.
- Files/systems touched: index.html, scripts/check_product_cards.py, CHANGELOG.md.
- Verification: `python3 scripts/check_product_cards.py`; `python3 scripts/check_founder_proficiencies.py`; HTMLParser pass over index.html, terms.html, privacy.html; local HTTP render check confirmed 7 product cards and all required status phrases.
- Author/agent: Jarvis/Hermes

## 2026-06-04 - Founder AI/operator stack added to About section
- Date: 2026-06-04
- Change: Added an About-the-Founder proficiency block covering AI model expertise, agentic coding harnesses, model routing/training, deployment infrastructure, and product systems.
- Why it matters: Makes Bryce's current operator resume visible on the public This.Live landing surface instead of hiding the actual AI/fleet/tooling work behind generic founder copy.
- Files/systems touched: index.html, style.css, scripts/check_founder_proficiencies.py, CHANGELOG.md.
- Verification: `python3 scripts/check_founder_proficiencies.py`; HTMLParser pass over index.html, terms.html, privacy.html; local HTTP render check confirmed the block appears inside `<section id="about">`.
- Author/agent: Jarvis/Hermes

## 2026-06-04 - Banned-word fix: 'leverages' → 'uses' on index.html L176 (P0-007)
- Date: 2026-06-04
- Change: Replaced banned word 'leverages' with 'uses' on index.html line 176.
|- Files/systems touched: index.html (1 line), CHANGELOG.md (this entry), project-level CHANGELOG at /Users/jarvis/Documents/Claude/Projects/This.Live/CHANGELOG.md (updated at lines 52-58 in the same PM cycle).
|- Author/agent: coder (PM-dispatched via this-live-pm daily-impl 14:00 ET, 2026-06-04)

## 2026-06-15 - Blog post: Forge source-grounded engineering agents
- Date: 2026-06-15
- Change: Published blog post at blog/2026-06-15-forge.html about Forge, a source-grounded engineering agent for production codebases. Also updated blog/index.html and index.html blog preview section.
- Why it matters: Covers the new Forge product card added 2026-06-08 with technical deep dive on source tree parsing, import graphs, test-aware generation, and structured diff review.
- Files/systems touched: blog/2026-06-15-forge.html, blog/index.html, index.html, CHANGELOG.md.
- Verification: verify_content_package.py passed; check_blog_surface.py, check_product_cards.py, check_resume_surface.py, check_founder_proficiencies.py all passed; HTMLParser over index.html, resume.html, blog/index.html, and blog/2026-06-15-forge.html clean.
- Author/agent: Jarvis/Hermes (DPL weekly cron)

## 2026-06-11 — Award-winning design system + flagship umbrella rebuild (branch design/award-winning-v1)
- Date: 2026-06-11
- Change: Established the shared This.Live / Cortex Suite design system (`design-system.css` tokens + reusable component kit; `DESIGN-SYSTEM.md` docs) and rebuilt the umbrella `index.html` to an award-winning reference bar — sovereign-local thesis hero, 6-pillar suite grid (each links its page), problem→solution narrative, "smarter AND cheaper" flywheel, truthful "what's real today vs staged" ledger, and a strong CTA. Added `home.css` page layer.
- Why it matters: Gives every pillar page ONE coherent, dark-first, single-accent (cyan) system with a modular type scale, 8pt spacing, consistent radius/elevation/motion, AAA-minded contrast, reduced-motion support, and responsive parity at 390/768/1280/1920 — replacing the prior template-per-page drift. Establishes the visual quality bar for the rest of the site work.
- Truth discipline: Every claim cross-checked against `cortex-completion-2026-06-10/receipts/phase7/claims-ledger.md` — Mnemos 75k+/7-of-7 gates, Maestro live routing + ~63k historical labels (auto-labeling "fires", signal still maturing — NOT claimed useful), Forge factory built + base served but NO trained/served adapters, Agent Fabric engine proven e2e (not yet daily prod driver), Surfaces 3 surfaces + desktop shell (GA/store staged), managed tier labeled Planned/not-offered. No pricing, no "iOS of agentic AI", no "54 models", no fake testimonials/metrics.
- Files/systems touched: design-system.css (new), home.css (new), DESIGN-SYSTEM.md (new), index.html (rebuilt), .claude/launch.json (new), CHANGELOG.md.
- Verification: HTML tag-balance validator OK; Claude Preview MCP screenshots at 390/768/1280/1920 + headless-Chrome full-page captures (receipts/design/shots/index-1280.png, index-390.png); browser console clean (0 errors/warnings); check_resume_surface.py passed.
- Known follow-up: Legacy DOM-contract guards (check_product_cards/founder_proficiencies/stack_cards/blog_surface) now fail against the reframed index (product catalog/founder block/blog preview moved off the umbrella; still reachable via nav+footer). These are advisory only — NOT wired into the Docker build or Railway deploy — and should be re-pointed at the new contract (or retired for the index) on review/merge.
- Build-and-review: branch design/award-winning-v1 only; main untouched, NOT deployed.
- Author/agent: Jarvis (design-system phase, Claude Code)
