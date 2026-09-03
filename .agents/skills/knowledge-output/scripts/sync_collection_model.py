#!/usr/bin/env python3
"""Diff Firefly collectionsConfig.ts (L1/L2 only) against the output mental-model cache.

Usage (Firefly/):
  python .cursor/skills/knowledge-output/scripts/sync_collection_model.py
  python .cursor/skills/knowledge-output/scripts/sync_collection_model.py --apply

Does not list posts. L3 slugs (parent is itself L2) appear as leaves under L2 only.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SKILL = HERE.parent
CACHE = SKILL / "references" / "collection-model.md"


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
    return Path.cwd()


def parse_items(ts: str) -> list[dict]:
    m = re.search(r"items:\s*\[(.*)\]\s*,\s*\n\}\s*;", ts, re.S)
    if not m:
        raise ValueError("cannot find collectionsConfig.items")
    body = m.group(1)
    marks = list(re.finditer(r'slug:\s*"([^"]+)"', body))
    items: list[dict] = []
    for i, mark in enumerate(marks):
        chunk = body[mark.start() : marks[i + 1].start() if i + 1 < len(marks) else len(body)]
        slug = mark.group(1)
        name_m = re.search(r'name:\s*"([^"]+)"', chunk)
        parent_m = re.search(r'parent:\s*"([^"]+)"', chunk)
        desc = ""
        dm = re.search(
            r'description:\s*(?:"([^"]*)"|((?:\s*"[^"]*"\s*,?\s*)+))',
            chunk,
        )
        if dm:
            if dm.group(1) is not None:
                desc = dm.group(1)
            else:
                desc = " ".join(re.findall(r'"([^"]*)"', dm.group(2) or ""))
        items.append(
            {
                "slug": slug,
                "name": name_m.group(1) if name_m else slug,
                "parent": parent_m.group(1) if parent_m else "",
                "purpose": re.sub(r"\s+", " ", desc).strip(),
            }
        )
    return items


def classify(items: list[dict]) -> tuple[list[dict], dict[str, list[dict]], dict[str, list[dict]]]:
    by_slug = {it["slug"]: it for it in items}
    l1 = [it for it in items if not it["parent"]]
    children: dict[str, list[dict]] = {it["slug"]: [] for it in l1}
    leaves: dict[str, list[dict]] = {}
    for it in items:
        p = it["parent"]
        if not p:
            continue
        parent = by_slug.get(p)
        if parent is None:
            continue
        if not parent["parent"]:
            children.setdefault(p, []).append(it)
        else:
            leaves.setdefault(p, []).append(it)
    return l1, children, leaves


SLUG_HEAD = re.compile(r"^#{2,3} L[12] `([^`]+)`", re.M)
ROUTE_BLOCK = re.compile(
    r"^(#{2,3} L[12] `([^`]+)`[^\n]*\n)(.*?)(?=^#{2,3} L[12] `|\Z)",
    re.M | re.S,
)


def parse_cache_routes(text: str) -> dict[str, str]:
    routes: dict[str, str] = {}
    for m in ROUTE_BLOCK.finditer(text):
        slug = m.group(2)
        block = m.group(3)
        rm = re.search(r"^route:\s*(.*?)(?=^parent:|^purpose:|^leaves:|^### |\Z)", block, re.M | re.S)
        if rm:
            routes[slug] = re.sub(r"\s+", " ", rm.group(1)).strip()
        else:
            line = re.search(r"^route:\s*(.+)$", block, re.M)
            if line:
                routes[slug] = line.group(1).strip()
    return routes


def render(
    l1: list[dict],
    children: dict[str, list[dict]],
    leaves: dict[str, list[dict]],
    routes: dict[str, str],
) -> str:
    lines = [
        "# 合集心智模型（一二级缓存）",
        "",
        "output 路由用。**只记一级 / 二级夹：干什么、什么样的文章该进。**",
        "不记文章名单，不记三级课表/手册章节正文。",
        "",
        "真源：`src/config/collectionsConfig.ts`。每次 output 开跑先：",
        "",
        "```bash",
        "python .cursor/skills/knowledge-output/scripts/sync_collection_model.py",
        "# 有 added/removed/renamed →",
        "python .cursor/skills/knowledge-output/scripts/sync_collection_model.py --apply",
        "```",
        "",
        "双挂：跨树才写两个 slug（例 `tool-claude-code` + `agentic-workflow`）。",
        "已挂二级则不必再挂它的一级父夹（一级页会滚子夹文章）。",
        "对不上现有夹：提案新 L1/L2，园主点头再改配置；禁止私自开空壳。",
        "",
    ]
    for top in l1:
        slug = top["slug"]
        route = routes.get(slug) or top["purpose"] or "（待补路由口吻）"
        lines.append(f"## L1 `{slug}` · {top['name']}")
        lines.append(f"purpose: {top['purpose']}")
        lines.append(f"route: {route}")
        kids = children.get(slug) or []
        if not kids:
            lines.append("")
            continue
        lines.append("")
        for kid in kids:
            ks = kid["slug"]
            kroute = routes.get(ks) or kid["purpose"] or "（待补路由口吻）"
            lines.append(f"### L2 `{ks}` · {kid['name']}")
            lines.append(f"parent: {slug}")
            lines.append(f"purpose: {kid['purpose']}")
            lines.append(f"route: {kroute}")
            leaf = leaves.get(ks) or []
            if leaf:
                joined = ", ".join(f"`{x['slug']}`" for x in leaf)
                lines.append(f"leaves: {joined}  # 三级夹，仅当正文就是该课/该叶才挂；不在本缓存展开")
            lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def snapshot(items: list[dict]) -> dict:
    l1, children, leaves = classify(items)
    l2 = []
    for top in l1:
        for kid in children.get(top["slug"]) or []:
            l2.append({"slug": kid["slug"], "name": kid["name"], "parent": top["slug"]})
    l3 = []
    for _parent, leafs in leaves.items():
        for it in leafs:
            l3.append(it["slug"])
    return {
        "l1": [{"slug": x["slug"], "name": x["name"]} for x in l1],
        "l2": l2,
        "l3_leaves": sorted(l3),
    }


def cache_snapshot(text: str) -> dict:
    l1 = []
    l2 = []
    for m in re.finditer(r"^## L1 `([^`]+)` · (.+)$", text, re.M):
        l1.append({"slug": m.group(1), "name": m.group(2).strip()})
    for m in re.finditer(
        r"^### L2 `([^`]+)` · (.+)\nparent: ([^\n]+)", text, re.M
    ):
        l2.append(
            {
                "slug": m.group(1),
                "name": m.group(2).strip(),
                "parent": m.group(3).strip(),
            }
        )
    leaves = re.findall(r"leaves: ([^\n]+)", text)
    l3 = []
    for line in leaves:
        l3.extend(re.findall(r"`([^`]+)`", line.split("#")[0]))
    return {"l1": l1, "l2": l2, "l3_leaves": sorted(l3)}


def main() -> int:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8")
        except Exception:
            pass
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--config", default="")
    ap.add_argument("--cache", default=str(CACHE))
    args = ap.parse_args()

    repo = firefly_root()
    cfg_path = Path(args.config) if args.config else repo / "src" / "config" / "collectionsConfig.ts"
    cache_path = Path(args.cache)
    ts = cfg_path.read_text(encoding="utf-8")
    items = parse_items(ts)
    l1, children, leaves = classify(items)
    live = snapshot(items)

    old_text = cache_path.read_text(encoding="utf-8") if cache_path.is_file() else ""
    cached = cache_snapshot(old_text) if old_text else {"l1": [], "l2": [], "l3_leaves": []}
    routes = parse_cache_routes(old_text) if old_text else {}

    live_l1 = {x["slug"] for x in live["l1"]}
    cache_l1 = {x["slug"] for x in cached["l1"]}
    live_l2 = {x["slug"] for x in live["l2"]}
    cache_l2 = {x["slug"] for x in cached["l2"]}

    diff = {
        "ok": True,
        "config": str(cfg_path),
        "cache": str(cache_path),
        "added_l1": sorted(live_l1 - cache_l1),
        "removed_l1": sorted(cache_l1 - live_l1),
        "added_l2": sorted(live_l2 - cache_l2),
        "removed_l2": sorted(cache_l2 - live_l2),
        "l1_count": len(live["l1"]),
        "l2_count": len(live["l2"]),
        "l3_leaf_count": len(live["l3_leaves"]),
    }
    drifted = any(diff[k] for k in ("added_l1", "removed_l1", "added_l2", "removed_l2"))
    if old_text:
        new_preview = render(l1, children, leaves, routes)
        if new_preview != old_text:
            # purpose/name text change also counts
            drifted = True
            diff["text_drift"] = True
    else:
        drifted = True
        diff["cache_missing"] = True

    diff["drifted"] = drifted
    if args.apply:
        cache_path.parent.mkdir(parents=True, exist_ok=True)
        cache_path.write_text(render(l1, children, leaves, routes), encoding="utf-8", newline="\n")
        diff["applied"] = True
        diff["ok"] = True
        print(json.dumps(diff, ensure_ascii=False, indent=2))
        return 0

    diff["ok"] = not drifted
    print(json.dumps(diff, ensure_ascii=False, indent=2))
    return 0 if not drifted else 1


if __name__ == "__main__":
    raise SystemExit(main())
