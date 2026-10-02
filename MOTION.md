# Motion primitives

All motion on this.live lives in two files, loaded on every page:

- `motion.css`: the primitives (CSS only where possible).
- `motion.js`: a small vanilla script (no framework) for the parts CSS can't do: scroll reveals, sticky-nav state and the FAQ accordion.

Each page `<head>` loads them like this:

```html
<link rel="stylesheet" href="/motion.css">
<script>document.documentElement.classList.add('m-js');setTimeout(function(){if(!window.__motionReady)document.documentElement.classList.remove('m-js')},3000)</script>
<script src="/motion.js" defer></script>
```

The inline line marks JS as available, so reveal targets start hidden with no flash of content. If `motion.js` doesn't load within 3 seconds, the class is removed and everything shows.

Sources: `org-kt/ui-ux-lib/thislive-ui-motion-standards` (house rules and tokens), `emil-design-eng` (when and how to animate), `apple-design` (interruptibility, reduced motion).

## Rules
- Use the tokens from `design-system.css`.
  - Durations: `--dur-1` 180ms (hover and colour), `--dur-2` 280ms (panels, the FAQ, nav), `--dur-3` 500ms (scroll reveals), `--dur-4` 800ms (hero entrance only).
  - Easing: `--ease` (expo-out) for anything entering, `--ease-soft` for ambient changes.
- List the properties in every transition. Never use transition-all.
- Move things with `transform` and `opacity` only. The one exception is the FAQ panel height. This means no layout shift (CLS).
- Reveals use the individual `translate` property, so they never fight hover and press `transform`.
- Honor `prefers-reduced-motion: reduce`: no entrance, no reveals, no lift or scale. Colour and opacity feedback stay. The FAQ falls back to the native toggle.
- Nothing animates on keyboard shortcuts or nav menu toggles.

## Primitives
| # | Primitive | Where | How |
|---|---|---|---|
| 1a | Hero text effect | home `h1.m-text .m-word` | Words are pre-split in the HTML, so there's no JS and no flash. Each word rises 0.25em and fades in, 60ms apart, `--dur-4` `--ease`. |
| 1 | Hero entrance | `.hero2 .container > *`, `.page-hero .container > *`, `.founder-head > div > *` | CSS `m-enter` keyframes. Opacity plus a 12px rise, `--dur-4` `--ease`, staggered in 70ms steps (max 280ms). Runs once on load. |
| 2 | Scroll reveal | section heads, service labels, `.card2`, `.step`, `.cta-band`, `.about2`, FAQ items, `.note-callout`, `.prose > *` | `motion.js` IntersectionObserver adds `.is-in` once. Opacity plus a 12px `translate`, `--dur-3`. Elements that enter together stagger in 60ms steps (max 5). |
| 3 | Card lift | `.card2` | On hover-capable devices: `translateY(-4px)` plus border and background, `--dur-1`. Linked cards also get press feedback. |
| 3b | Card spotlight | `.card2::before` | A soft accent radial glow follows the pointer. `motion.js` writes `--mx` and `--my` on pointermove (fine pointers only, rAF-batched). Only the glow's opacity transitions. Off with reduced motion. |
| 4 | Press feedback | `.btn`, `.card2--link`, `.text-link` | `:active` sets `scale(0.97)`, `--dur-1` `--ease`. Nav and footer links dim to 0.7 opacity instead. |
| 5 | FAQ accordion | `.faq details` | `motion.js` animates the `<details>` height with the Web Animations API (`--dur-2` `--ease`). It's interruptible: clicking mid-animation reverses from the current height. The `+` icon rotates as soon as you click (`data-open`). |
| 6 | Sticky nav | `#nav` | After 8px of scroll, `motion.js` (rAF-throttled, passive listener) adds `.is-scrolled`. The nav deepens and gains a shadow, and the logo scales to 0.94. The nav keeps its height and stays blurred, so nothing shifts. |

## Adding motion to new markup
- New content in a `.section` that uses `.section-head`, `.card2` or `.step` gets reveals automatically.
- New buttons get press feedback through the `.btn` class.
- For anything else, add the selector to the reveal list in **both** `motion.css` and `motion.js` (`SEL`).

## Not included
- **Animated numbers:** the site shows no stats today. If stats are added, port Motion Primitives' AnimatedNumber as a count-up driven by the same IntersectionObserver. Skip it when reduced motion is on.
- **Border trail:** I chose the spotlight instead. A rotating border trail is constant motion, which the house rules discourage for ambient UI.

## Credits
The hero text effect, card spotlight, in-view reveal and accordion are vanilla CSS/JS ports of patterns from **Motion Primitives** by ibelick (https://github.com/ibelick/motion-primitives), which is React, Tailwind and Motion. No React or Tailwind code was copied; the feel and parameters were re-implemented.

Motion Primitives is licensed under MIT, Copyright (c) 2024 ibelick:

> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
