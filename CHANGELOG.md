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
- Files/systems touched: index.html (1 line), CHANGELOG.md (this entry), project-level CHANGELOG at /Users/jarvis/Documents/Claude/Projects/This.Live/CHANGELOG.md (updated at lines 52-58 in the same PM cycle).
- Author/agent: coder (PM-dispatched via this-live-pm daily-impl 14:00 ET, 2026-06-04)
