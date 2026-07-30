"""Capture showcase screenshots from local Firefly blog (Playwright)."""
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:4321"
OUT = Path(__file__).resolve().parent.parent / "assets" / "images" / "readme"
OUT.mkdir(parents=True, exist_ok=True)

SHOTS = [
    ("showcase-home.png", "/"),
    ("showcase-post.png", "/posts/guide/firefly-layout-system/"),
    ("showcase-dynamic.png", "/dynamic/"),
    ("showcase-archive.png", "/archive/"),
    ("showcase-about.png", "/about/"),
    ("showcase-gallery.png", "/gallery/"),
]


def main() -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        for name, path in SHOTS:
            url = BASE + path
            print(f"goto {url}")
            page.goto(url, wait_until="networkidle", timeout=120_000)
            page.wait_for_timeout(1500)
            dest = OUT / name
            page.screenshot(path=str(dest), full_page=False)
            print(f"wrote {dest} ({dest.stat().st_size} bytes)")
        browser.close()


if __name__ == "__main__":
    main()
