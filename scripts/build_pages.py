#!/usr/bin/env python3
"""Build the consulting-site pages from site-src/ into static HTML.

The deployed site has no build step: this script's OUTPUT is committed. Edit the
partials in site-src/ (page bodies, includes) or the PAGES table below, then run

    python3 scripts/build_pages.py

It stamps the shared head, header, footer and JSON-LD into every page, expands
{{icon:name}}, {{include:name}}, {{BOOK}} and {{EMAIL}} tokens, derives FAQPage
structured data from the .qa-item blocks on each page, and writes sitemap.xml.
Pages it owns carry a GENERATED banner comment; do not hand-edit those files.
"""
import hashlib
import html
import json
import re
import subprocess
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "site-src"
SITE = "https://this.live"
BOOK = "https://cal.com/bryce-murad/automation-triage"
EMAIL = "bryce@this.live"
LINKEDIN_COMPANY = "https://www.linkedin.com/company/thislive"
X_COMPANY = "https://x.com/ThisLiveActual"
GITHUB = "https://github.com/brycemurad0"

NAV = [
    ("services", "/services/", "Services"),
    ("use-cases", "/use-cases/", "Use cases"),
    ("how-it-works", "/how-it-works/", "How it works"),
    ("about", "/about/", "About"),
    ("blog", "/blog/", "Blog"),
]

PAGES = [
    dict(src="home.html", out="index.html", path="/", nav=None, og="home",
         title="Custom software and AI for small businesses | this.live, Connecticut",
         description="Bryce Murad builds custom software, workflow automation and AI assistants for small businesses in Connecticut and remotely. Book a free 30-minute triage call.",
         og_title="Custom software built around how you actually work",
         crumb=None),
    dict(src="services.html", out="services/index.html", path="/services/", nav="services", og="services",
         title="Services: custom software, automation and AI | this.live",
         description="Custom internal software, workflow automation, AI assistants, websites, private AI and network architecture. Every build is fixed price and scoped in writing after a free triage call.",
         og_title="What I build, and how we work together", crumb="Services"),
    dict(src="use-cases.html", out="use-cases/index.html", path="/use-cases/", nav="use-cases", og="use-cases",
         title="Use cases: see a build work before you buy one | this.live",
         description="Interactive walkthroughs of lead follow-up, document data entry, automatic weekly reports, spreadsheet-to-app builds and a real swim practice planner.",
         og_title="See what a build does before you buy one", crumb="Use cases"),
    dict(src="how-it-works.html", out="how-it-works/index.html", path="/how-it-works/", nav="how-it-works", og="how-it-works",
         title="How a custom software build works | this.live",
         description="A free triage call, a written fixed-price scope, weekly working demos, proof in your business, then optional support. Built by an architect directing a team of AI agents.",
         og_title="From a free call to software that runs", crumb="How it works"),
    dict(src="about.html", out="about/index.html", path="/about/", nav="about", og="about",
         title="About Bryce Murad, founder of this.live | Storrs, CT",
         description="Bryce Murad is a former Ensono network solutions architect who builds custom software and AI systems for small businesses from Storrs, Connecticut.",
         og_title="Bryce Murad, founder of this.live", crumb="About", kind="about"),
    dict(src="book.html", out="book/index.html", path="/book/", nav=None, og="book",
         title="Book a free 30-minute triage call | this.live",
         description="Book a free 30-minute video call. Bring the task that eats your week and leave with a prioritized plan, whether or not we work together.",
         og_title="Book a free triage call", crumb="Book a call"),
    dict(src="contact.html", out="contact/index.html", path="/contact/", nav=None, og="contact",
         title="Contact this.live | Storrs, Connecticut",
         description="Email bryce@this.live or book a free 30-minute triage call. this.live LLC is based in Storrs, Connecticut.",
         og_title="Get in touch", crumb="Contact", kind="contact"),
    dict(src="playbooks.html", out="playbooks/index.html", path="/playbooks/", nav=None, og="default",
         title="Playbooks | this.live", noindex=True,
         description="Step-by-step guides for running one AI workflow yourself. The first playbook is being written and tested.",
         og_title="Playbooks", crumb="Playbooks"),
    dict(src="archive.html", out="archive/index.html", path="/archive/", nav=None, og="default",
         title="Archive: superseded pages | this.live",
         description="Earlier this.live pages about the Cortex product suite, kept for the record.",
         og_title="Archive", crumb="Archive"),
    dict(src="404.html", out="404.html", path="/404.html", nav=None, og="default", noindex=True, sitemap=False,
         title="Page not found | this.live",
         description="That page is not here. It may have moved.", og_title="Page not found", crumb=None),
]

# Lucide icon bodies (24x24 stroke). Keep names in sync with site.js ICONS.
ICONS = {
    "arrow-right": '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    "external-link": '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    "check": '<path d="M20 6 9 17l-5-5"/>',
    "check-circle": '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    "clock": '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    "map-pin": '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    "video": '<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    "menu": '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
    "x": '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    "play": '<polygon points="6 3 20 12 6 21 6 3"/>',
    "pause": '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
    "chevron-left": '<path d="m15 18-6-6 6-6"/>',
    "chevron-right": '<path d="m9 18 6-6-6-6"/>',
    "code": '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    "workflow": '<rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/>',
    "bot": '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',
    "globe": '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    "lock": '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    "server": '<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>',
    "mail": '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    "file-text": '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    "bar-chart": '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    "table": '<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>',
    "waves": '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
    "briefcase": '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
    "cloud": '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
    "receipt": '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
    "graduation": '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
    "shield-check": '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    "users": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    "smartphone": '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
    "clipboard": '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
    "github": '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
    "linkedin": '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
}
X_LOGO = '<svg class="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93zm-1.29 19.5h2.04L6.49 3.24H4.3z"/></svg>'


def icon(name, cls="icon"):
    if name == "x-logo":
        return X_LOGO
    body = ICONS[name]
    return (f'<svg class="{cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{body}</svg>')


def expand(text, depth=0):
    if depth > 3:
        raise RuntimeError("include nesting too deep")
    text = re.sub(r"\{\{include:([a-z0-9-]+)\}\}",
                  lambda m: expand((SRC / "includes" / f"{m.group(1)}.html").read_text(), depth + 1), text)
    text = re.sub(r"\{\{icon:([a-z0-9-]+)(?::([a-z0-9 -]+))?\}\}",
                  lambda m: icon(m.group(1), m.group(2) or "icon"), text)
    return text.replace("{{BOOK}}", BOOK).replace("{{EMAIL}}", EMAIL)


def asset_version():
    h = hashlib.sha256()
    for f in ("site.css", "site.js"):
        h.update((ROOT / f).read_bytes())
    return h.hexdigest()[:10]


def strip_tags(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()


def faq_entities(body):
    items = []
    for m in re.finditer(r'<div class="qa-item[^"]*">\s*<h3[^>]*>(.*?)</h3>\s*(.*?)</div>', body, re.S):
        q, a = strip_tags(m.group(1)), strip_tags(m.group(2))
        if q and a:
            items.append({"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}})
    return items


def jsonld(page, body):
    url = SITE + page["path"]
    business = {
        "@type": "ProfessionalService",
        "@id": f"{SITE}/#business",
        "name": "this.live",
        "legalName": "this.live LLC",
        "url": f"{SITE}/",
        "description": "Custom software, workflow automation and AI assistants for small and mid-sized businesses, built by Bryce Murad in Storrs, Connecticut.",
        "email": EMAIL,
        "image": f"{SITE}/og/home.png",
        "logo": f"{SITE}/icon-180.png",
        "founder": {"@id": f"{SITE}/about/#bryce"},
        "address": {"@type": "PostalAddress", "addressLocality": "Storrs", "addressRegion": "CT", "addressCountry": "US"},
        "areaServed": [
            {"@type": "AdministrativeArea", "name": "Tolland County, Connecticut"},
            {"@type": "State", "name": "Connecticut"},
            {"@type": "Country", "name": "United States"},
        ],
        "knowsAbout": ["Custom software development", "Workflow automation", "AI assistants", "AI agents",
                       "Local AI models", "Document data extraction", "Websites", "Network architecture"],
        "sameAs": [LINKEDIN_COMPANY, X_COMPANY],
        "contactPoint": {"@type": "ContactPoint", "contactType": "sales", "email": EMAIL, "url": BOOK,
                         "areaServed": "US", "availableLanguage": "English"},
        "hasOfferCatalog": {
            "@type": "OfferCatalog", "name": "Services",
            "itemListElement": [
                {"@type": "Offer", "name": "Triage call", "price": "0", "priceCurrency": "USD",
                 "description": "Free 30-minute video call to find the workflows worth building first.", "url": BOOK},
                *[{"@type": "Offer", "itemOffered": {"@type": "Service", "name": n}} for n in (
                    "Custom internal software", "Workflow automation", "AI assistants",
                    "Websites and portals", "Private AI", "Systems and network architecture")],
            ],
        },
    }
    person = {
        "@type": "Person",
        "@id": f"{SITE}/about/#bryce",
        "name": "Bryce Murad",
        "url": f"{SITE}/about/",
        "image": f"{SITE}/img/bryce-480.jpg",
        "jobTitle": "Founder and AI systems architect",
        "worksFor": {"@id": f"{SITE}/#business"},
        "alumniOf": {"@type": "CollegeOrUniversity", "name": "Southern Connecticut State University"},
        "sameAs": [GITHUB],
    }
    graph = [
        {"@type": "WebSite", "@id": f"{SITE}/#website", "url": f"{SITE}/", "name": "this.live",
         "publisher": {"@id": f"{SITE}/#business"}, "inLanguage": "en-US"},
        business, person,
    ]
    pagetype = {"about": "AboutPage", "contact": "ContactPage"}.get(page.get("kind"), "WebPage")
    webpage = {"@type": pagetype, "@id": f"{url}#page", "url": url, "name": page["title"],
               "description": page["description"], "isPartOf": {"@id": f"{SITE}/#website"},
               "about": {"@id": f"{SITE}/#business"}, "inLanguage": "en-US"}
    if page.get("crumb"):
        webpage["breadcrumb"] = {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE}/"},
            {"@type": "ListItem", "position": 2, "name": page["crumb"], "item": url},
        ]}
    graph.append(webpage)
    faqs = faq_entities(body)
    if faqs:
        graph.append({"@type": "FAQPage", "@id": f"{url}#faq", "mainEntity": faqs})
    return json.dumps({"@context": "https://schema.org", "@graph": graph}, indent=2, ensure_ascii=False)


def header(active):
    links = "\n".join(
        f'        <a href="{href}"{" aria-current=\"page\"" if key == active else ""}>{label}</a>'
        for key, href, label in NAV)
    mobile = "\n".join(f'        <li><a href="{href}">{label}</a></li>' for _, href, label in NAV)
    return f'''  <a class="skip" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="wrap">
      <a class="logo" href="/" aria-label="this.live home"><i class="logo-mark" aria-hidden="true"></i><span>this<b>.</b>live</span></a>
      <nav class="site-nav" aria-label="Main">
{links}
      </nav>
      <a class="btn btn-primary btn-sm header-cta" href="{BOOK}">Book a triage call</a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="Open menu">{icon("menu", "icon icon-open")}{icon("x", "icon icon-close")}</button>
    </div>
    <nav class="mobile-nav" id="mobile-nav" aria-label="Mobile">
      <ul>
{mobile}
        <li><a href="/contact/">Contact</a></li>
        <li><a class="btn btn-primary" href="{BOOK}">Book a free triage call</a></li>
      </ul>
    </nav>
  </header>'''


def footer():
    return f'''  <footer class="site-footer">
    <div class="wrap">
      <div class="footer-grid">
        <div>
          <a class="logo" href="/"><i class="logo-mark" aria-hidden="true"></i><span>this<b>.</b>live</span></a>
          <p class="small muted" style="margin-top:var(--sp-3)">Custom software, automation and AI for small businesses. Based in Storrs, Connecticut.</p>
          <address><strong>this.live LLC</strong><br><a href="mailto:{EMAIL}">{EMAIL}</a><br>Storrs, Connecticut</address>
          <div class="socials">
            <a href="{LINKEDIN_COMPANY}" rel="me noopener" aria-label="this.live on LinkedIn">{icon("linkedin")}</a>
            <a href="{X_COMPANY}" rel="me noopener" aria-label="this.live on X">{icon("x-logo")}</a>
            <a href="{GITHUB}" rel="me noopener" aria-label="Bryce Murad on GitHub">{icon("github")}</a>
          </div>
        </div>
        <div>
          <h2>Work with me</h2>
          <ul>
            <li><a href="/services/">Services</a></li>
            <li><a href="/use-cases/">Use cases</a></li>
            <li><a href="/how-it-works/">How it works</a></li>
            <li><a href="/book/">Book a triage call</a></li>
          </ul>
        </div>
        <div>
          <h2>this.live</h2>
          <ul>
            <li><a href="/about/">About Bryce</a></li>
            <li><a href="/blog/">Blog</a></li>
            <li><a href="/contact/">Contact</a></li>
            <li><a href="/archive/">Archive</a></li>
          </ul>
        </div>
        <div>
          <h2>Legal</h2>
          <ul>
            <li><a href="/privacy.html">Privacy</a></li>
            <li><a href="/terms.html">Terms</a></li>
          </ul>
        </div>
      </div>
      <p class="footer-bottom"><span>&copy; {date.today().year} this.live LLC. All rights reserved.</span><span>Built and run on our own agent fleet.</span></p>
    </div>
  </footer>'''


def render(page, ver):
    body = expand((SRC / "pages" / page["src"]).read_text())
    url = SITE + page["path"]
    t, d = html.escape(page["title"]), html.escape(page["description"])
    og_t = html.escape(page.get("og_title") or page["title"])
    robots = '\n  <meta name="robots" content="noindex, follow">' if page.get("noindex") else ""
    og_img = f'{SITE}/og/{page["og"]}.png'
    return f'''<!DOCTYPE html>
<!-- GENERATED by scripts/build_pages.py from site-src/pages/{page["src"]}. Do not edit by hand. -->
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{t}</title>
  <meta name="description" content="{d}">
  <link rel="canonical" href="{url}">{robots}
  <meta name="theme-color" content="#080B14">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="this.live">
  <meta property="og:locale" content="en_US">
  <meta property="og:title" content="{og_t}">
  <meta property="og:description" content="{d}">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{og_img}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="{og_t}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@ThisLiveActual">
  <meta name="twitter:title" content="{og_t}">
  <meta name="twitter:description" content="{d}">
  <meta name="twitter:image" content="{og_img}">
  <link rel="icon" type="image/png" href="/favicon.png?v=2">
  <link rel="apple-touch-icon" href="/icon-180.png">
  <link rel="alternate" type="application/rss+xml" title="this.live blog" href="/rss.xml">
  <link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/space-grotesk-700.woff2">
  <link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/space-grotesk-600.woff2">
  <link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/inter-400.woff2">
  <link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/inter-600.woff2">
  <link rel="stylesheet" href="/site.css?v={ver}">
  <script>document.documentElement.classList.add('js')</script>
  <script defer src="/site.js?v={ver}"></script>
  <script type="application/ld+json">
{jsonld(page, body)}
  </script>
</head>
<body>
{header(page.get("nav"))}

  <main id="main">
{body.rstrip()}
  </main>

{footer()}
</body>
</html>
'''


def lastmod(rel):
    try:
        out = subprocess.run(["git", "log", "-1", "--format=%cs", "--", rel], cwd=ROOT,
                             capture_output=True, text=True, check=True).stdout.strip()
        return out or date.today().isoformat()
    except subprocess.CalledProcessError:
        return date.today().isoformat()


def sitemap():
    urls = []
    for p in PAGES:
        if p.get("noindex") or p.get("sitemap") is False:
            continue
        urls.append((p["path"], date.today().isoformat() if p["path"] in ("/",) else lastmod(p["out"])))
    urls.append(("/blog/", lastmod("blog/index.html")))
    blog_index = (ROOT / "blog" / "index.html").read_text()
    for href in sorted(set(re.findall(r'href="(/blog/[^"#?]+\.html)"', blog_index))):
        f = ROOT / href.lstrip("/")
        if f.exists() and "_legacy" not in href:
            urls.append((href, lastmod(href.lstrip("/"))))
    for legal in ("/privacy.html", "/terms.html"):
        urls.append((legal, lastmod(legal.lstrip("/"))))
    rows = "\n".join(f"  <url><loc>{SITE}{u}</loc><lastmod>{m}</lastmod></url>" for u, m in urls)
    (ROOT / "sitemap.xml").write_text(
        f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{rows}\n</urlset>\n')
    return len(urls)


def rss():
    """RSS 2.0 feed from the blog index cards (title, summary, link; date from filename)."""
    from email.utils import format_datetime
    from datetime import datetime, timezone
    blog_index = (ROOT / "blog" / "index.html").read_text()
    items = []
    for m in re.finditer(r'<div class="blog-card">\s*<h3>(.*?)</h3>\s*<p>(.*?)</p>\s*<a href="(/blog/[^"]+)"', blog_index, re.S):
        title, summary, href = strip_tags(m.group(1)), strip_tags(m.group(2)), m.group(3)
        d = re.search(r"(\d{4})-(\d{2})-(\d{2})", href)
        when = datetime(int(d.group(1)), int(d.group(2)), int(d.group(3)), 12, tzinfo=timezone.utc) if d else datetime.now(timezone.utc)
        items.append((when, title, summary, SITE + href))
    items.sort(reverse=True)
    esc = html.escape
    body = "\n".join(
        f"    <item><title>{esc(t)}</title><link>{u}</link><guid isPermaLink=\"true\">{u}</guid>"
        f"<pubDate>{format_datetime(w)}</pubDate><description>{esc(s)}</description></item>"
        for w, t, s, u in items)
    (ROOT / "rss.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n  <channel>\n'
        f'    <title>this.live blog</title>\n    <link>{SITE}/blog/</link>\n'
        '    <description>Building a one-person software and AI practice in public, with receipts.</description>\n'
        '    <language>en-us</language>\n'
        f'    <atom:link href="{SITE}/rss.xml" rel="self" type="application/rss+xml"/>\n{body}\n  </channel>\n</rss>\n')
    return len(items)


def main():
    ver = asset_version()
    for page in PAGES:
        out = ROOT / page["out"]
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(render(page, ver))
        print(f"built {page['out']}")
    print(f"sitemap.xml: {sitemap()} urls; rss.xml: {rss()} items; assets v={ver}")


if __name__ == "__main__":
    main()
