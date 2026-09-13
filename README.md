# this.live Landing Page

Static landing page for this.live LLC.

## Files

- `index.html` — page markup
- `style.css` — styles

## How to add a changelog entry

`CHANGELOG.md` is generated — don't hand-edit it. Every commit to this repo must
touch a file named `CHANGELOG.md` (a global pre-commit hook enforces this across
several repos), and prepending by hand to one shared file is exactly what used to
make every open landing PR conflict with every other one on merge. Fragments fix
that: each change gets its own new file, so two PRs never touch the same lines.

1. Add a fragment: `changelog.d/<YYYY-MM-DD>-<slug>.md`, containing the entry text
   (same shape as the entries in `CHANGELOG.history.md`) — a `##` heading line plus
   bullets for Change / Reason / Verified / etc.
2. Regenerate the rollup: `node scripts/changelog-assemble.mjs`.
3. Commit both the fragment and the regenerated `CHANGELOG.md`.

The assembler is deterministic and idempotent (running it twice with no fragment
changes produces a byte-identical file); `node scripts/changelog-assemble.mjs
--check` exits non-zero if `CHANGELOG.md` is stale, for CI. `CHANGELOG.md` also
carries a `merge=union` git attribute as a second line of defense — see
`.gitattributes` and `changelog.d/2026-09-12-changelog-fragments.md` for why.

Older entries from before this system (pre-2026-09-12) live untouched in
`CHANGELOG.history.md`.

## Deploy

No build step. Serve the directory as-is.

**Local preview:**

```bash
cd thislive-landing
python3 -m http.server 8000
# open http://localhost:8000
```

**Cloudflare Pages / Netlify / Vercel:**

Point the root directory to this folder and deploy. No configuration needed.

**Custom domain:**

Point your DNS A/CNAME record to your hosting provider and set the document root to this directory.
