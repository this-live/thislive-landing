#!/usr/bin/env python3
"""Content checks for the This.Live founder/resume technology proficiencies."""

from pathlib import Path

HTML = Path("index.html").read_text(encoding="utf-8")

REQUIRED_PHRASES = [
    "AI Founder &amp; Operator Stack",
    "extensive model evaluation",
    "Claude Code",
    "Kimi Code",
    "MiniMax Code",
    "Codex",
    "Cursor",
    "Hermes",
    "OpenClaw",
    "Hugging Face",
    "adapter training",
    "Railway",
    "Cloudflare",
    "Docker",
    "Tailscale",
    "Terminus",
    "vLLM",
    "SGLang",
    "swim coach",
    "nationally ranked swimmer",
    "network solution architect",
    "Singapore and the United States",
    "Hard work works",
    "Be kind and generous",
    "Trust people",
    "Speak the truth",
    "How you do anything is how you do everything",
    "Knowledge is power",
    "Have fun and do what you love",
    "Stay composed, but compete to win",
]

missing = [phrase for phrase in REQUIRED_PHRASES if phrase not in HTML]
if missing:
    raise SystemExit("Missing founder proficiency phrases: " + ", ".join(missing))

about_start = HTML.index('<section id="about"')
about_end = HTML.index('<!-- FOOTER -->')
about = HTML[about_start:about_end]

if "AI Founder &amp; Operator Stack" not in about:
    raise SystemExit("AI proficiency block is not in the About section")

print(f"Founder proficiency content present: {len(REQUIRED_PHRASES)} required phrases")
