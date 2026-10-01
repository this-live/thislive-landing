#!/usr/bin/env python3
"""The home about block keeps the founder facts and drops the old engine pitch."""

from pathlib import Path

HTML = Path("index.html").read_text(encoding="utf-8")
start = HTML.index('id="about"')
end = HTML.index('id="faq"')
about = HTML[start:end]

required = [
    "Bryce Murad",
    "network solutions architect",
    "60+ Fortune 1000",
    "government agencies",
    "nationally ranked swimmer",
    "Singapore",
    "30+ countries",
    "/resume.html",
]
missing = [phrase for phrase in required if phrase not in about]
if missing:
    raise SystemExit("Missing founder facts: " + ", ".join(missing))

for forbidden in [
    "Designed to outlive him",
    "decentralized and sovereign by design",
    "Beacon",
    "Fieldhouse",
]:
    if forbidden in about:
        raise SystemExit("Stale founder pitch remains: " + forbidden)

print("Founder facts present on the home about block")
