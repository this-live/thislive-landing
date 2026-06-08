#!/usr/bin/env python3
"""Content checks for This.Live product-card status accuracy."""

from pathlib import Path

HTML = Path("index.html").read_text(encoding="utf-8")

required = [
    "Cortex Suite",
    "Beacon",
    "Public Beta",
    "Forge",
    "Source-grounded engineering agents",
    "Surfaces",
    "Pocket Agent",
    "Personal Life OS",
    "Fleet Terminal",
    "Even Realities",
    "punched-up intent",
    "Agent Fabric",
    "Maestro",
    "Live Surface",
    "Signal &amp; Noise",
    "Production Pipeline",
    "Digital Products Lab",
    "Active Build",
    "Fieldhouse Games",
    "In Build",
    "FTAG Studio",
    "Future Throwback Arcade Games",
    "Ages and Arrows",
    "DRAAN",
    "R&amp;D Track",
]
missing = [x for x in required if x not in HTML]
if missing:
    raise SystemExit("Missing product-card content: " + ", ".join(missing))

for forbidden in [
    "PDF guides, $9-29",
    "<span class=\"badge badge--soon\">Open Source</span>",
    "<span class=\"badge badge--live\">Shipped</span>",
    "retrieve with perfect accuracy",
    "never hallucinate",
]:
    if forbidden in HTML:
        raise SystemExit("Forbidden stale/overclaiming product-card copy remains: " + forbidden)

products_start = HTML.index('<section id="products"')
products_end = HTML.index('<!-- ABOUT -->')
products = HTML[products_start:products_end]

cortex_start = products.index('<h3 class="card-name">Cortex Suite</h3>')
cortex_end = products.index('</div>', cortex_start)
cortex_card = products[cortex_start:cortex_end]
for required_in_cortex in [
    "Hermes runtime",
    "Mnemos memory",
    "Agent Fabric orchestration",
    "Maestro routing",
    "Forge adapter factory",
    "Surfaces for Pocket Agent, Personal Life OS, and Fleet Terminal",
]:
    if required_in_cortex not in cortex_card:
        raise SystemExit("Cortex Suite card missing pillar: " + required_in_cortex)

ftag_start = products.index('<h3 class="card-name">FTAG Studio</h3>')
ftag_end = products.index('</div>', ftag_start)
ftag_card = products[ftag_start:ftag_end]
if "MiniMax" in ftag_card:
    raise SystemExit("FTAG card must not be framed as MiniMax-backed")

card_count = products.count('<div class="card ')
if card_count != 10:
    raise SystemExit(f"Expected 10 product cards, found {card_count}")

print("Product-card content check passed: 10 cards, current statuses, no stale overclaims")
