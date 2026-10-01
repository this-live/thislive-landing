## 2026-10-01 — Landing: public blog removed

- Problem: the home page, nav, and footer still advertised a blog, and `/blog/` plus every post still shipped as pages.
- Change: the blog section, the Blog link in the nav and footer, the blog index, and every post page are deleted. nginx permanently redirects `/blog` and `/blog/…` to `/`. `/blog.css` stays because the resume page uses it. There is no sitemap or RSS feed in this repo to update.
- Reason: Bryce wants the public blog gone.
- Verified: blog surface and archive checks; home offer, Cortex block, and founder checks; nginx 301 from `/blog`, `/blog/`, and a former post path to `/`, with `/blog.css` still served; full-page home screenshots.
- Rollback: revert this commit.
