## 2026-10-01 — Landing: founder headshot

- Problem: the site still used an older indoor photo of Bryce, and `/work-with-me/` and the resume had no photo.
- Change: added `img/bryce-headshot.webp` (600px) and `img/bryce-headshot@2x.webp` (1200px), and replaced `img/bryce-headshot.jpg` with a 600px JPEG of the same photo. The home "I'm Bryce Murad." block, the founder-page portrait, a matching row on `/work-with-me/`, and the resume use it, with alt text "Bryce Murad". The site already has `og-image.png` for social cards, so `og:image` and `twitter:image` are unchanged.
- Reason: Bryce wants this photo used as his headshot.
- Verified: home, founder, and blog checks; the WebP files serve locally; screenshots of the home about block, `/work-with-me/`, the founder page, and the resume on desktop and mobile.
- Rollback: revert this commit.
