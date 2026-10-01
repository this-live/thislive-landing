#!/usr/bin/env python3
"""Validate the home Cortex block explains each tool in plain language."""

from pathlib import Path

HTML = Path("index.html").read_text(encoding="utf-8")
start = HTML.index('<section class="section suite-band" id="cortex">')
end = HTML.index('<section id="about"')
block = HTML[start:end]

required = {
    "Cortex": "status screen that shows what's actually running",
    "Maestro": "trying local models first",
    "Mnemos": "filed by project",
    "Agent Fabric": "its own copy of the work",
    "Forge": "testing shows it's better",
    "Surfaces": "Ostium now covers much of this",
}
for name, phrase in required.items():
    if name not in block or phrase not in block:
        raise SystemExit(f"Cortex block missing plain line for {name}: {phrase}")

if block.count('class="pillar ') != 6:
    raise SystemExit("Expected 6 Cortex tool links on the home page")

print("Cortex block check passed: six tools, plain descriptions, Ostium noted on Surfaces")
