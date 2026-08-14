#!/usr/bin/env python3
"""Resolve Obsidian wiki embeds into a Knowledge piece directory (no posts/).

Usage (from Firefly/):
  python .cursor/skills/knowledge-extract/scripts/extract_vault.py ^
    --note "D:/OneDrive/Desktop/Notes/threetwoa_ob/.../note.md" ^
    --out "D:/OneDrive/Desktop/Knowledge/todo/{Theme}/{facet}/2026-08-14_短题"
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
from datetime import date
from pathlib import Path

SHARED = Path(__file__).resolve().parents[2] / "_shared" / "scripts"
sys.path.insert(0, str(SHARED))

from vault_lib import (  # noqa: E402
    WIKI_EMBED_RE,
    ascii_asset_name,
    default_manifest_path,
    find_post_entry,
    firefly_root_from_here,
    load_manifest,
    resolve_vault_file,
    sha256_file,
    split_wiki_target,
    strip_frontmatter,
    vault_info_for_note,
)


def main() -> int:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8")
        except Exception:
            pass

    p = argparse.ArgumentParser(description="Obsidian note → Knowledge assets (wiki resolved)")
    p.add_argument("--note", required=True)
    p.add_argument("--out", required=True)
    p.add_argument("--title", default="")
    p.add_argument("--force", action="store_true")
    args = p.parse_args()

    note = Path(args.note).expanduser().resolve()
    if not note.is_file():
        print(f"ERROR: note not found: {note}", file=sys.stderr)
        return 2

    out = Path(args.out).expanduser().resolve()
    out.mkdir(parents=True, exist_ok=True)
    assets = out / "assets"
    assets.mkdir(exist_ok=True)

    vault = vault_info_for_note(note)
    title = args.title.strip() or note.stem
    md_path = out / f"{title}.md"
    if md_path.exists() and not args.force:
        print(f"ERROR: {md_path} exists (pass --force to overwrite)", file=sys.stderr)
        return 2

    raw = note.read_text(encoding="utf-8")
    body = strip_frontmatter(raw).replace("\r\n", "\n").replace("\r", "\n")
    body = body.replace("\t", "  ")
    body = re.sub(rf"^#\s+{re.escape(title)}\s*$", "", body, count=1, flags=re.M)

    report = {
        "note": str(note),
        "vaultRoot": str(vault.root),
        "attachmentFolder": str(vault.attachment_folder) if vault.attachment_folder else None,
        "out": str(out),
        "title": title,
        "embeds": [],
        "missing": [],
        "warnings": [],
        "assetMap": {},
        "cover": None,
        "mappedSlug": None,
    }

    repo = firefly_root_from_here()
    man = load_manifest(default_manifest_path(repo))
    mapped = find_post_entry(man, note=str(note))
    if mapped:
        report["mappedSlug"] = mapped.get("slug")
        report["warnings"].append(
            f"already mapped to slug {mapped.get('slug')}; run sync_check.py before re-publishing"
        )

    embeds = list(WIKI_EMBED_RE.finditer(body))
    img_index = 0
    replacements: list[tuple[str, str]] = []
    used_names: set[str] = set()

    for i, m in enumerate(embeds):
        raw_inner = m.group(1)
        target, size = split_wiki_target(raw_inner)
        src = resolve_vault_file(vault, target, note.parent)
        entry = {
            "raw": m.group(0),
            "target": target,
            "size": size,
            "resolved": str(src) if src else None,
            "role": "cover" if i == 0 else "inline",
        }
        report["embeds"].append(entry)
        if src is None:
            report["missing"].append(target)
            replacements.append((m.group(0), f"<!-- TODO missing embed: {target} -->"))
            continue

        img_index += 1
        name = ascii_asset_name(src, role="inline", index=img_index)
        dest = assets / name
        if name.lower() in used_names or dest.exists():
            name = f"{dest.stem}-{img_index}{dest.suffix}"
            dest = assets / name
        used_names.add(name.lower())
        shutil.copy2(src, dest)
        rel = f"./assets/{name}"
        report["assetMap"][target] = rel
        if i == 0:
            report["cover"] = rel
        alt = Path(target).stem
        if size:
            report["warnings"].append(
                f"dropped Obsidian width {size} for {target}; using Markdown image"
            )
        replacements.append((m.group(0), f"![{alt}]({rel})"))

    new_body = body
    for old, new in replacements:
        new_body = new_body.replace(old, new, 1)
    new_body = re.sub(r"\n{3,}", "\n\n", new_body).strip() + "\n"

    if WIKI_EMBED_RE.search(new_body):
        report["warnings"].append("wiki embeds remain after extract_vault — agent must finish")

    yaml = "\n".join(
        [
            "---",
            "source: obsidian",
            "theme: ",
            "facet: ",
            f"origin_title: {title}",
            "origin_url: \"\"",
            f"origin_path: {note.as_posix()}",
            f"extracted: {date.today().isoformat()}",
            "dedupe: none",
            "---",
            "",
        ]
    )
    md_path.write_text(yaml + new_body, encoding="utf-8")
    report["md"] = str(md_path)
    report["noteSha256"] = sha256_file(note)

    (out / "extract_vault_report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if report["missing"]:
        print(
            f"WARN: {len(report['missing'])} missing embeds — see extract_vault_report.json",
            file=sys.stderr,
        )
        return 1
    print(f"OK md={md_path}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
