#!/usr/bin/env python3
"""Content checks for the canonical This.Live founder/resume page."""

from pathlib import Path

index = Path('index.html').read_text(encoding='utf-8')
resume = Path('resume.html').read_text(encoding='utf-8')

required_resume = [
    'Bryce Murad — Founder & AI Operator',
    'swim coach',
    'nationally ranked swimmer',
    'network solution architect',
    'Singapore and the United States',
    'lived between Singapore and the United States',
    'Hard work works',
    'Treat people right',
    'Trust people',
    'Optimize for experiences',
    'How you do anything is how you do everything',
    'Speak the truth',
    'Knowledge is power',
    'Problem solving and critical thinking are paramount',
    'Be kind to people',
    'Be generous',
    'Teach those around you',
    'The simpler your needs, the more content you will be',
    'Have fun',
    'Do what you love',
    'Provide and protect those around you',
    'Stay composed, but be a killer',
    'Compete',
    'perfect practice',
    'Confidence is king',
    'MiniMax Code /team-backed workspaces',
    'Cortex Suite',
    'Forge',
    'Surfaces',
    'Pocket Agent',
    'Personal Life OS',
    'Fleet Terminal',
    'Even Realities interface',
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
