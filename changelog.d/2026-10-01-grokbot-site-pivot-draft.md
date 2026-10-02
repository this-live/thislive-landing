## 2026-10-01 — Landing: preserve the Grok bot's Sep 30 local-consulting pivot draft

- Problem: the Grok bot staged a full site pivot (consulting-first pages, pillar pages moved to /archive/) on Sep 30 but never committed it; the draft only existed as uncommitted work in this worktree.
- Change: committed as-is, unmodified — new index, services, how-it-works, about, book, contact, playbooks, 404, archive index, site.css/site.js; old home + six pillar pages + /work-with-me/ moved under /archive/.
- Reason: a rollback point before the visual redesign built on top of it (next commit).
- Verified: content committed byte-for-byte from the working tree; not deployed.
- Rollback: `git revert` this commit.
