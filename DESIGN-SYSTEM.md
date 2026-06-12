# This.Live / Cortex Suite — Design System

The shared visual language for `this.live` and every Cortex pillar page. One
world-class product family: dark-first, one confident accent (cyan), AAA-minded
contrast, a modular type scale, an 8pt spacing grid, and a consistent
radius / elevation / motion language.

- **Canonical kit:** [`design-system.css`](design-system.css) — tokens + reusable component classes. Load this **first** on every page.
- **Page layers:** [`home.css`](home.css) styles the umbrella (index) only. Pillar pages may add a thin page layer the same way; `pillar.css` is the legacy pillar sheet and is being migrated onto these tokens.
- **Reference implementation:** [`index.html`](index.html) — the umbrella page is the bar every other page should clear.

No build step. Static, vanilla. CSP-safe: only `'self' 'unsafe-inline'` styles/scripts (see `_headers`), so all JS is inline and dependency-free.

---

## 1 · Design tokens

All tokens are CSS custom properties on `:root` in `design-system.css`. **Never hard-code a hex, size, or duration in a page — reference a token** so the family stays coherent.

### Color
Dark-first surfaces, one accent, supporting hues used sparingly (pillar identity only).

| Token | Value | Use |
|---|---|---|
| `--bg` | `#080B14` | Page floor |
| `--bg-1` / `--bg-2` | `#0B0F1A` / `#0E1320` | Panels / raised panels |
| `--bg-deep` | `#0A0F2E` | Brand navy (gradients, code) |
| `--surface` / `--surface-2` / `--surface-hover` | white @ 2.5–6% | Card fills / hover |
| **`--accent`** | **`#2DE2FF`** | The one confident accent (cyan) |
| `--accent-bright` / `--accent-deep` | `#5FEEFF` / `#00B8DB` | Hover / pressed |
| `--accent-soft` / `--accent-faint` / `--accent-line` | cyan @ 10/5/22% | Tints, borders |
| `--indigo` `--violet` `--blue` `--green` `--amber` `--rose` | — | Pillar dots & narrative only — not chrome |
| `--text` / `--text-body` / `--text-muted` / `--text-subtle` | `#F3F6FB` @ 100/74/50/30% | Heading → body → meta |
| `--on-accent` | `#051016` | Text on cyan fills |
| `--border` / `--border-hover` / `--border-strong` | white @ 7/14/20% | Structure |

Contrast: `--text-body` (74%) over `--bg` ≈ 9:1, above AAA for body. Headings are full-opacity.

### Type
Three families: **Space Grotesk** (display/headings), **Inter** (body/UI), **JetBrains Mono** (eyebrows, labels, code, evidence).

Modular scale, 1.250 major-third on a 16px base, fluid where it earns it:

`--fs-mono` 12 · `--fs-xs` 13 · `--fs-sm` 14 · `--fs-base` 16 · `--fs-md` 18 · `--fs-lg` 22 · `--fs-xl` 24→30 · `--fs-2xl` 30→42 (section titles) · `--fs-3xl` 40→72 (hero)

Line-heights: `--lh-tight` 1.08 · `--lh-snug` 1.2 · `--lh-body` 1.65. Display tracking `--tracking-tight` -0.03em; labels `--tracking-label` 0.14em.

### Space — 8pt grid
`--sp-1` 4 · `2` 8 · `3` 12 · `4` 16 · `5` 24 · `6` 32 · `7` 48 · `8` 64 · `9` 96 · `10` 128 · `11` 160. Sections use `--sp-9`; cards `--sp-6`.

### Radius
`--r-xs` 8 · `--r-sm` 12 · `--r-md` 16 (cards) · `--r-lg` 20 · `--r-xl` 28 (CTA) · `--r-pill` 999.

### Elevation
`--el-1` subtle · `--el-2` card hover · `--el-3` floating/terminal · `--el-accent` accent ring + glow.

### Motion
`--ease` `cubic-bezier(.22,1,.36,1)` (expo-out, the house easing) · `--ease-soft` for color. Durations `--dur-1` .18s → `--dur-4` .8s. **All motion is wrapped by `prefers-reduced-motion: reduce`** which neutralizes animation, the reveal, and the hero particle field.

---

## 2 · Components (classes in `design-system.css`)

| Component | Class | Notes |
|---|---|---|
| **Header / nav** | `.nav` > `.nav-inner` (`.logo`, `.nav-links`, `.nav-toggle`) | Fixed, blurred; `.is-scrolled` adds hairline; mobile `.nav-toggle` opens `.nav-links.is-open` |
| **Footer** | `.footer` > `.footer-grid` (`.footer-brand`, `.footer-col`), `.footer-bottom`, `.footer-note` | 4-col → 2-col → 1-col |
| **Buttons** | `.btn` + `.btn-primary` / `.btn-outline` / `.btn-ghost` / `.btn-disabled`; `.btn-sm`, `.btn-arrow` | `.btn-arrow` nudges its SVG on hover |
| **Badge** | `.badge` + `.badge--live` / `.badge--build` / `.badge--plan` | Status dot; `--live` pulses |
| **Section scaffold** | `.section` (+`--tight`/`--hairline`), `.container` (+`--narrow`) | |
| **Section header** | `.section-head` (+`--center`) > `.eyebrow`, `.title`, `.lede` | `.eyebrow` draws a leading rule |
| **Card** | `.card`; grids `.grid` + `--2`/`--3`/`--auto` | Base panel + hover lift |
| **Pillar card** | `.pillar` + hue `.h-cyan`…`.h-amber`; `.pillars` grid | `.pillar-mark`, `.pillar-name`, `.pillar-kills`, `.pillar-desc`, `.pillar-more`. Hue drives mark, top-line, glow, hover border via `--hue` |
| **Stat** | `.stats` > `.stat` (`.stat-num` w/ `.unit`, `.stat-label`) | |
| **Code / terminal** | `.terminal` > `.terminal-bar` (`.terminal-dots`, `.terminal-title`) + `.terminal-body` | Token spans: `.cmt .pr .ok .key .str .out` |
| **CTA band** | `.cta` > `.cta-card` (`h2`, `p`, `.cta-actions`) | Accent-ringed, glow top |
| **Reveal** | `.reveal` + `data-delay="1..5"` | Add `.in` via IntersectionObserver |

Helpers: `.accent-text`, `.gradient-text` (cyan→indigo clip), `.eyebrow`, `.title`, `.lede`.

---

## 3 · Page recipe

```html
<head>
  <!-- fonts: Inter + Space Grotesk + JetBrains Mono -->
  <link rel="stylesheet" href="/design-system.css">
  <link rel="stylesheet" href="/your-page.css"><!-- optional thin layer -->
</head>
<body>
  <nav class="nav" id="nav">…</nav>
  <section class="section">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">Label</p>
        <h2 class="title">Heading</h2>
        <p class="lede">Subhead.</p>
      </div>
      …components…
    </div>
  </section>
  <footer class="footer">…</footer>
  <script>/* nav scroll state, mobile toggle, reveal observer, reduced-motion guard */</script>
</body>
```

The umbrella page ships the canonical inline JS (nav `.is-scrolled`, mobile toggle with `aria-expanded`, reveal observer, and a reduced-motion-aware particle field). Copy it verbatim for new pages.

---

## 4 · Principles

1. **Dark-first, one accent.** Cyan is the only chrome accent. Other hues identify pillars and the problem→solution narrative — never buttons or links.
2. **Tokens, not values.** Reference a custom property; never inline a raw hex/size/duration.
3. **8pt rhythm.** Spacing and radii come from the scale. No magic numbers.
4. **Restraint over decoration** (Linear), **typography + whitespace** (Vercel), **depth** (Stripe), **warmth + clarity** (Anthropic).
5. **Motion with manners.** Intentional reveal + micro-interactions, zero jank, and `prefers-reduced-motion` always honored.
6. **Accessible by default.** Semantic HTML, visible `:focus-visible`, alt/aria on icons & toggles, keyboard-navigable, AAA-minded contrast.
7. **Truth discipline is visual too.** Status badges (`Live` / `Active Build` / `Planned`) and monospace evidence lines keep claims honest. A claim with no receipt doesn't ship.
8. **Fast & static.** No framework, no layout shift, dependency-free inline JS, CSP-safe.

---

## 5 · Responsive breakpoints
`980px` (pillars/grid → 2-col, footer → 2-col) · `720px` (nav → hamburger, everything → 1-col, gutter 20px) · `440px` (footer → 1-col, tighter buttons). Verified at 390 / 768 / 1280 / 1920.
