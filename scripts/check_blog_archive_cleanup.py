#!/usr/bin/env python3
"""Validate cleaned This.Live blog archive cadence, truth guards, and readability."""

from __future__ import annotations

import json
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "blog-cleanup-manifest.json"
BLOG = ROOT / "blog"

BAD_CLAIMS = [
    "over two years",
    "for over a year",
    "last year running",
    "millions of video streams",
    "five figures",
    "68 percent",
    "68% acceptance",
    "Beacon generates our current revenue",
    "only revenue-producing product",
    "live revenue engine",
    "$4,200 monthly recurring",
    "$7,450 MRR",
    "$3,980 MRR",
    "perfect accuracy",
    "never hallucinate",
]

PLACEHOLDER_RE = re.compile(r"This post is part of|Full article to be generated|\bTODO\b|\bFIXME\b|\bTBD\b|\[insert")


def fail(msg: str) -> None:
    raise SystemExit(msg)


def main() -> None:
    data = json.loads(MANIFEST.read_text())
    posts = sorted(data["canonical_posts"], key=lambda x: x["date"])
    if len(posts) != 22:
        fail(f"Expected 22 canonical weekly posts, found {len(posts)}")

    if posts[0]["date"] != "2026-01-12" or posts[-1]["date"] != "2026-06-08":
        fail(f"Unexpected canonical range: {posts[0]['date']} -> {posts[-1]['date']}")

    prev = None
    for post in posts:
        current = date.fromisoformat(post["date"])
        if prev and (current - prev).days != 7:
            fail(f"Weekly cadence break: {prev} -> {current}")
        prev = current

        path = BLOG / post["file"]
        if not path.exists():
            fail(f"Missing canonical post: {path}")
        html = path.read_text(encoding="utf-8")

        if html.count("<h2>") < 3:
            fail(f"Post needs at least 3 body headers: {path.name}")
        if len(re.findall(r"<p", html)) < 5:
            fail(f"Post needs at least 5 paragraphs: {path.name}")
        if "—" in html or "–" in html:
            fail(f"Forbidden dash character in canonical post: {path.name}")
        if PLACEHOLDER_RE.search(html):
            fail(f"Placeholder/template text in canonical post: {path.name}")
        for claim in BAD_CLAIMS:
            if claim.lower() in html.lower():
                fail(f"Forbidden/unverified claim in {path.name}: {claim}")

    index = (BLOG / "index.html").read_text(encoding="utf-8")
    if "blog-archive-cleanup" in index or "truth pass" in index.lower():
        fail("Blog cleanup should not be promoted as a public/canonical blog entry")
    for post in posts:
        if f'/blog/{post["file"]}' not in index:
            fail(f"Canonical post missing from index: {post['file']}")

    print(f"Blog archive cadence/truth check passed: {len(posts)} weekly posts from {posts[0]['date']} to {posts[-1]['date']}")


if __name__ == "__main__":
    main()
