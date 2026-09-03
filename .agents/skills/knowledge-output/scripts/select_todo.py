#!/usr/bin/env python3
"""List / match Knowledge/todo piece directories.

No query → all pieces, sliced into batches (--limit default 3).
A query matches Theme / facet / 短题 / directory substring, then the same batch slice.
--all lists the full inventory (no slice); the agent still processes in batches.

Usage (Firefly/):
  python .cursor/skills/knowledge-output/scripts/select_todo.py
  python .cursor/skills/knowledge-output/scripts/select_todo.py --offset 3
  python .cursor/skills/knowledge-output/scripts/select_todo.py claude-code
  python .cursor/skills/knowledge-output/scripts/select_todo.py --all
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

DEFAULT_TODO = Path(r"D:\OneDrive\Desktop\Knowledge\todo")
SKIP_DIR_NAMES = {"assets", "source", "sources", "images", "translations"}
PIECE_NAME_RE = re.compile(r"^(\d{4}-\d{2}-\d{2}|\d{8})_")
DEFAULT_LIMIT = 3


def piece_dirs(todo_root: Path) -> list[Path]:
    if not todo_root.is_dir():
        return []
    found: list[Path] = []
    for md in todo_root.rglob("*.md"):
        if md.name.lower() == "readme.md":
            continue
        parent = md.parent
        if parent == todo_root:
            continue
        rel_parts = parent.relative_to(todo_root).parts
        if any(p.lower() in SKIP_DIR_NAMES for p in rel_parts):
            continue
        if not PIECE_NAME_RE.match(parent.name):
            continue
        if parent not in found:
            found.append(parent)
    found.sort(key=lambda p: str(p).lower())
    return found


def matches(query: str, path: Path, todo_root: Path) -> bool:
    q = query.strip().lower()
    if not q:
        return False
    rel = path.relative_to(todo_root).as_posix().lower()
    return q in rel or q in path.name.lower()


def slice_batch(picked: list[Path], offset: int, limit: int) -> list[Path]:
    if offset < 0:
        offset = 0
    if limit <= 0:
        return picked[offset:]
    return picked[offset : offset + limit]


def main() -> int:
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    ap = argparse.ArgumentParser()
    ap.add_argument("query", nargs="*", help="Theme / facet / 短题 / 目录名子串；省略则扫全部 todo")
    ap.add_argument("--all", action="store_true", help="list every matching piece (no batch slice)")
    ap.add_argument("--limit", type=int, default=DEFAULT_LIMIT, help="batch size; 0 = no slice")
    ap.add_argument("--offset", type=int, default=0)
    ap.add_argument("--todo", default=str(DEFAULT_TODO))
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    todo_root = Path(args.todo)
    pieces = piece_dirs(todo_root)
    if not pieces:
        print(json.dumps({"ok": False, "error": f"no pieces under {todo_root}"}, ensure_ascii=False))
        return 2

    if args.query:
        picked: list[Path] = []
        for q in args.query:
            for p in pieces:
                if matches(q, p, todo_root) and p not in picked:
                    picked.append(p)
        if not picked:
            listing = [p.relative_to(todo_root).as_posix() for p in pieces]
            print(
                json.dumps(
                    {
                        "ok": False,
                        "error": f"no match for {args.query!r}",
                        "available": listing,
                    },
                    ensure_ascii=False,
                    indent=2,
                )
            )
            return 1
        mode = "query"
    else:
        picked = pieces
        mode = "all-todos"

    total = len(picked)
    if args.all:
        sliced = picked
        limit_used = 0
        offset_used = 0
    else:
        offset_used = max(0, args.offset)
        limit_used = args.limit
        sliced = slice_batch(picked, offset_used, limit_used)

    remaining = max(0, total - (offset_used + len(sliced)))
    next_offset = offset_used + len(sliced) if remaining else None

    rows = []
    for p in sliced:
        mds = sorted(x.name for x in p.glob("*.md") if x.name.lower() != "readme.md")
        rows.append(
            {
                "dir": str(p),
                "rel": p.relative_to(todo_root).as_posix(),
                "markdown": mds,
            }
        )
    print(
        json.dumps(
            {
                "ok": True,
                "mode": mode,
                "total": total,
                "count": len(rows),
                "limit": limit_used,
                "offset": offset_used,
                "remaining": remaining,
                "next_offset": next_offset,
                "pieces": rows,
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
