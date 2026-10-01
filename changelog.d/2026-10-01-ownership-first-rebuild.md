## 2026-10-01 — Landing: ownership-first home page rebuild

- Problem: the home page still pitched "decentralized, sovereign, fully-local agentic AI" with a portfolio, stale stats, Cal.com booking and an old price ladder on `/work-with-me/`.
- Change: new home page built from `site-rebuild/landing-v1.md`. Hero "Automate the right work. Keep your edge." Sections: problem, the path (start, choose, run it yourself, own it), services mapped to the path, proof, why local now, how it works, about (headshot), FAQ, footer. No prices. Booking goes to the Google appointment page; contact is bryce@this.live. `/work-with-me/` folded into the home page and 301s to `/#how`; links on other pages updated. New `home.css` uses the design-system motion tokens (no `transition: all`, `:active` press feedback, reduced motion and reduced transparency honored, no canvas or JS animation). Home checks rewritten for the new page.
- Reason: Bryce's ownership-first positioning; supersedes PR #18.
- Verified: blog, home, Cortex and founder checks; local nginx with repo config (301s for `/blog*` and `/work-with-me*`, `/blog.css` 200); internal link check; Playwright screenshots at 1440, 768 and 390 wide with no horizontal overflow and no console errors.
- Rollback: revert this commit.
