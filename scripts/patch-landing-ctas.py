#!/usr/bin/env python3
"""
Repoints the landing's registration CTAs at the platform's login page.

Run this after every re-sync from the landing repo (StartupetLanding), since
a fresh copy from that repo always has the original /contact hrefs on these
specific buttons. Safe to run multiple times (no-ops once already patched).

Targets exactly three button instances, matched by their surrounding
class/attribute context so real nav/footer "Contact" links are untouched:
  1. Homepage-only header button (aria-label="Apply Now")
  2. Bottom "Ready to register your startup?" promo button (all 7 pages)
  3. Same promo block's heading-wrapping link (all 7 pages)
"""
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent / "landing-static"
LOGIN_URL = "/auth/sign-in"

HTML_PATCHES = [
    ('aria-label="Apply Now" href="/contact"', f'aria-label="Apply Now" href="{LOGIN_URL}"'),
    ('class="btn btn-line btn-line-opposite" href="/contact"', f'class="btn btn-line btn-line-opposite" href="{LOGIN_URL}"'),
    ('data-cursor-text="Contact Us" href="/contact"', f'data-cursor-text="Contact Us" href="{LOGIN_URL}"'),
]

CHUNK_PATCHES = [
    ('href:"/contact","aria-label":"Apply Now"', f'href:"{LOGIN_URL}","aria-label":"Apply Now"'),
    ('className:"btn btn-line btn-line-opposite",href:"/contact"', f'className:"btn btn-line btn-line-opposite",href:"{LOGIN_URL}"'),
    ('className:"active-cursor-accent","data-cursor-text":"Contact Us",href:"/contact"',
     f'className:"active-cursor-accent","data-cursor-text":"Contact Us",href:"{LOGIN_URL}"'),
]

PAGES = ["index.html", "about-us/index.html", "process/index.html", "team/index.html",
         "faq/index.html", "contact/index.html", "Designation/index.html"]


def patch_file(path, patches):
    text = path.read_text(encoding="utf-8")
    orig = text
    hits = []
    for old, new in patches:
        n = text.count(old)
        if n:
            text = text.replace(old, new)
            hits.append((old[:50], n))
    if text != orig:
        path.write_text(text, encoding="utf-8")
    return hits


def main():
    if not ROOT.exists():
        sys.exit(f"landing-static not found at {ROOT} — run the rsync step first")

    print("=== HTML pages ===")
    for page in PAGES:
        p = ROOT / page
        if not p.exists():
            print(f"{page} -> MISSING")
            continue
        hits = patch_file(p, HTML_PATCHES)
        print(f"{page} -> {hits if hits else 'no matches (already patched, or page changed upstream)'}")

    print("\n=== JS chunks ===")
    patched = 0
    for f in sorted((ROOT / "_next/static/chunks").glob("*.js")):
        hits = patch_file(f, CHUNK_PATCHES)
        if hits:
            patched += 1
            print(f"{f.name} -> {hits}")
    print(f"\nTotal chunk files patched: {patched}")


if __name__ == "__main__":
    main()
