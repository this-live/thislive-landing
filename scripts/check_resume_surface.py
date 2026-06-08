#!/usr/bin/env python3
"""Content checks for the canonical This.Live founder/resume page."""

from pathlib import Path

index = Path('index.html').read_text(encoding='utf-8')
resume = Path('resume.html').read_text(encoding='utf-8')

required_resume = [
    'Bryce Murad — Founder & AI Operator',
    'MiniMax Code /team-backed workspaces',
    'Cortex Suite',
    'Beacon',
    'Maestro',
    'Signal & Noise',
    'Digital Products Lab',
    'Fieldhouse Games',
    'FTAG Studio',
    'Ages and Arrows',
    'Brokernomex / IQlume',
    'SAQ / Storrs Aquatics',
    'Cursor',
    'Hermes',
    'OpenClaw',
    'Claude Code',
    'Kimi Code',
    'MiniMax Code',
    'Codex',
    'Hugging Face',
    'vLLM',
    'SGLang',
    'LoRA',
    'adapter training',
    'Railway',
    'Cloudflare',
    'Docker',
    'Tailscale',
    'Terminus',
]
missing = [x for x in required_resume if x not in resume]
if missing:
    raise SystemExit('Missing resume content: ' + ', '.join(missing))

if '/resume.html' not in index:
    raise SystemExit('Landing page does not link to /resume.html')
if 'https://bryce.this.live' in index:
    raise SystemExit('Landing page still links to stale bryce.this.live artifact instead of canonical resume.html')

print(f'Resume surface check passed: {len(required_resume)} required phrases, landing links canonical resume')
