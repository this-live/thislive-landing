## 2026-09-21 — Landing: ship /work-with-me with Cal.com Automation Triage booking

- Problem: consulting conversion page was staged locally with a booking placeholder; Google Workspace Appointment schedule still blocked.
- Change: `work-with-me/index.html` wires public Cal.com link `https://cal.com/bryce-murad/automation-triage` (30-min Automation Triage); removes draft banner. `index.html` nav adds Work with me + Book a triage CTA.
- Reason: Bryce chose Cal.com interim to ship the consulting arm while Workspace recovery finishes.
- Verified: booking URL opens Cal.com event; page ready for deploy via this branch.
- Rollback: revert this commit; remove nav links; restore placeholder if needed.
