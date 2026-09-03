#!/usr/bin/env python3
"""Copy Knowledge assets into a post folder and webify local images.

Skips --from-assets copy when the post body/cover already uses
https://img.threetwoa.live URLs (pass --force-copy to override).

Usage (Firefly/):
  python .cursor/skills/knowledge-output/scripts/place_post.py \\
    --post src/content/posts/<slug>/index.md \\
    --from-assets "D:/OneDrive/Desktop/Knowledge/todo/.../assets"
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

MD_IMG_RE = re.compile(r"!\[([^\]]*)\]\(([^)\s]+)\)")
FM_IMAGE_RE = re.compile(r"^image:\s*['\"]?(\S+?)['\"]?\s*$", re.M)
ASCII_SAFE = re.compile(r"[^a-z0-9._-]+")
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".avif"}
DARK_BG = (26, 26, 32)
MAX_WIDTH_DEFAULT = 1600
R2_PREFIX = "https://img.threetwoa.live"


def ascii_name(name: str, used: set[str]) -> str:
    stem = Path(name).stem.lower()
    ext = Path(name).suffix.lower() or ".jpg"
    stem = ASCII_SAFE.sub("-", stem).strip("-") or "img"
    candidate = f"{stem}{ext}"
    n = 2
    while candidate.lower() in used:
        candidate = f"{stem}-{n}{ext}"
        n += 1
    used.add(candidate.lower())
    return candidate


def webify_one(src: Path, dest: Path, max_width: int) -> dict:
    try:
        from PIL import Image
    except ImportError:
        dest.parent.mkdir(parents=True, exist_ok=True)
        if src.resolve() != dest.resolve():
            dest.write_bytes(src.read_bytes())
        return {"path": str(dest), "note": "PIL missing; copied bytes only"}

    im = Image.open(src)
    if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info):
        rgba = im.convert("RGBA")
        bg = Image.new("RGBA", rgba.size, DARK_BG + (255,))
        im = Image.alpha_composite(bg, rgba).convert("RGB")
    else:
        im = im.convert("RGB")
    if im.width > max_width:
        h = round(im.height * max_width / im.width)
        resample = Image.Resampling.LANCZOS if hasattr(Image, "Resampling") else Image.LANCZOS
        im = im.resize((max_width, h), resample)
    dest = dest.with_suffix(".jpg")
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "JPEG", quality=85, optimize=True)
    return {"path": str(dest), "width": im.width, "height": im.height, "bytes": dest.stat().st_size}


def collect_image_urls(text: str) -> list[str]:
    urls = [m.group(2) for m in MD_IMG_RE.finditer(text)]
    fm = FM_IMAGE_RE.search(text)
    if fm:
        urls.append(fm.group(1).strip().strip("'\""))
    return urls


def body_already_on_r2(text: str) -> bool:
    """True when every markdown/cover image is already on img.threetwoa.live."""
    urls = collect_image_urls(text)
    if not urls:
        return False
    if any(not u.startswith("http") for u in urls):
        return False
    if any(u.startswith("http") and not u.startswith(R2_PREFIX) for u in urls):
        return False
    return all(u.startswith(R2_PREFIX) for u in urls)


def rewrite_refs(text: str, mapping: dict[str, str]) -> str:
    def repl(m: re.Match[str]) -> str:
        alt, url = m.group(1), m.group(2)
        mapped = mapping.get(url) or mapping.get(url.split("?")[0])
        if mapped:
            return f"![{alt}]({mapped})"
        return m.group(0)

    return MD_IMG_RE.sub(repl, text)


def main() -> int:
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    ap = argparse.ArgumentParser()
    ap.add_argument("--post", required=True, help="path to index.md")
    ap.add_argument("--from-assets", default="", help="Knowledge assets/ directory")
    ap.add_argument("--max-width", type=int, default=MAX_WIDTH_DEFAULT)
    ap.add_argument(
        "--force-copy",
        action="store_true",
        help="copy --from-assets even when the body already uses R2 URLs",
    )
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    post = Path(args.post)
    if not post.is_file():
        print(json.dumps({"ok": False, "error": f"missing {post}"}, ensure_ascii=False))
        return 2
    images_dir = post.parent / "images"
    actions: list[dict] = []
    mapping: dict[str, str] = {}
    used: set[str] = {p.name.lower() for p in images_dir.glob("*")} if images_dir.is_dir() else set()

    text_now = post.read_text(encoding="utf-8")
    skip_copy = (not args.force_copy) and body_already_on_r2(text_now)
    if skip_copy and args.from_assets:
        actions.append(
            {
                "skip_copy": True,
                "reason": "body/cover already on https://img.threetwoa.live; not copying assets into git",
            }
        )

    if args.from_assets and not skip_copy:
        src_dir = Path(args.from_assets)
        if not src_dir.is_dir():
            print(json.dumps({"ok": False, "error": f"assets not a dir: {src_dir}"}, ensure_ascii=False))
            return 2
        for src in sorted(src_dir.iterdir()):
            if not src.is_file() or src.suffix.lower() not in IMAGE_EXTS:
                continue
            name = ascii_name(src.name, used)
            dest = images_dir / Path(name).with_suffix(".jpg").name
            if args.dry_run:
                actions.append({"copy": str(src), "to": str(dest)})
                continue
            info = webify_one(src, dest, args.max_width)
            rel = f"./images/{Path(info['path']).name}"
            mapping[f"./images/{src.name}"] = rel
            mapping[src.name] = rel
            actions.append({"from": str(src), **info})

    local_imgs = list(images_dir.glob("*")) if images_dir.is_dir() else []
    for img in local_imgs:
        if img.suffix.lower() not in IMAGE_EXTS:
            continue
        if img.suffix.lower() == ".jpg" and img.stat().st_size <= 1_500_000:
            continue
        dest = img.with_suffix(".jpg")
        if args.dry_run:
            actions.append({"webify": str(img)})
            continue
        info = webify_one(img, dest, args.max_width)
        if img.resolve() != Path(info["path"]).resolve() and img.suffix.lower() != ".jpg":
            mapping[f"./images/{img.name}"] = f"./images/{Path(info['path']).name}"
            if not args.dry_run:
                try:
                    img.unlink()
                except OSError:
                    pass
        actions.append({"webify": str(img), **info})

    cover_candidates = list(post.parent.glob("cover.*"))
    for cover in cover_candidates:
        if cover.suffix.lower() in IMAGE_EXTS and cover.suffix.lower() != ".jpg":
            dest = post.parent / "cover.jpg"
            if not args.dry_run:
                info = webify_one(cover, dest, args.max_width)
                actions.append({"cover": str(cover), **info})
            else:
                actions.append({"cover": str(cover), "to": str(dest)})

    text = post.read_text(encoding="utf-8")
    new_text = rewrite_refs(text, mapping) if mapping else text
    if "image:" in new_text and "./cover.webp" in new_text:
        new_text = new_text.replace("./cover.webp", "./cover.jpg")
    changed = new_text != text
    if changed and not args.dry_run:
        post.write_text(new_text, encoding="utf-8", newline="\n")

    print(
        json.dumps(
            {"ok": True, "post": str(post), "rewrote": changed, "actions": actions},
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
