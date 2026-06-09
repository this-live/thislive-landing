#!/usr/bin/env python3
"""Validate the Cortex Suite card grid names the actual suite components."""

from pathlib import Path
import re

HTML = Path("index.html").read_text(encoding="utf-8")

stack_start = HTML.index('<section id="stack"')
stack_end = HTML.index('<!-- THE PROBLEM -->')
stack = HTML[stack_start:stack_end]

required_section_copy = [
    "Cortex is the fully local, self-improving agentic operating stack",
    "Cortex Suite:",
    "Mnemos + Agent Fabric + Maestro + Surfaces + Forge",
    "local-first business-building OS",
]
missing = [item for item in required_section_copy if item not in stack]
if missing:
    raise SystemExit("Stack section missing Cortex Suite umbrella copy: " + ", ".join(missing))

required_component_cards = {
    "Mnemos": ["Project-scoped memory", "memory pillar", "scoped containers"],
    "Agent Fabric": ["Fleet orchestration", "orchestration pillar", "parallel agents"],
    "Maestro": ["Routing and consensus", "model-intelligence pillar", "cost, latency, privacy"],
    "Forge": ["Source-grounded engineering", "adapter-factory readiness", "cloud-trained specialists"],
    "Surfaces": ["Pocket Agent, Life OS, Fleet Terminal", "Personal Life OS", "Pocket Agent", "Fleet Terminal", "Even Realities interface"],
}

for name, terms in required_component_cards.items():
    m = re.search(r'<h3 class="card-name">' + re.escape(name) + r'</h3>(.*?)(?=<h3 class="card-name">|</div>\s*</div>\s*</section>)', stack, re.S)
    if not m:
        raise SystemExit(f"Missing Cortex Suite component card: {name}")
    card = m.group(0)
    missing_terms = [term for term in terms if term not in card]
    if missing_terms:
        raise SystemExit(f"{name} card missing: " + ", ".join(missing_terms))

card_count = stack.count('<div class="card ')
if card_count != 5:
    raise SystemExit(f"Expected 5 Cortex Suite component cards, found {card_count}")

if '<h3 class="card-name">Cortex</h3>' in stack:
    raise SystemExit("Cortex should be the umbrella suite copy, not a peer card in the component grid")

for stale in [
    "1,046 memories, 20 containers, 6/6 fleet nodes",
    "Cheapest model for each task. Zero wasted tokens. 24+ models in parallel.",
    "Intelligence. No guardrails.",
]:
    if stale in stack:
        raise SystemExit("Stale/overclaiming stack copy remains: " + stale)

print("Cortex Suite card check passed: Mnemos, Agent Fabric, Maestro, Forge, and Surfaces component cards")
