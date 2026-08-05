#!/usr/bin/env python3
"""Backfill author blurbs onto existing「发布了新笔记」dynamics.

Usage (Firefly/):
  python .cursor/skills/site-cascade/scripts/backfill_note_blurbs.py --dry-run
  python .cursor/skills/site-cascade/scripts/backfill_note_blurbs.py
  python .cursor/skills/site-cascade/scripts/backfill_note_blurbs.py --force
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

# Reuse helpers from cascade_check
sys.path.insert(0, str(Path(__file__).resolve().parent))
from cascade_check import (  # noqa: E402
    FM_RE,
    FALLBACK_BLURB,
    firefly_root,
    load_posts,
    normalize_blurb,
    parse_fm,
)

NOTE_RE = re.compile(
    r"发布了新笔记：\s*\[([^\]]+)\]\((/posts/([^/)\s]+)/?)\)",
)
HAS_QUOTE_RE = re.compile(r"(?m)^>\s+\S")
QUOTE_BLOCK_RE = re.compile(r"(?ms)(?:^>\s?.*(?:\n|$))+")


def body_after_fm(text: str) -> str:
    return FM_RE.sub("", text, count=1).strip()


def posts_by_slug(repo: Path) -> dict[str, dict]:
    out: dict[str, dict] = {}
    for p in load_posts(repo):
        slug = (p.get("slug") or "").strip("/")
        if slug:
            out[slug] = p
    return out


def blurb_for(post: dict | None, title: str) -> str:
    if post:
        desc = (post.get("description") or "").strip()
        if desc:
            return normalize_blurb(desc)
    if title.strip():
        return normalize_blurb(f"关于「{title.strip()}」的一点记录。")
    return FALLBACK_BLURB


def rebuild_text(text: str, new_body: str) -> str:
    fm = parse_fm(text)
    published = fm.get("published") or ""
    fm_lines = ["---"]
    if published:
        fm_lines.append(f"published: {published}")
    for k, v in fm.items():
        if k == "published":
            continue
        fm_lines.append(f"{k}: {v}")
    fm_lines.append("---")
    return "\n".join(fm_lines) + "\n\n" + new_body


def process_file(
    path: Path, by_slug: dict[str, dict], dry_run: bool, force: bool
) -> str | None:
    text = path.read_text(encoding="utf-8")
    body = body_after_fm(text)
    if "发布了新笔记" not in body:
        return None
    m = NOTE_RE.search(body)
    if not m:
        return "skip-no-link"
    title = m.group(1).strip()
    slug = m.group(3).strip().strip("/")
    post = by_slug.get(slug)
    note = blurb_for(post, title)

    has_quote = bool(HAS_QUOTE_RE.search(body))
    if has_quote and not force:
        return "skip-has-blurb"

    if has_quote and force:
        # Keep headline + non-quote lines; replace quote blocks with one blurb
        without_quotes = QUOTE_BLOCK_RE.sub("", body).strip()
        lines = [ln.rstrip() for ln in without_quotes.splitlines()]
        while lines and not lines[-1].strip():
            lines.pop()
        new_body = "\n".join(lines) + f"\n\n> {note}\n"
        action = "force-rewrite"
    else:
        lines = [ln.rstrip() for ln in body.splitlines()]
        while lines and not lines[-1].strip():
            lines.pop()
        new_body = "\n".join(lines) + f"\n\n> {note}\n"
        action = "wrote"

    if dry_run:
        return f"would-{action} blurb={note!r}"
    path.write_text(rebuild_text(text, new_body), encoding="utf-8", newline="\n")
    return f"{action} blurb={note!r}"


def main() -> int:
    ap = argparse.ArgumentParser(description="Backfill note blurbs on dynamics")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument(
        "--force",
        action="store_true",
        help="rewrite existing > blurbs with full post description",
    )
    args = ap.parse_args()

    repo = firefly_root()
    dyn_dir = repo / "src" / "content" / "dynamic"
    if not dyn_dir.is_dir():
        print("ERROR: dynamic dir missing", file=sys.stderr)
        return 2

    by_slug = posts_by_slug(repo)
    changed = 0
    skipped = 0
    for path in sorted(dyn_dir.glob("*.md")):
        result = process_file(path, by_slug, args.dry_run, args.force)
        if result is None:
            continue
        rel = path.relative_to(repo).as_posix()
        if result.startswith("wrote") or result.startswith("force") or result.startswith(
            "would-"
        ):
            changed += 1
            print(f"{rel}: {result}")
        else:
            skipped += 1
            print(f"{rel}: {result}", file=sys.stderr)

    mode = "dry-run" if args.dry_run else "apply"
    force = " force" if args.force else ""
    print(
        f"backfill ({mode}{force}): changed={changed} skipped={skipped}",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
