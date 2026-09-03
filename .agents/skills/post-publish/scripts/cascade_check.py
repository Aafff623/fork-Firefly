#!/usr/bin/env python3
"""Cascade-check homepage/sidebar indices after content changes.

Usage (Firefly/):
  python .agents/skills/post-publish/scripts/cascade_check.py
  python .agents/skills/post-publish/scripts/cascade_check.py --slug ai-coding-save-money
  python .agents/skills/post-publish/scripts/cascade_check.py --slug X --emit-dynamic
  python .agents/skills/post-publish/scripts/cascade_check.py --slug X --emit-dynamic --blurb "作者批注一句"
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Avoid zoneinfo/tzdata dependency on Windows stock Python
TZ_SHANGHAI = timezone(timedelta(hours=8), name="UTC+8")

FM_RE = re.compile(r"\A---\r?\n(.*?)\r?\n---\r?\n?", re.S)
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}")
FALLBACK_BLURB = "写完挂上了，点进去看。"


def firefly_root() -> Path:
    here = Path(__file__).resolve()
    for parent in here.parents:
        pkg = parent / "package.json"
        if not pkg.is_file():
            continue
        try:
            if json.loads(pkg.read_text(encoding="utf-8")).get("name") == "firefly":
                return parent
        except (OSError, json.JSONDecodeError):
            continue
    return here.parents[4]


def system_notes_enabled(repo: Path) -> bool:
    """读 src/config/dynamicConfig.ts 的 includeSystemNotes；缺省视为 false。

    园主 2026-08-29 起关闭发文级联动态：includeSystemNotes 非 true 时
    --emit-dynamic 一律拒绝（规则文档与脚本层双保险）。
    """
    cfg = repo / "src" / "config" / "dynamicConfig.ts"
    try:
        text = cfg.read_text(encoding="utf-8")
    except OSError:
        return False
    return re.search(r"includeSystemNotes\s*:\s*true", text) is not None


def parse_fm(text: str) -> dict[str, str]:
    m = FM_RE.match(text)
    if not m:
        return {}
    meta: dict[str, str] = {}
    for raw in m.group(1).splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or ":" not in line:
            continue
        k, _, v = line.partition(":")
        v = v.strip()
        if len(v) >= 2 and v[0] == v[-1] and v[0] in "'\"":
            v = v[1:-1]
        meta[k.strip()] = v
    return meta


def parse_tags(raw: str) -> list[str]:
    raw = raw.strip()
    if raw.startswith("[") and raw.endswith("]"):
        inner = raw[1:-1].strip()
        if not inner:
            return []
        return [t.strip().strip("'\"") for t in inner.split(",") if t.strip()]
    return [raw] if raw else []


def count_words(body: str) -> int:
    text = re.sub(r"```.*?```", "", body, flags=re.S)
    text = re.sub(r"`[^`]*`", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    zh = len(re.findall(r"[\u4e00-\u9fa5]", text))
    en = len(re.findall(r"[A-Za-z]", text))
    return zh + en


def load_posts(repo: Path) -> list[dict]:
    root = repo / "src" / "content" / "posts"
    posts: list[dict] = []
    if not root.is_dir():
        return posts
    for path in sorted(root.rglob("*")):
        if path.suffix.lower() not in {".md", ".mdx"}:
            continue
        if path.name.startswith("_"):
            continue
        # 草稿箱说明 / 杂项 README 不计入帖
        if path.name.lower() == "readme.md":
            continue
        text = path.read_text(encoding="utf-8")
        meta = parse_fm(text)
        if not meta.get("title"):
            continue
        body = FM_RE.sub("", text, count=1)
        slug = meta.get("slug") or path.parent.name if path.name.startswith("index.") else path.stem
        if path.name.startswith("index.") and not meta.get("slug"):
            # posts/<slug>/index.md 或 posts/_draftbox/<slug>/index.md
            rel = path.parent.relative_to(root).as_posix()
            if rel.startswith("_draftbox/"):
                rel = rel[len("_draftbox/") :]
            slug = rel
        draft = (meta.get("draft") or "false").lower() == "true"
        in_draftbox = "_draftbox" in path.relative_to(root).as_posix().split("/")
        published = meta.get("published") or ""
        posts.append(
            {
                "path": str(path.relative_to(repo)).replace("\\", "/"),
                "title": meta.get("title") or "",
                "slug": slug,
                "draft": draft,
                "draftbox": in_draftbox,
                "published": published,
                "description": (meta.get("description") or "").strip(),
                "category": (meta.get("category") or "").strip(),
                "tags": parse_tags(meta.get("tags") or ""),
                "words": count_words(body),
            }
        )
    return posts


def normalize_blurb(text: str) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    return text if text else FALLBACK_BLURB


def resolve_blurb(post: dict, blurb: str | None) -> str:
    if blurb and blurb.strip():
        return normalize_blurb(blurb.strip())
    desc = (post.get("description") or "").strip()
    if desc:
        return normalize_blurb(desc)
    return FALLBACK_BLURB


def load_dynamics(repo: Path) -> list[dict]:
    root = repo / "src" / "content" / "dynamic"
    out: list[dict] = []
    if not root.is_dir():
        return out
    for path in sorted(root.glob("*.md")):
        text = path.read_text(encoding="utf-8")
        meta = parse_fm(text)
        body = FM_RE.sub("", text, count=1)
        out.append(
            {
                "path": str(path.relative_to(repo)).replace("\\", "/"),
                "published": meta.get("published") or "",
                "body": body.strip(),
            }
        )
    return out


def sidebar_flags(repo: Path) -> dict[str, bool | None]:
    cfg = (repo / "src" / "config" / "sidebarConfig.ts").read_text(encoding="utf-8")
    # crude but enough: find type: "X" blocks and nearest enable
    flags: dict[str, bool | None] = {
        "dynamic": None,
        "stats": None,
        "categories": None,
        "tags": None,
        "calendar": None,
        "showHeatmap": None,
    }
    for key in ("dynamic", "stats", "categories", "tags", "calendar"):
        m = re.search(
            rf'type:\s*"{key}"[\s\S]*?enable:\s*(true|false)',
            cfg,
        )
        if m:
            flags[key] = m.group(1) == "true"
    hm = re.search(r"showHeatmap:\s*(true|false)", cfg)
    if hm:
        flags["showHeatmap"] = hm.group(1) == "true"
    return flags


def dynamic_covers_slug(dynamics: list[dict], slug: str) -> bool:
    needle = f"/posts/{slug.strip('/')}/"
    alt = f"/posts/{slug.strip('/')}"
    for d in dynamics:
        if needle in d["body"] or alt + ")" in d["body"] or alt + " " in d["body"] or alt + "\n" in d["body"]:
            return True
    return False


def emit_dynamic(repo: Path, post: dict, blurb: str | None = None) -> Path:
    now = datetime.now(TZ_SHANGHAI)
    stamp = now.strftime("%Y-%m-%d %H:%M:%S")
    file_stamp = now.strftime("%Y-%m-%d-%H%M%S")
    target_dir = repo / "src" / "content" / "dynamic"
    target_dir.mkdir(parents=True, exist_ok=True)
    path = target_dir / f"{file_stamp}.md"
    if path.exists():
        path = target_dir / f"{file_stamp}-post.md"
    slug = post["slug"].strip("/")
    title = post["title"]
    note = resolve_blurb(post, blurb)
    body = (
        f"发布了新笔记：[{title}](/posts/{slug}/)\n"
        f"\n"
        f"> {note}\n"
    )
    path.write_text(
        f"---\npublished: {stamp}\n---\n\n{body}",
        encoding="utf-8",
        newline="\n",
    )
    return path


def build_report(repo: Path, slug: str | None) -> dict:
    posts = load_posts(repo)
    public_posts = [p for p in posts if not p["draft"]]
    dynamics = load_dynamics(repo)
    cats = Counter(p["category"] or "(uncategorized)" for p in public_posts)
    tags: Counter[str] = Counter()
    for p in public_posts:
        tags.update(p["tags"])
    words = sum(p["words"] for p in public_posts)
    heat: Counter[str] = Counter()
    for p in public_posts:
        m = DATE_RE.match(p["published"] or "")
        if m:
            heat[m.group(0)] += 1

    flags = sidebar_flags(repo)
    warnings: list[str] = []
    for k, expected in (
        ("dynamic", True),
        ("stats", True),
        ("categories", True),
        ("tags", True),
        ("calendar", True),
        ("showHeatmap", True),
    ):
        if flags.get(k) is False:
            warnings.append(f"sidebarConfig: {k} is disabled")
        if flags.get(k) is None and k != "showHeatmap":
            warnings.append(f"sidebarConfig: could not detect type {k}")

    focus = None
    if slug:
        match = next((p for p in posts if p["slug"] == slug or p["slug"].endswith(slug)), None)
        if not match:
            warnings.append(f"slug not found among posts: {slug}")
        else:
            focus = {
                "post": match,
                "hasDynamic": dynamic_covers_slug(dynamics, match["slug"]),
                "inHeatmap": bool(DATE_RE.match(match["published"] or "")) and not match["draft"],
                "categoryOnBar": bool(match["category"]) and not match["draft"],
            }
            if match.get("draftbox"):
                warnings.append(
                    f"{slug} is in posts/_draftbox/ — local-only; do not commit/push or emit-dynamic"
                )
            if match["draft"]:
                warnings.append(
                    f"{slug} is draft=true — hidden from prod stats/heatmap/category counts"
                )
            if not match["category"]:
                warnings.append(f"{slug} missing category")
            if not match["tags"]:
                warnings.append(f"{slug} has no tags")

    return {
        "repo": str(repo),
        "postsTotal": len(posts),
        "postsPublic": len(public_posts),
        "categories": dict(cats.most_common()),
        "tags": dict(tags.most_common()),
        "tagCount": len(tags),
        "categoryCount": len(cats),
        "totalWords": words,
        "heatmapDates": dict(sorted(heat.items())),
        "dynamicsCount": len(dynamics),
        "sidebar": flags,
        "warnings": warnings,
        "focus": focus,
    }


def main() -> int:
    ap = argparse.ArgumentParser(description="cascade 收尾 index check")
    ap.add_argument("--slug", default="", help="focus post slug")
    ap.add_argument(
        "--emit-dynamic",
        action="store_true",
        help="create dynamic entry for --slug if missing (public posts only)",
    )
    ap.add_argument(
        "--blurb",
        default="",
        help="author note for --emit-dynamic (blockquote); else use post description",
    )
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    repo = firefly_root()
    report = build_report(repo, args.slug or None)

    emitted = None
    if args.emit_dynamic:
        if not system_notes_enabled(repo):
            print(
                "ERROR: dynamicConfig.includeSystemNotes is not true — "
                "system-note cascade is disabled; do not emit (see dynamicConfig.ts)",
                file=sys.stderr,
            )
            return 2
        if not args.slug:
            print("ERROR: --emit-dynamic requires --slug", file=sys.stderr)
            return 2
        focus = report.get("focus")
        if not focus:
            print("ERROR: slug not found", file=sys.stderr)
            return 2
        post = focus["post"]
        if post.get("draftbox"):
            print(
                "ERROR: refuse to emit dynamic for draftbox post "
                "(graduate out of posts/_draftbox/ first)",
                file=sys.stderr,
            )
            return 2
        if post["draft"]:
            print(
                "ERROR: refuse to emit dynamic for draft post "
                "(set draft: false or pass after publish)",
                file=sys.stderr,
            )
            return 2
        if focus["hasDynamic"]:
            print(f"OK dynamic already covers {post['slug']}", file=sys.stderr)
        else:
            path = emit_dynamic(repo, post, args.blurb or None)
            emitted = str(path.relative_to(repo)).replace("\\", "/")
            report = build_report(repo, args.slug)
            report["emittedDynamic"] = emitted
            report["emittedBlurb"] = resolve_blurb(post, args.blurb or None)
            print(f"OK emitted {emitted}", file=sys.stderr)

    if args.json or True:
        # always print JSON summary for agents; human lines on stderr above
        print(json.dumps(report, ensure_ascii=False, indent=2))

    if not args.json:
        print(
            f"cascade: public={report['postsPublic']}/{report['postsTotal']} "
            f"cats={report['categoryCount']} tags={report['tagCount']} "
            f"words={report['totalWords']} dynamics={report['dynamicsCount']}",
            file=sys.stderr,
        )
        for w in report["warnings"]:
            print(f"WARN: {w}", file=sys.stderr)
        if report.get("focus"):
            f = report["focus"]
            print(
                f"focus {f['post']['slug']}: dynamic={f['hasDynamic']} "
                f"heatmap={f['inHeatmap']} category={f['categoryOnBar']}",
                file=sys.stderr,
            )

    return 1 if report["warnings"] and not emitted else 0


if __name__ == "__main__":
    raise SystemExit(main())
