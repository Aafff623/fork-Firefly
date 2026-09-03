#!/usr/bin/env python3
"""Append a pointer to tta-tone voice/ledger.md. Does not rewrite lexicon.md."""

from __future__ import annotations

import argparse
from datetime import date
from pathlib import Path

VOICE_DIR = Path(
    r"D:\OneDrive\Desktop\tta\tta-tone\skills\tta-tone\references\voice"
)
LEDGER = VOICE_DIR / "ledger.md"


def already_logged(text: str, pointer: str) -> bool:
    needle = pointer.strip()
    return any(needle and needle in line for line in text.splitlines())


def append_row(pointer: str, day: str, scope: str) -> str:
    LEDGER.parent.mkdir(parents=True, exist_ok=True)
    if LEDGER.exists():
        text = LEDGER.read_text(encoding="utf-8")
    else:
        text = "# 成稿台账\n\n只记指针。全文在 vault 或站点里，不要往 Skill 里粘。\n\n| 日期 | 指针 | 抽过 |\n| --- | --- | --- |\n"
    if already_logged(text, pointer):
        return "skip-existing"
    note = scope.strip() if scope.strip() else "默认整篇"
    if not text.endswith("\n"):
        text += "\n"
    text += f"| {day} | `{pointer}` | {note} |\n"
    LEDGER.write_text(text, encoding="utf-8")
    return "appended"


def main() -> int:
    parser = argparse.ArgumentParser(description="Append tta-tone voice ledger pointer.")
    parser.add_argument("--pointer", required=True, help="vault path or posts/<slug>")
    parser.add_argument("--date", default=date.today().isoformat())
    parser.add_argument("--scope", default="", help="section or terms if user named them")
    args = parser.parse_args()
    if not VOICE_DIR.is_dir():
        print(f"FAIL  voice dir missing: {VOICE_DIR}")
        return 1
    result = append_row(args.pointer.strip(), args.date, args.scope)
    print(f"{result}  {LEDGER}")
    print("next  update lexicon.md from the ideal note; do not paste the full article")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
