#!/usr/bin/env python3
"""Validate the Cortex page explains each tool in plain language and the home page links to it."""

from pathlib import Path

HOME = Path("index.html").read_text(encoding="utf-8")
if 'href="/cortex/"' not in HOME:
    raise SystemExit("Home page must link to /cortex/")

CORTEX = Path("cortex/index.html").read_text(encoding="utf-8")
for name in ["Maestro", "Mnemos", "Agent Fabric", "Forge", "Surfaces"]:
    if name not in CORTEX:
        raise SystemExit(f"Cortex page missing {name}")
for forbidden in ["github.com/brycemurad0/maestro", "572 contract tests", "144/144"]:
    if forbidden in CORTEX:
        raise SystemExit(f"Cortex page still has stale or private content: {forbidden}")

print("Cortex check passed: home links to /cortex/, five tools named, no stale stats or private links")
