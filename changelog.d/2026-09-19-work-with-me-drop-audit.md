## 2026-09-19 — Landing: /work-with-me drop standalone audit from packaging

- Problem: staged consulting page still showed a $2,500 AI Operations Audit step after Bryce decided the public ladder is Triage → Build → Retain only.
- Change: `work-with-me/index.html` — offers section is now Automation Triage (free) → scoped Build $6–15k (discovery in kickoff) → Retainer $1.5–3k/mo. No standalone audit card. Booking CTA still PLACEHOLDER pending Workspace unlock.
- Reason: Bryce decision 2026-09-19 via Consulting Desk.
- Verified: page copy updated on branch `feature/work-with-me-consulting`; not pushed; not deployed.
- Rollback: revert this commit.
