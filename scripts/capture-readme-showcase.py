r"""Capture showcase screenshots for the README (Playwright).

默认截线上站；要对照本地 dev 就设 BASE 环境变量：
`SHOWCASE_BASE=http://127.0.0.1:4321 python scripts/capture-readme-showcase.py`
（本地需要 `pnpm dev` 已在跑。）

用法（Git Bash / PowerShell 均可，用完整路径调 python）：
`python scripts/capture-readme-showcase.py`

取景原则：每页滚动到功能主体（文章列表 / 正文 / 动态流 / 年分组 / profile / 相册卡）再截，
不让首页壁纸横幅占满画幅；统一 1920x1080、light 主题、隐藏桌宠与 toast。
"""
from __future__ import annotations

import os
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = os.environ.get("SHOWCASE_BASE", "https://www.threetwoa.live")
OUT = Path(__file__).resolve().parent.parent / "assets" / "images" / "readme"
OUT.mkdir(parents=True, exist_ok=True)

# name, path, localStorage extras, 滚动目标（选择器回退链）
SHOTS: list[tuple[str, str, dict[str, str] | None, list[str]]] = [
    (
        "showcase-home.png",
        "/",
        {"postListLayout": "list"},
        ["#post-list-container", "#post-list", ".post-list-container"],
    ),
    (
        "showcase-post.png",
        "/posts/claude-code-handbook/",
        None,
        ["#post-container", "#post-content", "main article"],
    ),
    (
        "showcase-dynamic.png",
        "/dynamic/",
        None,
        [".dynamic-entry-header", ".dynamic-page"],
    ),
    (
        "showcase-timeline.png",
        "/timeline/",
        None,
        [".archive-year-block", "#archive-list"],
    ),
    (
        "showcase-about.png",
        "/about/",
        None,
        [".gh-profile", "main"],
    ),
    (
        "showcase-gallery.png",
        "/gallery/",
        None,
        [".gallery-categories", ".gallery-home-masonry"],
    ),
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
        # playwright 自带 chromium 缺失时回退系统 Edge，免下 150MB
        try:
            browser = p.chromium.launch(headless=True)
        except Exception:
            browser = p.chromium.launch(headless=True, channel="msedge")
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            color_scheme="light",
            device_scale_factor=1,
        )
        page = context.new_page()

        # 先建立同源，便于写 localStorage
        page.goto(BASE + "/", wait_until="domcontentloaded", timeout=120_000)

        for name, path, storage, sels in SHOTS:
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
            # 线上页面有持续网络活动，networkidle 会假超时；用 domcontentloaded + 固定等待
            page.goto(url, wait_until="domcontentloaded", timeout=120_000)
            page.add_style_tag(content=HIDE_CSS)
            page.wait_for_selector("#main-grid, main, .custom-md", timeout=45_000)
            # Astro / Vite 错误浮层：截到即失败，避免再写入坏图
            err_probe = page.evaluate(
                """() => {
                  const body = document.body?.innerText || "";
                  if (
                    body.includes("window.matchMedia is not a function") ||
                    body.includes("Browser APIs are not available on the server")
                  ) {
                    return "ssr-window-api";
                  }
                  const ov = document.querySelector("vite-error-overlay");
                  if (ov && ov.getBoundingClientRect().width > 0) {
                    return "vite-error-overlay";
                  }
                  return null;
                }"""
            )
            if err_probe:
                raise RuntimeError(f"error page on {url}: {err_probe}")
            page.wait_for_timeout(3500)
            hit = page.evaluate(
                """(sels) => {
                for (const s of sels) {
                  const el = document.querySelector(s);
                  if (el) {
                    el.scrollIntoView({ block: 'start', behavior: 'instant' });
                    // 再略上移，让吸顶导航与内容同框
                    window.scrollBy(0, -76);
                    return s;
                  }
                }
                return null;
              }""",
                sels,
            )
            if hit is None:
                raise RuntimeError(f"no scroll target matched on {url}: {sels}")
            page.wait_for_timeout(2500)
            dest = OUT / name
            page.screenshot(path=str(dest), full_page=False)
            print(f"wrote {dest} ({dest.stat().st_size} bytes) scroll-hit={hit}")

        browser.close()


if __name__ == "__main__":
    main()
