#!/usr/bin/env python3
"""Check Obsidian note ↔ Firefly post consistency via manifest.

Usage (from Firefly/):
  python .cursor/skills/ob2blog/scripts/sync_check.py
  python .cursor/skills/ob2blog/scripts/sync_check.py --slug ai-coding-save-money
  python .cursor/skills/ob2blog/scripts/sync_check.py --watch 5

Exit codes:
  0 = all in sync (or only soft warnings)
  1 = drift / missing side
  2 = usage / manifest error
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

# ensure sibling import
sys.path.insert(0, str(Path(__file__).resolve().parent))

from ob2blog_lib import (  # noqa: E402
    default_manifest_path,
    firefly_root_from_here,
    load_manifest,
    normalize_for_fingerprint,
    sha256_file,
    sha256_text,
)


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="ob2blog sync check")
    p.add_argument("--manifest", default="", help="path to manifest.json")
    p.add_argument("--slug", default="", help="check one slug only")
    p.add_argument(
        "--watch",
        type=float,
        default=0,
        help="seconds between re-checks (0 = once)",
    )
    p.add_argument("--json", action="store_true", help="machine-readable summary")
    return p.parse_args()


def check_one(repo: Path, entry: dict) -> dict:
    slug = entry.get("slug") or ""
    note = Path(entry.get("obsidianNote") or "")
    post_rel = entry.get("postPath") or f"src/content/posts/{slug}/index.md"
    post = repo / post_rel

    result = {
        "slug": slug,
        "status": "ok",
        "issues": [],
        "note": str(note),
        "post": str(post),
        "noteExists": note.is_file(),
        "postExists": post.is_file(),
        "noteSha256": None,
        "postBodyFp": None,
        "noteBodyFp": None,
        "fingerprintMatch": None,
        "noteFileChanged": None,
    }

    if not note.is_file():
        result["status"] = "error"
        result["issues"].append("obsidian note missing")
    if not post.is_file():
        result["status"] = "error"
        result["issues"].append("blog post missing")
    if result["status"] == "error":
        return result

    note_text = note.read_text(encoding="utf-8")
    post_text = post.read_text(encoding="utf-8")
    note_fp = sha256_text(normalize_for_fingerprint(note_text, is_blog=False))
    post_fp = sha256_text(normalize_for_fingerprint(post_text, is_blog=True))
    note_sha = sha256_file(note)

    result["noteSha256"] = note_sha
    result["noteBodyFp"] = note_fp
    result["postBodyFp"] = post_fp
    result["fingerprintMatch"] = note_fp == post_fp

    recorded = entry.get("noteSha256")
    if recorded:
        result["noteFileChanged"] = note_sha != recorded
        if result["noteFileChanged"]:
            result["issues"].append("obsidian file hash differs from manifest.noteSha256")

    if not result["fingerprintMatch"]:
        result["issues"].append(
            "normalized body fingerprint mismatch (OB vs blog) — content drifted"
        )

    # asset presence from assetMap
    asset_map = entry.get("assetMap") or {}
    post_dir = post.parent
    for src_name, rel in asset_map.items():
        if not rel:
            continue
        # cover embed may only live in FM; skip empty body refs
        if rel.startswith("./"):
            ap = (post_dir / rel).resolve()
            if not ap.is_file():
                result["issues"].append(f"mapped asset missing: {rel} (from {src_name})")

    if result["issues"]:
        result["status"] = "drift"
    return result


def run_once(repo: Path, manifest_path: Path, slug: str) -> tuple[int, dict]:
    if not manifest_path.is_file():
        summary = {
            "error": f"manifest not found: {manifest_path}",
            "hint": "run prep_convert.py --apply once to create it",
        }
        return 2, summary

    man = load_manifest(manifest_path)
    posts = man.get("posts") or []
    if slug:
        posts = [p for p in posts if p.get("slug") == slug]
        if not posts:
            return 2, {"error": f"slug not in manifest: {slug}"}

    results = [check_one(repo, p) for p in posts]
    drifted = [r for r in results if r["status"] != "ok"]
    summary = {
        "manifest": str(manifest_path),
        "checked": len(results),
        "ok": len(results) - len(drifted),
        "drift": len(drifted),
        "results": results,
    }
    code = 1 if drifted else 0
    return code, summary


def main() -> int:
    args = parse_args()
    repo = firefly_root_from_here()
    man_path = Path(args.manifest) if args.manifest else default_manifest_path(repo)

    def emit(code: int, summary: dict) -> int:
        if args.json:
            print(json.dumps(summary, ensure_ascii=False, indent=2))
        else:
            if "error" in summary:
                print(f"ERROR: {summary['error']}")
                if summary.get("hint"):
                    print(f"HINT: {summary['hint']}")
                return code
            print(
                f"sync_check: {summary['ok']}/{summary['checked']} ok, "
                f"{summary['drift']} drift  ({summary['manifest']})"
            )
            for r in summary["results"]:
                mark = "OK" if r["status"] == "ok" else r["status"].upper()
                print(f"  [{mark}] {r['slug']}")
                for issue in r["issues"]:
                    print(f"       - {issue}")
                if r["status"] == "ok":
                    print("       fingerprints match")
        return code

    if args.watch and args.watch > 0:
        print(f"watching every {args.watch}s — Ctrl+C to stop", file=sys.stderr)
        try:
            while True:
                code, summary = run_once(repo, man_path, args.slug)
                emit(code, summary)
                time.sleep(args.watch)
        except KeyboardInterrupt:
            print("\nstopped", file=sys.stderr)
            return 0
    code, summary = run_once(repo, man_path, args.slug)
    return emit(code, summary)


if __name__ == "__main__":
    raise SystemExit(main())
