#!/usr/bin/env python3
"""The public blog is gone. Old /blog URLs are a permanent nginx redirect home."""

from pathlib import Path
import re

root = Path('.')

if (root / 'blog').exists():
    raise SystemExit('blog/ directory should be deleted')
if (root / 'blog-cleanup-manifest.json').exists():
    raise SystemExit('blog-cleanup-manifest.json should be deleted with the blog')

html_files = [p for p in root.rglob('*.html') if '.git' not in p.parts]
linked = []
for path in html_files:
    text = path.read_text(encoding='utf-8')
    # /blog and /blog/… are gone. /blog.css is the resume stylesheet and stays.
    if re.search(r'''href=["'][^"']*/blog(?:/|["'])''', text):
        linked.append(str(path))
if linked:
    raise SystemExit('Pages still link to the blog: ' + ', '.join(linked))

nginx = (root / 'nginx.conf').read_text(encoding='utf-8')
if 'location = /blog' not in nginx or 'return 301 /;' not in nginx:
    raise SystemExit('nginx.conf must permanently redirect /blog to /')
if 'location ^~ /blog/' not in nginx:
    raise SystemExit('nginx.conf must permanently redirect /blog/ posts to /')

index = (root / 'index.html').read_text(encoding='utf-8')
for stale in ['id="blog"', 'Read the Blog', '/blog/']:
    if stale in index:
        raise SystemExit('Home page still has blog content: ' + stale)

print('Blog removal check passed: no blog pages, no blog links, nginx 301 /blog -> /')
