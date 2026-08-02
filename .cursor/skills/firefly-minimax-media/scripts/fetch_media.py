#!/usr/bin/env python3
"""Download a MiniMax (or other) media URL to a local path.

MCP tools often return a signed CDN URL even when `output_directory` is set.
Call this immediately after generation — URLs expire (~1 day).

Examples:
  python fetch_media.py --url "https://..." --out public/media/minimax/video/x.mp4
  python fetch_media.py --url "https://..." --out cover.jpg --force
"""

from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)


def download(url: str, out: Path, timeout: float, force: bool) -> dict:
    out = out.resolve()
    if out.exists() and not force:
        return {
            "ok": True,
            "skipped": True,
            "path": str(out),
            "bytes": out.stat().st_size,
            "reason": "exists (pass --force to overwrite)",
        }

    out.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = resp.read()
            status = getattr(resp, "status", 200)
    except urllib.error.HTTPError as exc:
        return {"ok": False, "error": f"HTTP {exc.code}", "url": url[:120]}
    except Exception as exc:  # noqa: BLE001
        return {"ok": False, "error": str(exc), "url": url[:120]}

    if not data:
        return {"ok": False, "error": "empty body", "url": url[:120]}

    out.write_bytes(data)
    return {
        "ok": True,
        "skipped": False,
        "path": str(out),
        "bytes": len(data),
        "http_status": status,
    }


def main() -> int:
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

    p = argparse.ArgumentParser(description="Fetch MiniMax media URL to disk")
    p.add_argument("--url", required=True)
    p.add_argument("--out", required=True, help="local output file path")
    p.add_argument("--timeout", type=float, default=120.0)
    p.add_argument("--force", action="store_true")
    args = p.parse_args()

    result = download(args.url, Path(args.out), args.timeout, args.force)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result.get("ok") else 1


if __name__ == "__main__":
    sys.exit(main())
