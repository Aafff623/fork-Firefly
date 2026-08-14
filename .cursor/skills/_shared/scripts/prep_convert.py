#!/usr/bin/env python3
"""Fast mechanical Obsidian → Firefly post draft (no LLM).

Usage (from Firefly/):
  python .cursor/skills/_shared/scripts/prep_convert.py ^
    --note "D:/.../邪修 AI Coding 省钱.md" ^
    --slug ai-coding-save-money ^
    [--apply] [--draft false]

Default writes under .ob2blog/staging/<slug>/ then optionally --apply into src/content/posts/.
Emits report.json for agent review (embeds, missing assets, warnings).
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from vault_lib import (  # noqa: E402
    WIKI_EMBED_RE,
    ascii_asset_name,
    default_manifest_path,
    find_post_entry,
    firefly_root_from_here,
    load_manifest,
    resolve_vault_file,
    save_manifest,
    sha256_file,
    sha256_text,
    split_wiki_target,
    strip_frontmatter,
    vault_info_for_note,
)


def slugify_hint(title: str) -> str:
    # very light fallback; caller should pass --slug for Chinese titles
    s = title.strip().lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s or "untitled-post"


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="vault note mechanical prep into posts/ (resync only)")
    p.add_argument("--note", required=True, help="Obsidian note absolute path")
    p.add_argument("--slug", default="", help="english kebab-case slug")
    p.add_argument(
        "--apply",
        action="store_true",
        help="write into src/content/posts/<slug>/ (else only staging)",
    )
    p.add_argument("--draft", default="false", choices=("true", "false"))
    p.add_argument("--category", default="")
    p.add_argument("--tags", default="", help="comma-separated")
    p.add_argument("--title", default="", help="override title (default: filename)")
    p.add_argument(
        "--manifest",
        default="",
        help="manifest path (default Firefly/.ob2blog/manifest.json)",
    )
    return p.parse_args()


def main() -> int:
    # Windows 控制台常为 GBK；标题/路径含 emoji 时避免 print 炸
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8")
        except Exception:
            pass

    args = parse_args()
    note = Path(args.note).expanduser().resolve()
    if not note.is_file():
        print(f"ERROR: note not found: {note}", file=sys.stderr)
        return 2

    repo = firefly_root_from_here()
    vault = vault_info_for_note(note)
    title = args.title.strip() or note.stem
    slug = args.slug.strip() or slugify_hint(title)
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*(?:/[a-z0-9]+(?:-[a-z0-9]+)*)*", slug):
        print(
            f"ERROR: slug must be english kebab-case, got {slug!r}. Pass --slug.",
            file=sys.stderr,
        )
        return 2

    raw = note.read_text(encoding="utf-8")
    body = strip_frontmatter(raw).replace("\r\n", "\n").replace("\r", "\n")
    body = body.replace("\t", "  ")
    # drop leading H1 that duplicates filename title
    body = re.sub(rf"^#\s+{re.escape(title)}\s*$", "", body, count=1, flags=re.M)

    staging = repo / ".ob2blog" / "staging" / slug.replace("/", "__")
    if staging.exists():
        shutil.rmtree(staging)
    images_dir = staging / "images"
    images_dir.mkdir(parents=True)

    report = {
        "note": str(note),
        "vaultRoot": str(vault.root),
        "attachmentFolder": str(vault.attachment_folder) if vault.attachment_folder else None,
        "slug": slug,
        "title": title,
        "embeds": [],
        "missing": [],
        "warnings": [],
        "assetMap": {},
        "staging": str(staging),
        "applied": False,
    }

    embeds = list(WIKI_EMBED_RE.finditer(body))
    cover_rel = ""
    img_index = 0
    replacements: list[tuple[str, str]] = []

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

        role = "cover" if i == 0 else "inline"
        if role == "cover":
            name = ascii_asset_name(src, role="cover", index=0)
            dest = staging / name
            shutil.copy2(src, dest)
            cover_rel = f"./{name}"
            report["assetMap"][target] = cover_rel
            # remove cover embed from body
            replacements.append((m.group(0), ""))
        else:
            img_index += 1
            name = ascii_asset_name(src, role="inline", index=img_index)
            # avoid collision
            dest = images_dir / name
            if dest.exists():
                name = f"{dest.stem}-{img_index}{dest.suffix}"
                dest = images_dir / name
            shutil.copy2(src, dest)
            rel = f"./images/{name}"
            report["assetMap"][target] = rel
            alt = Path(target).stem
            # size intentionally dropped for Astro pipeline (see skill media-rules)
            if size:
                report["warnings"].append(
                    f"dropped Obsidian width {size} for {target}; using Markdown image"
                )
            replacements.append((m.group(0), f"![{alt}]({rel})"))

    new_body = body
    for old, new in replacements:
        new_body = new_body.replace(old, new, 1)

    # tidy blank lines after cover removal
    new_body = re.sub(r"\n{3,}", "\n\n", new_body).strip() + "\n"

    if WIKI_EMBED_RE.search(new_body):
        report["warnings"].append("wiki embeds remain after prep — agent must finish")

    tags = [t.strip() for t in args.tags.split(",") if t.strip()]
    if not tags:
        tags = ["Obsidian"]
    category = args.category.strip() or "未分类"
    description = ""
    # first non-empty non-heading line as description seed
    for line in new_body.splitlines():
        s = line.strip()
        if not s or s.startswith("#") or s.startswith("!") or s.startswith("<!--"):
            continue
        description = re.sub(r"[*_`]", "", s)[:120]
        break

    fm = "\n".join(
        [
            "---",
            f"title: {title}",
            f"published: {date.today().isoformat()}",
            f"description: {description}",
            f"image: {cover_rel or ''}",
            f"tags: [{', '.join(tags)}]",
            f"category: {category}",
            f"draft: {args.draft}",
            f"slug: {slug}",
            "pinned: false",
            "comment: true",
            "---",
            "",
        ]
    )
    index_text = fm + new_body
    (staging / "index.md").write_text(index_text, encoding="utf-8")
    (staging / "report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    # fingerprint note for sync baseline
    note_hash = sha256_file(note)
    report["noteSha256"] = note_hash
    report["stagingBodySha256"] = sha256_text(new_body)

    apply_dir: Path | None = None
    if args.apply:
        apply_dir = repo / "src" / "content" / "posts" / Path(slug)
        apply_dir.mkdir(parents=True, exist_ok=True)
        # copy staging contents
        for item in staging.iterdir():
            if item.name == "report.json":
                continue
            dest = apply_dir / item.name
            if item.is_dir():
                if dest.exists():
                    shutil.rmtree(dest)
                shutil.copytree(item, dest)
            else:
                shutil.copy2(item, dest)
        report["applied"] = True
        report["postPath"] = str(apply_dir / "index.md")
        (staging / "report.json").write_text(
            json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )

        # update manifest
        man_path = Path(args.manifest) if args.manifest else default_manifest_path(repo)
        man = load_manifest(man_path)
        if not man.get("vaultRoot"):
            man["vaultRoot"] = str(vault.root)
        entry = find_post_entry(man, slug=slug) or {}
        entry.update(
            {
                "slug": slug,
                "obsidianNote": str(note),
                "postPath": f"src/content/posts/{slug}/index.md",
                "title": title,
                "noteSha256": note_hash,
                "lastPrep": date.today().isoformat(),
                "assetMap": report["assetMap"],
            }
        )
        others = [p for p in man.get("posts") or [] if p.get("slug") != slug]
        others.append(entry)
        man["posts"] = sorted(others, key=lambda x: x.get("slug") or "")
        save_manifest(man_path, man)
        report["manifest"] = str(man_path)

    print(json.dumps(report, ensure_ascii=False, indent=2))
    if report["missing"]:
        print(
            f"WARN: {len(report['missing'])} missing embeds — see report.json",
            file=sys.stderr,
        )
        return 1
    print(f"OK staging={staging}", file=sys.stderr)
    if apply_dir:
        print(f"OK applied={apply_dir}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
