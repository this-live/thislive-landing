#!/usr/bin/env python3
"""Validate the Cortex stack card grid names every first-class pillar."""

from pathlib import Path

HTML = Path("index.html").read_text(encoding="utf-8")

stack_start = HTML.index('<section id="stack"')
stack_end = HTML.index('<!-- THE PROBLEM -->')
stack = HTML[stack_start:stack_end]

required = [
    "Cortex",
    "Local-first AI runtime",
    "Mnemos",
    "Project-scoped memory",
    "Agent Fabric",
    "Fleet orchestration",
    "Maestro",
    "Routing and consensus",
    "Forge",
    "Source-grounded engineering",
    "adapter-factory readiness",
    "Surfaces",
    "Pocket Agent, Life OS, Fleet Terminal",
    "Even Realities interface",
]
missing = [item for item in required if item not in stack]
if missing:
    raise SystemExit("Stack section missing Cortex pillar content: " + ", ".join(missing))

card_count = stack.count('<div class="card ')
if card_count != 6:
    raise SystemExit(f"Expected 6 Cortex stack cards, found {card_count}")

for stale in [
    "1,046 memories, 20 containers, 6/6 fleet nodes",
    "Cheapest model for each task. Zero wasted tokens. 24+ models in parallel.",
    "Intelligence. No guardrails.",
]:
    if stale in stack:
        raise SystemExit("Stale/overclaiming stack copy remains: " + stale)

print("Cortex stack card check passed: 6 first-class pillars including Forge and Surfaces")
