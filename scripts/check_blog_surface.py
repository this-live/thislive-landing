#!/usr/bin/env python3
"""Content checks for canonical This.Live blog deployment surface."""

from pathlib import Path
import re

root = Path('.')
index = (root / 'index.html').read_text(encoding='utf-8')
blog_index = (root / 'blog' / 'index.html').read_text(encoding='utf-8')

required_landing = [
    'id="blog"',
    'What I am building, in public.',
    '/blog/2026-06-08-digital-products-lab-content-loop.html',
    '/blog/2026-06-01-thislive-operating-model.html',
    '/blog/2026-05-25-tool-calling-and-receipts.html',
    '/blog/2026-03-16-forge-source-grounded-engineering-agents.html',
    'Read the Blog',
]
missing = [x for x in required_landing if x not in index]
if missing:
    raise SystemExit('Missing landing blog content: ' + ', '.join(missing))

for stale in [
    '/blog/2026-06-15-forge.html',
    '/blog/2026-06-08-building-with-ai.html',
    '/blog/2026-06-01-supermemory.html',
    '/blog/from-openclaw-to-hermes.html',
]:
    if stale in index:
        raise SystemExit('Landing page still links stale/unsafe blog preview: ' + stale)

required_files = [
    'blog/index.html',
    'blog/2026-06-08-digital-products-lab-content-loop.html',
    'blog/2026-06-01-thislive-operating-model.html',
    'blog/2026-05-25-tool-calling-and-receipts.html',
    'blog/2026-03-16-forge-source-grounded-engineering-agents.html',
    'blog.css',
]
missing_files = [x for x in required_files if not (root / x).exists()]
if missing_files:
    raise SystemExit('Missing blog files: ' + ', '.join(missing_files))

if '[DRAFT - LLM generation failed]' in blog_index:
    raise SystemExit('Broken draft marker remains in blog index')
if (root / 'blog' / '2026-04-22-project-scoping.html').exists():
    raise SystemExit('Broken generated draft post should not ship')

bad_links = []
for href in re.findall(r'href="(/[^"]+\.html)"', blog_index):
    if not href.startswith('/blog/'):
        bad_links.append(href)
if bad_links:
    raise SystemExit('Blog index has root-relative post links outside /blog: ' + ', '.join(bad_links[:8]))

post_count = len(list((root / 'blog').glob('*.html')))
if post_count < 30:
    raise SystemExit(f'Expected at least 30 blog HTML files, found {post_count}')

print(f'Blog surface check passed: {post_count} HTML files, landing section present, links normalized')
