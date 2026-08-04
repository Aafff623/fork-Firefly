"""Capture showcase screenshots from local Firefly blog (Playwright).

前置：`pnpm dev` 已在 http://localhost:4321 跑着（本机多为 [::1]）。
用法：完整路径调用 python，例如：
`& "$env:LOCALAPPDATA\Programs\Python\Python313\python.exe" scripts\capture-readme-showcase.py`
"""
from __future__ import annotations

from pathlib import Path

from playwright.sync_api import sync_playwright

# Astro 在本机常只监听 [::1]；127.0.0.1 会连不上
BASE = "http://localhost:4321"
OUT = Path(__file__).resolve().parent.parent / "assets" / "images" / "readme"
OUT.mkdir(parents=True, exist_ok=True)

# name, path, localStorage extras, scroll_into_view selector (可选)
SHOTS: list[tuple[str, str, dict[str, str] | None, str | None]] = [
    ("showcase-home.png", "/", {"postListLayout": "list"}, None),
    # 滚过英雄横幅，露出正文 + Index-First TOC
    (
        "showcase-post.png",
        "/posts/claude-code-windows-beautify/",
        None,
        "#post-container",
    ),
    ("showcase-dynamic.png", "/dynamic/", None, None),
    ("showcase-archive.png", "/archive/", None, None),
    ("showcase-about.png", "/about/", None, "main, #post-container, .custom-md"),
    ("showcase-gallery.png", "/gallery/", None, None),
]

HIDE_CSS = """
.sprite-pet-root,
#pio-container,
.pio-container {
  display: none !important;
  visibility: hidden !important;
}
"""


def main() -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            color_scheme="light",
            device_scale_factor=1,
        )
        page = context.new_page()

        # 先建立同源，便于写 localStorage
        page.goto(BASE + "/", wait_until="domcontentloaded", timeout=120_000)

        for name, path, storage, scroll_sel in SHOTS:
            pairs = {"theme": "light", **(storage or {})}
            page.evaluate(
                """(pairs) => {
                  try {
                    localStorage.clear();
                    for (const [k, v] of Object.entries(pairs)) {
                      localStorage.setItem(k, v);
                    }
                  } catch (_) {}
                }""",
                pairs,
            )
            url = BASE + path
            print(f"goto {url} storage={pairs}")
            page.goto(url, wait_until="networkidle", timeout=120_000)
            page.add_style_tag(content=HIDE_CSS)
            page.wait_for_selector("#main-grid, main, .custom-md", timeout=30_000)
            if scroll_sel:
                page.evaluate(
                    """(sel) => {
                      const el = document.querySelector(sel);
                      if (el) el.scrollIntoView({ block: 'start', behavior: 'instant' });
                      // 再略上移，让侧栏 TOC / 正文标题同框
                      window.scrollBy(0, -72);
                    }""",
                    scroll_sel,
                )
            page.wait_for_timeout(2200)
            dest = OUT / name
            page.screenshot(path=str(dest), full_page=False)
            print(f"wrote {dest} ({dest.stat().st_size} bytes)")

        browser.close()


if __name__ == "__main__":
    main()
