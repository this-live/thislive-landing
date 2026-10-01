#!/usr/bin/env python3
"""Content checks for the public consulting offer on the home page."""

from pathlib import Path

HTML = Path("index.html").read_text(encoding="utf-8")

required = [
    "Custom AI tools for",
    "local businesses.",
    "You approve anything before it goes out.",
    "Reception agent",
    "Lead finder and outreach",
    "Back-office automation",
    "Custom builds",
    "Ostium",
    "Maestro",
    "Mnemos",
    'id="cortex"',
    "bryce@this.live",
    "calendar.google.com/calendar/u/0/appointments/schedules/",
]
missing = [x for x in required if x not in HTML]
if missing:
    raise SystemExit("Missing home offer content: " + ", ".join(missing))

offer = HTML.split('<section id="blog"')[0]
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
    "$6",
    "$1.5",
    "from $",
    "/mo",
]:
    if forbidden in offer:
        raise SystemExit("Forbidden home-page offer copy remains: " + forbidden)

print("Home offer check passed: consulting setups, no prices, no portfolio clutter")
