r"""Capture showcase screenshots from local Firefly blog (Playwright).

前置：`pnpm dev` 已在 http://127.0.0.1:4321 跑着。
用法：完整路径调用 python，例如：
`& "$env:LOCALAPPDATA\Programs\Python\Python313\python.exe" scripts\capture-readme-showcase.py`
"""
from __future__ import annotations

from pathlib import Path

from playwright.sync_api import sync_playwright

# 优先 127.0.0.1（pnpm dev --host 127.0.0.1）；本机偶发只绑 [::1] 时再改 BASE
BASE = "http://127.0.0.1:4321"
OUT = Path(__file__).resolve().parent.parent / "assets" / "images" / "readme"
OUT.mkdir(parents=True, exist_ok=True)

# name, path, localStorage extras, scroll_into_view selector, ready selector (可选)
# theme-time-beijing-v1=1：阻止 Layout 把 light 覆盖回 time（夜间会变成暗色）
SHOTS: list[tuple[str, str, dict[str, str] | None, str | None, str | None]] = [
    (
        "showcase-home.png",
        "/",
        {"postListLayout": "list"},
        None,
        "#main-grid",
    ),
    # 滚过英雄横幅，露出正文 + Index-First TOC
    (
        "showcase-post.png",
        "/posts/claude-code-windows-beautify/",
        None,
        "#post-container",
        "#post-container",
    ),
    (
        "showcase-dynamic.png",
        "/dynamic/",
        None,
        None,
        ".dynamic-page .ff-tl-panel, .dynamic-page .dynamic-entry-header",
    ),
    ("showcase-timeline.png", "/timeline/", None, None, "#main-grid, main"),
    (
        "showcase-about.png",
        "/about/",
        None,
        "main, #post-container, .custom-md",
        "main, #post-container, .custom-md",
    ),
    ("showcase-gallery.png", "/gallery/", None, None, "#main-grid, main"),
]

HIDE_CSS = """
.sprite-pet-root,
#pio-container,
.pio-container,
#gift-surprise-toast,
.gift-surprise-toast {
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

        for name, path, storage, scroll_sel, ready_sel in SHOTS:
            pairs = {
                "theme": "light",
                "theme-time-beijing-v1": "1",
                **(storage or {}),
            }
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
            if ready_sel:
                page.wait_for_selector(ready_sel, timeout=45_000)
            # Astro / Vite 错误浮层：截到即失败，避免再写入坏图
            err_probe = page.evaluate(
                """() => {
                  const overlay = document.querySelector(
                    "vite-error-overlay, astro-dev-toolbar-window"
                  );
                  const body = document.body?.innerText || "";
                  if (
                    body.includes("window.matchMedia is not a function") ||
                    body.includes("Browser APIs are not available on the server")
                  ) {
                    return "ssr-window-api";
                  }
                  if (document.querySelector("vite-error-overlay")) {
                    return "vite-error-overlay";
                  }
                  return null;
                }"""
            )
            if err_probe:
                raise RuntimeError(f"error page on {url}: {err_probe}")
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
