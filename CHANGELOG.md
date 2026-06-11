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
