## 2026-09-19 — Landing: draft /work-with-me consulting conversion page (staged, not deployed)

- Problem: this.live had no conversion surface for AI consulting — no offer page, no packaging, no booking CTA. GTM plan since 2026-07-21 called for `/work-with-me/`; Bryce approved free capped Automation Triage → paid ladder on 2026-09-19.
- Change: `work-with-me/index.html` — new conversion page (offers, fit, book section). Booking CTA uses `BOOKING_LINK_PLACEHOLDER` until Bryce pastes a Google Appointment schedule URL. Mailto fallback to bryce@this.live remains.
- Reason: stand up consulting arm conversion surface locally before deploy; deploy gated on Bryce yes + real booking URL.
- Verified: file present on branch `feature/work-with-me-consulting`; not pushed; not deployed.
- Rollback: delete `work-with-me/` and this fragment, re-run `node scripts/changelog-assemble.mjs`.
