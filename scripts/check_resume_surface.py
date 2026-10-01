#!/usr/bin/env python3
"""Resume page keeps the core verifiable facts and drops stale items (2026-10-01)."""

from pathlib import Path

HTML = Path("resume.html").read_text(encoding="utf-8")
required = [
    "Bryce Murad: resume",
    "Network Solutions Architect",
    "Ensono",
    "60+ Fortune 1000",
    "Partnered with Microsoft",
    "Southern Connecticut State University",
    "CCNA",
    "Azure Fundamentals",
    "MEDDPICC",
    "NE-10 Conference Champion",
    "30+ countries",
    "bryce@this.live",
]
missing = [x for x in required if x not in HTML]
if missing:
    raise SystemExit("Missing resume content: " + ", ".join(missing))
for forbidden in ["This.Live", "hello@mail.this.live", "public beta"]:
    if forbidden in HTML:
        raise SystemExit("Stale resume content remains: " + forbidden)
print("Resume check passed: core facts present, stale items removed")
