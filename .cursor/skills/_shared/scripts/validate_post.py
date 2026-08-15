#!/usr/bin/env python3
"""Validate a Firefly post for common authoring mistakes.

Stdlib only. Strips fenced code + inline backticks before body anti-pattern checks
so documentation examples like `![[...]]` do not false-fail.

成帖红线真源：.cursor/skills/_shared/post-redlines.md
"""

from __future__ import annotations

import argparse
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

REQUIRED = ("title", "published")
INTERNAL_KEYS = ("prevTitle", "prevSlug", "nextTitle", "nextSlug")

# Keep in sync with CONTEXT.md 「现行分类词表」. Unknown names WARN (new buckets allowed).
KNOWN_CATEGORIES = {
    "Agentic Coding",
    "指南",
    "中转",
    "羊毛揭秘",
    "skill 测评",
    "前端开发",
    "写作",
    "早报",
    "开源",
    "功能",
}

SLUG_RE = re.compile(
    r"^[a-z0-9]+(?:-[a-z0-9]+)*(?:/[a-z0-9]+(?:-[a-z0-9]+)*)*$"
)
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
UPDATED_RE = re.compile(
    r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$"
)
BOOL_RE = re.compile(r"^(true|false)$", re.I)

FENCE_RE = re.compile(r"```.*?```", re.S)
INLINE_CODE_RE = re.compile(r"`[^`\n]+`")
URL_RE = re.compile(r"(?:https?|ftp)://\S+", re.I)
MAILTO_RE = re.compile(r"mailto:\S+", re.I)
LEAF_DIR_RE = re.compile(r"::[A-Za-z][\w-]*(?:\{[^}]*\})?")
SPOILER_RE = re.compile(r":spoiler\[[^\]]*\]")
DRIVE_RE = re.compile(r"\b[A-Za-z]:[\\/]")
# remark-directive text directive: colon glued to the next token
GLUED_COLON_RE = re.compile(r":(?![:/\s])")
EN_DASH = "\u2013"
EM_DASH = "\u2014"

HEADING_RE = re.compile(r"^(#{2,3})\s+(.+)$", re.M)
ONE_SENTENCE_LABEL_RE = re.compile(r"一句话(?:收束|结论|总结|版本|说)")
TITLE_IMPRESSION_RE = re.compile(r"没废|带歪了")
MARK_TAG_RE = re.compile(r"<mark\b", re.I)
METRIC_CLASS_RE = re.compile(r"class=\"[^\"]*metric")
BOLD_MD_RE = re.compile(r"\*\*[^*\n]+\*\*")
BLOCKQUOTE_RE = re.compile(r"^>", re.M)

HEADING_PHRASES = (
    "一句话收束",
    "一句话结论",
    "一句话总结",
    "一句话版本",
    "一句话说",
    "总结一下",
    "核心要点",
    "关键收获",
    "key takeaways",
    "综上所述",
    "总而言之",
    "简而言之",
    "写在最后",
    "最后想说",
    "in conclusion",
    "to summarize",
    "the key takeaway",
    "深入探讨",
    "全面解析",
    "深度剖析",
    "未来展望",
    "挑战与机遇",
    "小结与展望",
    "让我们开始吧",
    "let's dive in",
    "值得注意的是",
    "揭秘两阶段",
    "内置的和社区的",
)
HEADING_EXACT = {
    "小结",
    "本章小结",
    "结语",
    "结束语",
    "概述",
    "简介",
    "背景介绍",
    "overview",
    "best practices",
    "最佳实践",
}

EMOJI_RE = re.compile(
    "["
    "\U0001f300-\U0001f9ff"
    "\U0001fa00-\U0001faff"
    "\U00002600-\U000026ff"
    "\U00002700-\U000027bf"
    "\U0000fe00-\U0000fe0f"
    "\U0001f1e6-\U0001f1ff"
    "]+"
)
KAOMOJI_RE = re.compile(
    r"[（(][^)）]{0,12}[´｀^￣><°・ωД∇▽□〇☆★;；~～дД][^)）]{0,12}[)）]|Σ\([^)]*\)",
    re.I,
)

TZ_SHANGHAI = timezone(timedelta(hours=8), name="UTC+8")


def parse_simple_frontmatter(block: str) -> dict[str, str]:
    meta: dict[str, str] = {}
    for raw in block.splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or ":" not in line:
            continue
        key, _, value = line.partition(":")
        key = key.strip()
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "'\"":
            value = value[1:-1]
        meta[key] = value
    return meta


def split_frontmatter(text: str) -> tuple[dict[str, str], str]:
    if not text.startswith("---"):
        raise ValueError("missing YAML frontmatter (must start with ---)")
    end = text.find("\n---", 3)
    if end == -1:
        raise ValueError("frontmatter not closed with ---")
    return parse_simple_frontmatter(text[3:end]), text[end + 4 :]


def scrub_code(body: str) -> str:
    """Remove fenced and inline code so examples do not trigger body lints."""
    return INLINE_CODE_RE.sub("", FENCE_RE.sub("", body))


def scrub_for_colon(body: str) -> str:
    text = scrub_code(body)
    text = URL_RE.sub(" ", text)
    text = MAILTO_RE.sub(" ", text)
    text = LEAF_DIR_RE.sub(" ", text)
    text = SPOILER_RE.sub(" ", text)
    text = DRIVE_RE.sub(" ", text)
    return text


def glued_colon_hits(body: str) -> list[str]:
    text = scrub_for_colon(body)
    hits: list[str] = []
    for m in GLUED_COLON_RE.finditer(text):
        start = max(0, m.start() - 8)
        end = min(len(text), m.end() + 8)
        snippet = re.sub(r"\s+", " ", text[start:end]).strip()
        hits.append(snippet)
        if len(hits) >= 5:
            break
    return hits


def lone_em_dashes(body: str) -> bool:
    """English em dash / en dash, but allow Chinese double em dash —— ."""
    text = scrub_code(body)
    if EN_DASH in text:
        return True
    i = 0
    while True:
        j = text.find(EM_DASH, i)
        if j < 0:
            return False
        prev_em = j > 0 and text[j - 1] == EM_DASH
        next_em = j + 1 < len(text) and text[j + 1] == EM_DASH
        if not prev_em and not next_em:
            return True
        i = j + 1


def heading_text(raw: str) -> str:
    t = raw.strip()
    t = re.sub(r"^#+\s*", "", t)
    t = t.strip().strip("*_").strip()
    return t


def banned_heading(title: str) -> str | None:
    t = heading_text(title)
    low = t.lower()
    if t in HEADING_EXACT or low in HEADING_EXACT:
        return t
    for phrase in HEADING_PHRASES:
        if phrase.lower() in low:
            return phrase
    return None


def title_has_mood_markup(title: str) -> bool:
    if EMOJI_RE.search(title) or KAOMOJI_RE.search(title):
        return True
    return False


def in_draftbox(path: Path) -> bool:
    return "_draftbox" in path.as_posix().split("/")


def today_shanghai() -> str:
    return datetime.now(TZ_SHANGHAI).strftime("%Y-%m-%d")


def lint_meta(meta: dict[str, str], path: Path) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []

    for key in REQUIRED:
        if not meta.get(key):
            errors.append(f"missing required frontmatter: {key}")

    published = meta.get("published", "")
    if published and not DATE_RE.match(published):
        errors.append(f"published must be YYYY-MM-DD, got {published!r}")

    draft_raw = meta.get("draft")
    if draft_raw and not BOOL_RE.match(draft_raw):
        errors.append(f"draft must be true/false, got {draft_raw!r}")
    is_draft = (draft_raw or "false").lower() == "true"
    boxed = in_draftbox(path)
    if boxed and not is_draft:
        errors.append("posts/_draftbox/ requires draft: true")

    for key in INTERNAL_KEYS:
        if meta.get(key):
            errors.append(f"do not set internal field `{key}` (injected at build time)")

    if meta.get("image") == "api":
        errors.append(
            "image: api — disabled in this repo (coverImageConfig.randomCoverImage.enable)"
        )

    slug = meta.get("slug")
    if not slug:
        warnings.append("missing slug — recommend explicit english kebab-case")
    elif not SLUG_RE.fullmatch(slug):
        errors.append(f"slug should be lowercase kebab-case: got {slug!r}")

    title = meta.get("title") or ""
    if title_has_mood_markup(title):
        errors.append(
            "frontmatter title must not contain emoji/kaomoji (title-mood is display-only)"
        )
    if TITLE_IMPRESSION_RE.search(title):
        errors.append(
            "frontmatter title is an impression hook (没废/带歪了) — name the topic completely"
        )
    for key in ("title", "slug"):
        val = meta.get(key) or ""
        if any(ch in val for ch in ("\ufeff", "\u200b", "\u200c", "\u200d", "\u00ad")):
            errors.append(f"{key} contains invisible/BOM/soft-hyphen characters — strip them")

    category = (meta.get("category") or "").strip()
    if not category:
        warnings.append("missing category — confirm against CONTEXT.md before publish")
    elif category not in KNOWN_CATEGORIES:
        warnings.append(
            f"category {category!r} not in CONTEXT.md whitelist — OK only if owner approved a new bucket"
        )

    updated = (meta.get("updated") or "").strip()
    has_time = bool(UPDATED_RE.match(updated))
    if not is_draft:
        if not updated:
            warnings.append("missing updated — public posts should set YYYY-MM-DDTHH:mm:ss")
        elif not has_time:
            warnings.append(
                f"updated should include time (YYYY-MM-DDTHH:mm:ss), got {updated!r}"
            )
        if published == today_shanghai() and not has_time:
            errors.append(
                "today's public post needs updated: YYYY-MM-DDTHH:mm:ss "
                "(same-day stamp collision hides homepage pin)"
            )

    return errors, warnings


def lint_body(body: str) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    scrubbed = scrub_code(body)

    if re.search(r"^#\s+\S", scrubbed, re.M):
        errors.append("body has H1 — use ## / ### and keep title in frontmatter")
    if not re.search(r"^##\s+\S", scrubbed, re.M):
        errors.append("body has no H2 — every post needs ## sections (sidebar TOC reads H2)")
    if re.search(r"!\[\[.+?\]\]", scrubbed):
        errors.append("Obsidian embed ![[...]] is unsupported — use ![alt](./path)")
    if re.search(r"^!!!\s+\w+", scrubbed, re.M):
        errors.append("Python admonition !!! is disabled — use > [!NOTE]")
    if re.search(r"^:::\s*github\b", scrubbed, re.M):
        errors.append('use leaf directive ::github{repo="owner/repo"}')
    if re.search(r"\|\|[^|\n]+\|\|", scrubbed):
        errors.append("Discord spoiler ||...|| found — use :spoiler[...]")

    if re.search(r"""\]\(\s*javascript:""", body, re.I) or re.search(
        r"""href\s*=\s*["']\s*javascript:""", body, re.I
    ):
        errors.append("javascript: URL is forbidden — neutralize to plain text")
    if re.search(r"""\]\(\s*data:text/html""", body, re.I) or re.search(
        r"""href\s*=\s*["']\s*data:text/html""", body, re.I
    ):
        errors.append("data:text/html URL is forbidden — neutralize to plain text")
    if re.search(r"<script[\s>]", scrubbed, re.I):
        errors.append("raw <script> is forbidden — strip before publish")
    if re.search(r"""<iframe[^>]+src\s*=\s*["']file:""", scrubbed, re.I):
        errors.append("file: iframe is forbidden — strip")

    hits = glued_colon_hits(body)
    if hits:
        sample = "; ".join(repr(h) for h in hits)
        errors.append(
            "half-width colon glued to the next token (remark-directive). "
            "Use fullwidth '：' except URLs/::directives/:spoiler. near: " + sample
        )
    if lone_em_dashes(body):
        errors.append(
            "English em dash / en dash in body — use comma/period or Chinese '——'"
        )

    for _hashes, raw in HEADING_RE.findall(scrubbed):
        banned = banned_heading(raw)
        if banned:
            errors.append(f"banned heading style {banned!r}: {raw.strip()}")

    if ONE_SENTENCE_LABEL_RE.search(scrubbed):
        errors.append("body contains 一句话X label — say the judgment directly")

    mark_n = len(MARK_TAG_RE.findall(body))
    metric_n = len(METRIC_CLASS_RE.findall(body))
    if mark_n >= 3 and metric_n == 0:
        warnings.append(
            "too many <mark> highlights — color numbers with "
            ".metric.metric-low/.high/.tools/.ver"
        )
    if not BOLD_MD_RE.search(body):
        warnings.append("body has no **bold**")
    if not BLOCKQUOTE_RE.search(body):
        warnings.append("body has no blockquote")
    if not INLINE_CODE_RE.search(body):
        warnings.append("body has no inline code")

    return errors, warnings


def validate(path: Path) -> list[str]:
    errors: list[str] = []
    warnings: list[str] = []
    text = path.read_text(encoding="utf-8")
    try:
        meta, body = split_frontmatter(text)
    except ValueError as e:
        return [str(e)]

    e1, w1 = lint_meta(meta, path)
    e2, w2 = lint_body(body)
    errors.extend(e1)
    errors.extend(e2)
    warnings.extend(w1)
    warnings.extend(w2)

    base = path.parent
    for rel in re.findall(r"!\[[^\]]*\]\((\./images/[^)\s]+\.gif)\)", body, re.I):
        errors.append(f"GIF under ./images/ may lose animation — use public/posts/: {rel}")

    for rel in re.findall(r"!\[[^\]]*\]\((\./[^)\s]+)\)", body):
        if not (base / rel).resolve().exists():
            errors.append(f"missing local image: {rel}")

    for rel in re.findall(
        r"""<img\b[^>]*\bsrc\s*=\s*["'](\./[^"']+)["']""", body, re.I
    ):
        errors.append(
            f"relative HTML <img src={rel!r}> 404s at runtime — use Markdown "
            "![](./images/...) or /posts/<slug>/... under public/"
        )

    cover = meta.get("image") or ""
    if cover.startswith("./") and not (base / cover).resolve().exists():
        errors.append(f"missing cover file: {cover}")

    repo_public = path
    for parent in path.parents:
        if (parent / "public").is_dir() and (parent / "src").is_dir():
            repo_public = parent / "public"
            break
    for pub_rel in re.findall(r"""(?:src=["']|\!\[[^\]]*\]\()(/posts/[^"')\s]+)""", body):
        candidate = repo_public.joinpath(*pub_rel.lstrip("/").split("/"))
        if not candidate.exists():
            warnings.append(f"public asset missing (ok if TODO): {pub_rel}")

    return errors + [f"WARN: {w}" for w in warnings]


def _self_test() -> int:
    cases: list[tuple[str, bool]] = []

    def expect(name: str, body: str, should_fail: bool, needle: str) -> None:
        errs, _ = lint_body(body)
        hit = any(needle in e for e in errs)
        ok = hit if should_fail else not hit
        cases.append((name, ok))
        if not ok:
            print(f"FAIL self-test {name}: errs={errs}", file=sys.stderr)

    expect("time-colon", "现在是 13:06 开打。\n", True, "half-width colon")
    expect("fullwidth-time", "现在是 13：06 开打。\n", False, "half-width colon")
    expect("url-ok", "见 [x](https://example.com/a:b) 即可。\n", False, "half-width colon")
    expect(
        "github-ok",
        '卡片 ::github{repo="owner/repo"} 放这。\n',
        False,
        "half-width colon",
    )
    expect("spoiler-ok", "秘密 :spoiler[不要看] 收。\n", False, "half-width colon")
    expect("cjk-colon", "第一幕:午后就开始。\n", True, "half-width colon")
    expect("emdash", "这事结束了—然后呢\n", True, "em dash")
    expect("cn-dash", "这事结束了——然后呢\n", False, "em dash")
    expect("h2-banned", "## 一句话收束\n正文\n", True, "banned heading")
    expect("h2-ok", "## 认清撞上哪一层就行\n正文\n", False, "banned heading")
    expect("h2-required", "只有一段，没有节标题。\n", True, "no H2")
    expect("h2-empty-object", "## 揭秘两阶段\n正文\n", True, "banned heading")
    expect("label", "一句话结论就是别买。\n", True, "一句话X")

    meta_bad = {"title": "坑爹啊 😅", "published": "2026-08-14"}
    e, _ = lint_meta(meta_bad, Path("src/content/posts/x/index.md"))
    cases.append(("title-emoji", any("emoji" in x for x in e)))

    e, _ = lint_meta(
        {"title": "这回没废", "published": "2026-08-14"},
        Path("src/content/posts/x/index.md"),
    )
    cases.append(("title-impression", any("impression" in x for x in e)))

    _, w = lint_body("只有一句，没有强调。\n")
    cases.append(("md-flavor-warn", any("bold" in x for x in w)))

    boxed = Path("src/content/posts/_draftbox/x/index.md")
    e, _ = lint_meta(
        {"title": "t", "published": "2026-08-14", "draft": "false"}, boxed
    )
    cases.append(("draftbox-draft", any("draftbox" in x for x in e)))

    failed = [n for n, ok in cases if not ok]
    if failed:
        print(f"self-test failed: {failed}", file=sys.stderr)
        return 1
    print(f"OK self-test ({len(cases)})")
    return 0


def print_findings(path: Path, findings: list[str]) -> int:
    errors = [x for x in findings if not x.startswith("WARN:")]
    warns = [x for x in findings if x.startswith("WARN:")]
    if errors:
        print(f"FAIL ({len(errors)}) {path}")
        for e in errors:
            print(f"  - {e}")
        for w in warns:
            print(f"  - {w}")
        return 1
    if warns:
        print(f"OK_WITH_WARNINGS ({len(warns)}) {path}")
        for w in warns:
            print(f"  - {w}")
        return 0
    print(f"OK {path}")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="Validate a Firefly post markdown file")
    ap.add_argument("path", nargs="?", help="path to index.md")
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args()
    if args.self_test:
        return _self_test()
    if not args.path:
        ap.print_usage()
        return 2
    path = Path(args.path)
    if not path.is_file():
        print(f"ERROR: file not found: {path}")
        return 2
    return print_findings(path, validate(path))


if __name__ == "__main__":
    sys.exit(main())
