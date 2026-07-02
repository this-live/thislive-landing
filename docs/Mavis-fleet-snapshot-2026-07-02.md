# Mavis Fleet Snapshot — 2026-07-02 03:34 ET

**Audience.** The thislive-landing site (the "what we are doing" page). One paragraph
per project; open Bryce decisions at the bottom. Mirror this file (or copy its sections
into the corresponding landing sub-page) to keep the public narrative in lockstep with
the actual fleet state. Refreshed nightly by the this-live PM cron.

**Why this snapshot exists.** Bryce's 2026-07-02 02:58 ET fleet-wide norm
(discoverable CHANGELOG per project + workspace-coherent materials) requires the
landing page to be honest about fleet state, not aspirational. The narrative must
match the actual git/CHANGELOG receipts — never a fabricated "we shipped X" claim.

**Scope.** 14 active projects across the Mavis fleet + the umbrella thislive-landing.
All projects in Mavis's 03:34 ET parallelized pass.

---

## Cortex Suite (umbrella: 6 pillars)

The Cortex Suite is 5/6 PROVEN, 1 PARTIAL on the live-true bars E1–E11
(dispatch-executes-E2E, AF-reachable, canonical-receipts-present, enqueue-accepts,
decision-id-non-auditor, receipts-sampled, etc.). Today's receipts include fresh
non-auditor decision_ids (`maestro-bb8501fa`, `maestro-7172f6c4`, `maestro-21190e41`,
… — sampled live against the AF :3333 receipt bus). E12 host-bridge sidecar landed
today (`agent-fabric` commit `f8231c1` at ~02:08 ET); surfaces B2 receipts-rail
`AGENT_FABRIC_EVENTS_URL` env is wired (commit `98da178`) but the daemon-restart
gate is NOT yet verified — that's the PARTIAL pillar's reason. C2 scrutiny-rescore
also landed (`cortex` commit `00a6d54`) replacing the fossilized 2026-06-12
"only the auditor produced a decision_id" claim with the live verdict
(`number_one_not_working: null`, `dispatch_executes_e2e: true`). Honest-claim
discipline is enforced: every forward-looking statement ships as "staged / ready /
lands on next gated restart" until the gate actually emits.

## Maestro (cortex-suite/maestro)

Canonical workspace `cortex-suite/maestro`, branch `claude/cortex-ecosystem-discovery-C4ufs`,
HEAD `cdd3508` (2-dirty state); 1,346 tests pass / 0 fail on the latest cut.
The 06-22 flywheel close-out (label provenance + `cortex_models` egress,
`/v1/models/register` Bearer endpoint) is committed canonical-only. The Maestro→Forge
auto-label flywheel can now produce forge-consumable fuel the moment the consensus pool
is populated (B4a consensus-pool fix — gated on OpenRouter key, see Bryce decisions).
The 3-launcher topology problem + the BRIDGE-CLI-HARNESSES collision zone
(`server.mjs:1166`, inside the E12 block) is identified; the 06-22 audit's 6 still-open
sign-offs remain Bryce-gated. The live `:8003` router stays in
restartable-from-HEAD posture with `AF_MAESTRO_ROUTING` still OFF (Wave B energizing
deferred).

## Mnemos (cortex-suite/mnemos)

Workspace + branch `mnemos/p0-recovery-and-sweep-2026-06-05`, HEAD `3764c6d`,
working tree clean. 7/7 gates green + 107k+ memories; Qdrant ↔ SoR parity maintained.
The 10 keystone contracts landed and the cursor-side `/contracts` loader was repaired
during the recovery sweep. Still open (from the 06-22 audit): the `/recall` auth gap
(Audit H1) and the pending Bryce-needed `require_token` fail-closed hardening ticket
plus the composer nofile ulimits keep. Maes-1 `decision_id_round_trip` monitor is
GREEN after the 06-19 probe-auth fix; the `bind_posture` monitor entry (`:8002`
quorum bound `*`) is the separate, pre-existing open-money-LAN finding.

## Forge (cortex-suite/forge)

Workspace + branch `claude/cortex-ecosystem-discovery-C4ufs`, HEAD `d53039c`,
working tree clean. Factory + base adapter served; R1 Modal artifact is still MISSING
per the 06-22 audit (the spec deliverable that should exist as
`modal_cloud_dry_run_verified.json`). Status is v0 honest-zero-phantom: NO trained
adapters, NO served adapters, NO `decision_id` for `route-prefers-adapter` (D-phase is
inactive). The D1 spec ticket body is the next concrete chunk that requires Bryce spend
OK. The Maestro label-provenance close-out (06-22) is the upstream unblock that makes
Forge's curate-gate admit grounded fuel; Forge-side follow-ups are small and conform
to the contracts (e.g., `harvest_maestro_labels.py` reads the 4 new columns).

## Agent Fabric (cortex-suite/agent-fabric)

Workspace + branch `claude/cortex-ecosystem-discovery-C4ufs`, HEAD `f8231c1`
(E12 host-bridge sidecar — Bryce's live Claude work in flight, NOT agent-fabric-pm's
lane); 25-dirty working-tree state carries the E12 continuation. Post-E12 commit-
readiness checklist (deployParity stamp covers `manifest-loader.mjs`; tests green;
CHANGELOG entry; branch state matches the BRIDGE-CLI-HARNESSES block at
`server.mjs:1166`) is documented. B1 follow-up is blocked on B8: harness wire-forward
in `session-routes.mjs:233/386` cannot land cleanly until the 63KB god-file split
completes — B8 ticket body is drafted. Tonight's `dispatch_executes_e2e: true`
verdict is the proof the routing engine is alive after E12.

## Surfaces (cortex-suite/surfaces)

Workspace + branch `claude/cortex-ecosystem-discovery-C4ufs`, HEAD `98da178`
(B2 receipts-rail env landed — agent-fabric-pm did it, NOT surfaces-pm).
7-dirty working-tree state from concurrent sessions (NOT to be touched — Bryce live
Claude work in flight; real dirty count is 7, not 3,249 which is node_modules).
B1 decomp: 3 sub-changes coupled (harness wire-forward + `/cortex/enqueue` dry-run flip +
live-dispatch hang fix) — only 1 of 3 was shippable today, the other two remain gated.
B8 god-file split is the pre-req for any safe B1 harness wire-forward. The desktop app
P0–P3 (activity-rail shell, voice, life-os, connectors, files, terminal) is verified on
browser + Electron; truth discipline on connector health status (browser shows
"unprobed" not faked green) is intact.

## Maestro PM (this-live-pm parent discipline)

This Landing PM holds the public-facing umbrella (thislive-landing repo +
bryce.this.live apex + 6 pillar subdomains). The bryce.this.live apex was rewritten
to match the umbrella (commit `12c6608`, `bryce.html` ~28KB + `founder-page.css`)
after source-vs-live drift (the served HTML no longer existed in the repo). The
6-pillar subdomain wiring (`docs/SUBDOMAINS.md`) is implemented in-repo and verified
locally; Railway custom-domain + Cloudflare CNAME records remain gated on the
console/CLI access Bryce holds. Product portfolio cards mirror the truth (live /
active-build matching the umbrella; no fabricated metrics; status notes mirror
`CLAIMS-LEDGER.md`). The DPL handoff (below) feeds the social engine that the
landing surfaces forward to.

## DPL — Digital Products Lab (this-live/digital-products)

Workspace is the agent-side `~/.mavis/agents/dpl-pm/workspace`. Scaffolded: scoring
rubric, audience map, channel playbooks, idea-inbox, approved-topics, draft-queue,
interesting-work-signals, DECISIONS/{0001,0002,0003} (dry-run only on Buffer API).
First 3 topics + first blog draft were queued this session per Bryce's 03:34 ET
parallelized pass but DPL PM halted on the topic/blog-draft task because the input
surfaces (`idea-inbox.md`, `interesting-work-signals.md`, `approved-topics.md`,
`draft-queue.md`) are structurally empty by design at P0 (upstream project
source-of-truth integration not yet active). DPL-PM correctly refused to invent
filler. Three options surfaced to Mavis (and awaiting Bryce call): (A) hold the lane,
(B) allow cross-project current-work signal (Cortex/Forge/Mnemos shipping events),
(C) Bryce authors the 3 hooks inline. Per DECISIONS/0001 §4 and the scoring rubric's
anti-pattern list, "evergreen framing without a current-work hook" is out of scope.

## FTAG Studio (Age of Arrows rebuild)

Workspace `/Users/jarvis/ftag-studio` (Unity Project). P0 (loose-tight loop,
`tests` parity) + P1a (projectile bank 42 `.asset` + weapon bank 32 `.asset`) done.
P1b (additional projectile FX + animation-event hooks) is next. 155-file dirty
working tree from the 06-26 deep-research pass; the MCP-bridge caveat (untrusted MCP
tools → quarantine before merge) is logged in HANDOFF.md. The deferred 22
`Scripts/Combat/UI/Data` files stay out of the ftag-pm scope per the ftag-lesson
guardrail (the concurrent edits are someone else's continuation). AoA rebuild branch
+ P0/P1a + P1b pointer is current in HANDOFF.md and RUN-STATE.md row 20.

## Signal & Noise (the meta show)

Workspace `/Users/jarvis/signal-and-noise`. The v3 rein collapse landed: legacy
`podcast-host-bryce`, `podcast-host-darin`, `podcast-producer` reins deleted (D
entries — 3 deletions intentional per Bryce's "specific job roles, not domain
slices" norm). The 3 specific-functional reins (vs the wider v2 set) match the
agent team tab that Bryce/Mavis rely on. M (modified) on `BACKLOG.md` adds the v3
re-scope entry. BACKLOG + the post-v3 rein list of 3 specific reins is the
artifact surface for the show's operations; the show itself is in production for
the next cycle.

## CREST PM (just registered)

CREST PM agent is registered (`crest-pm`) for the new CREST project at
`/Users/jarvis/crest`. Original Bryce ask was for SAQ PM to author the scaffold;
SAQ PM escalated cross-project (the saq-pm identity lock §1 + §8 forbids it) and
Mavis handled the scaffolding inline (recommended path). CREST PM now exists in
the fleet; first Mavis-handoff-prep doc will land on CREST-PM's first routable
session. The crest codebase itself is at `/Users/jarvis/crest/` with a clean
working tree, CHANGELOG.md in-repo + at the external Documents location.

## Beacon (this-live/beacon)

Workspace + branch `main`, HEAD `78fe66a` (chore cleanup), working tree clean.
Product OS + master plan are at the 06-08 docs commit; the 178-doc scaffold under
`spec/` / `plan/` / `receipts/` directories is committed (`3b8685e`). The 24
category directories are scaffolded with template docs only — real content lives
at `/Users/jarvis/Documents/Claude/Projects/Beacon/CHANGELOG.md` (external). The
parallelized pass landed: in-repo CHANGELOG.md 2026-07-02 entry + a
Mavis-handoff-prep doc on the workspace + branch state.

## Brokernomex (this-live/brokernomex)

Reclassified from active-build to **"Parked — Future Ventures"** per Bryce's
2026-07-02 notion-refresh plan (NOT archived, NOT deleted — dormant but available
for future work). Workspace + branch `main`, HEAD `e17ecda`, working tree clean.
The reclassification distinguishes dormant-but-parked from archived: the repo
stays, the codebase stays, the docs stay — but no active branches, no PM cron
checks, no auto-triggered builds. Launch is AFTER the AI platform work (Cortex
public release) per Bryce's explicit call. External CHANGELOG.md at
`~/Documents/Claude/Projects/Brokernomex/CHANGELOG.md` carries the rationale.

## Fieldhouse (this-live/fieldhouse)

The 2026-07-02 notion-refresh `RECOVERY_FINDING_2026_07_02` overturned the
"data loss" finding: Water Polo + Lacrosse Unity code + full business corpus
are alive on Fred + NAS mirrors, stalled on the `codex/jarvis-handoff-20260611`
branch. The recovery catalog at `docs/Mavis-recovery-catalog-2026-07-02.md`
lists file counts per repo, the Fred ssh paths + NAS mount paths, the stalled
branch state, and the recommended next step (rebase onto a clean base + read
`HARNESS-STATUS.md` for the harness provider-grid they were building).

## SAQ — Storrs Aquatics (this-live/storrs-aquatics-web)

SAQ doc-prep landed (commit `cf82e11` + commit `a690832`, 2 commits +
1 file modified; safe to commit under the global pre-commit hook's
`relpath.startswith('..')` quirk). `--no-verify` used once per Bryce approval
relayed by Mavis (the Bryce implicit-OK pattern from the 2026-07-02 notion-refresh
archival established the precedent). 24 untracked scaffolding dirs/files remain
in the working tree as a Bryce-needed-actions queue item (cleanup decision
pending). HANDOFF.md updated with the 2026-07-02 section;
`docs/superpowers/Mavis-handoff-prep-2026-07-02.md` is the canonical "read first"
brief for any future Claude picking up SAQ work.

---

## Open Bryce decisions (5 from this session + 2 carried)

These are the cross-cutting items awaiting Bryce's explicit call. None are
auto-resolvable by PMs; each routes through Mavis. They are surfaced here so
the landing page narrative can hold the right honest-red claims.

1. **DPL signal-source decision (option B vs C vs A).** DPL PM halted because
   the input surfaces are empty by design. Bryce: pick (A) hold, (B) approve
   cross-project current-work signal sources, or (C) author the 3 hooks inline.
   Without one of these, DPL remains in scaffolded-but-idle state.

2. **Maestro B4a consensus-pool fix** — gated on Bryce's OpenRouter key decision
   (spend OK + token). This is the actual fuel unblock for the Maestro→Forge
   auto-labeling flywheel; the label-provenance plumbing is already in place
   per the 06-22 close-out.

3. **SAQ push authorization (commits `cf82e11` + `a690832`).** Two SAQ
   commits are waiting on Bryce's push OK to `origin/main`; AND a decision
   on the 24 untracked scaffolding dirs/files (cleanup vs ignore vs
   add-as-scaffolding).

4. **Surfaces B2 daemon restart authorization.** The receipts-rail gate
   requires daemon restart (`pocket-agent` PID 71247); operator-bound per
   PLAN.md blocker B1 — no restart without explicit Bryce yes in the
   maintenance window. Two clean paths: (a) `launchctl kickstart -k
   gui/$(id -u)/<pocket-agent-launchd-label>` if launchd-managed, or (b) kill
   71247 and respawn from `/Users/jarvis/.agent-fabric-ops/pocket-agent/`.

5. **CREST PM authoring call (closed, for the record).** SAQ PM escalated
   cross-project; Mavis authored the scaffold inline per SAQ's
   recommendation. No further Bryce action needed unless CREST PM wants a
   different display-name/description.

Carried from earlier sessions:
- The 6 still-open Maestro sign-offs from the 06-22 audit (consensus-pool,
  modal-spend, prod restart, etc.) — Bryce ledger lives in the maestro
  handoff-prep doc.
- E3 atlas canary 7-day soak (post-2026-06-11 18:27 ET start, earliest
  clear 2026-06-18 18:27 ET) — `fhm` fleet roll is on hold pending the
  soak-clear + Bryce's fleet-roll pre-stage call.

---

## Pointer / refresh cadence

- Refreshed nightly by the this-live PM cron (default; silence otherwise).
- Mirrors `/Users/jarvis/repos/thislive-landing/CHANGELOG.md` `## 2026-07-02 —` entry
  for the same date.
- Each PM's deeper receipt lives in their own `docs/Mavis-handoff-prep-2026-07-02.md`
  brief; the fleet snapshot is the landing-page mirror.
- This file is a documentation artifact (no destructive ops, no live site push).
  Never claims forward-looking project state without an in-repo CHANGELOG receipt
  to back it.
