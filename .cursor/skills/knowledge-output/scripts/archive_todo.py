#!/usr/bin/env python3
"""Move one Knowledge/todo piece directory to Archive, keeping Theme/facet.

Usage:
  python .cursor/skills/knowledge-output/scripts/archive_todo.py \\
    --todo "D:/OneDrive/Desktop/Knowledge/todo/claude-code/skill/2026-08-14_foo"
"""

from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path

KNOWLEDGE = Path(r"D:\OneDrive\Desktop\Knowledge")


def main() -> int:
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    ap = argparse.ArgumentParser()
    ap.add_argument("--todo", required=True, help="absolute path of one todo piece dir")
    ap.add_argument("--knowledge", default=str(KNOWLEDGE))
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    src = Path(args.todo).resolve()
    root = Path(args.knowledge).resolve()
    todo_root = (root / "todo").resolve()
    archive_root = (root / "Archive").resolve()

    if not src.is_dir():
        print(json.dumps({"ok": False, "error": f"not a directory: {src}"}, ensure_ascii=False))
        return 2
    try:
        rel = src.relative_to(todo_root)
    except ValueError:
        print(
            json.dumps(
                {"ok": False, "error": f"{src} is not under {todo_root}"},
                ensure_ascii=False,
            )
        )
        return 2
    dest = archive_root / rel
    if dest.exists():
        print(
            json.dumps(
                {"ok": False, "error": f"archive already has {dest}"},
                ensure_ascii=False,
            )
        )
        return 1
    if args.dry_run:
        print(json.dumps({"ok": True, "dryRun": True, "from": str(src), "to": str(dest)}, ensure_ascii=False))
        return 0
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(src), str(dest))
    print(json.dumps({"ok": True, "from": str(src), "to": str(dest)}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
