#!/usr/bin/env python3
"""Content checks for the ownership-first home page (2026-10-01 rebuild)."""

from pathlib import Path

HTML = Path("index.html").read_text(encoding="utf-8")

required = [
    "Automate the right work.",
    "Keep your edge.",
    "You approve anything before it goes out.",
    'id="path"',
    'id="services"',
    "Automation consulting",
    "Reception agent",
    "Lead finder and outreach",
    "AI tool review",
    "Local AI workstation",
    "Hybrid setup",
    "Custom builds",
    "Team training and runbooks",
    "Ostium",
    "Maestro",
    "Mnemos",
    "/cortex/",
    "bryce@this.live",
    "https://calendar.app.google/91CNRw4SK5Jf2KZM9",
]
missing = [x for x in required if x not in HTML]
if missing:
    raise SystemExit("Missing home content: " + ", ".join(missing))

for forbidden in [
    "Beacon",
    "Signal &amp; Noise",
    "Signal & Noise",
    "Digital Products Lab",
    "Fieldhouse",
    "FTAG",
    "DRAAN",
    "The flywheel",
    'id="flywheel"',
    'id="products"',
    "cal.com",
    "hello@mail.this.live",
    "github.com/brycemurad0/maestro",
    "/work-with-me/",
    "$",
    "/mo",
    "transition: all",
]:
    if forbidden in HTML:
        raise SystemExit("Forbidden home-page copy remains: " + forbidden)

CSS = Path("home.css").read_text(encoding="utf-8")
if "transition: all" in CSS:
    raise SystemExit("home.css uses transition: all")
if "prefers-reduced-motion" not in CSS:
    raise SystemExit("home.css must honor prefers-reduced-motion")

print("Home check passed: ownership-first copy, no prices, no portfolio clutter, motion rules")
