#!/usr/bin/env python3
"""Validate a Firefly post for common authoring mistakes.

Stdlib only. Strips fenced code + inline backticks before body anti-pattern checks
so documentation examples like `![[...]]` do not false-fail.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

REQUIRED = ("title", "published")
INTERNAL_KEYS = ("prevTitle", "prevSlug", "nextTitle", "nextSlug")

SLUG_RE = re.compile(
    r"^[a-z0-9]+(?:-[a-z0-9]+)*(?:/[a-z0-9]+(?:-[a-z0-9]+)*)*$"
)
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
BOOL_RE = re.compile(r"^(true|false)$", re.I)

FENCE_RE = re.compile(r"```.*?```", re.S)
INLINE_CODE_RE = re.compile(r"`[^`\n]+`")


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


def validate(path: Path) -> list[str]:
    errors: list[str] = []
    warnings: list[str] = []
    text = path.read_text(encoding="utf-8")
    try:
        meta, body = split_frontmatter(text)
    except ValueError as e:
        return [str(e)]

    for key in REQUIRED:
        if not meta.get(key):
            errors.append(f"missing required frontmatter: {key}")

    published = meta.get("published", "")
    if published and not DATE_RE.match(published):
        errors.append(f"published must be YYYY-MM-DD, got {published!r}")

    draft = meta.get("draft")
    if draft and not BOOL_RE.match(draft):
        errors.append(f"draft must be true/false, got {draft!r}")

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

    scrubbed = scrub_code(body)

    if re.search(r"^#\s+\S", scrubbed, re.M):
        errors.append("body starts with H1 — use ## and keep title in frontmatter")
    if re.search(r"!\[\[.+?\]\]", scrubbed):
        errors.append("Obsidian embed ![[...]] is unsupported — use ![alt](./path)")
    if re.search(r"^!!!\s+\w+", scrubbed, re.M):
        errors.append("Python admonition !!! is disabled — use > [!NOTE]")
    if re.search(r"^:::\s*github\b", scrubbed, re.M):
        errors.append('use leaf directive ::github{repo="owner/repo"}')
    if re.search(r"\|\|[^|\n]+\|\|", scrubbed):
        errors.append("Discord spoiler ||...|| found — use :spoiler[...]")

    # Dangerous URL schemes (markdown + html href/src)
    if re.search(r"""\]\(\s*javascript:""", body, re.I) or re.search(
        r"""href\s*=\s*["']\s*javascript:""", body, re.I
    ):
        errors.append("javascript: URL is forbidden — neutralize to plain text")
    if re.search(r"""\]\(\s*data:text/html""", body, re.I) or re.search(
        r"""href\s*=\s*["']\s*data:text/html""", body, re.I
    ):
        errors.append("data:text/html URL is forbidden — neutralize to plain text")
    # Real tags only (ignore prose mentioning the words)
    if re.search(r"<script[\s>]", scrubbed, re.I):
        errors.append("raw <script> is forbidden — strip before publish")
    if re.search(r"""<iframe[^>]+src\s*=\s*["']file:""", scrubbed, re.I):
        errors.append("file: iframe is forbidden — strip")

    # Invisible chars in title/slug
    for key in ("title", "slug"):
        val = meta.get(key) or ""
        if any(ch in val for ch in ("\ufeff", "\u200b", "\u200c", "\u200d", "\u00ad")):
            errors.append(f"{key} contains invisible/BOM/soft-hyphen characters — strip them")

    # GIF should not live under ./images/
    for rel in re.findall(r"!\[[^\]]*\]\((\./images/[^)\s]+\.gif)\)", body, re.I):
        errors.append(f"GIF under ./images/ may lose animation — use public/posts/: {rel}")

    base = path.parent
    for rel in re.findall(r"!\[[^\]]*\]\((\./[^)\s]+)\)", body):
        if not (base / rel).resolve().exists():
            errors.append(f"missing local image: {rel}")

    cover = meta.get("image") or ""
    if cover.startswith("./") and not (base / cover).resolve().exists():
        errors.append(f"missing cover file: {cover}")

    # public absolute refs: /posts/<slug>/file
    repo_public = path
    # walk up to find public/ next to src/
    for parent in path.parents:
        if (parent / "public").is_dir() and (parent / "src").is_dir():
            repo_public = parent / "public"
            break
    for pub_rel in re.findall(r"""(?:src=["']|\!\[[^\]]*\]\()(/posts/[^"')\s]+)""", body):
        candidate = repo_public / pub_rel.lstrip("/").replace("/", "\\")
        # Path handles separators
        candidate = repo_public.joinpath(*pub_rel.lstrip("/").split("/"))
        if not candidate.exists():
            warnings.append(f"public asset missing (ok if TODO): {pub_rel}")

    # surface warnings after errors in printer
    return errors + [f"WARN: {w}" for w in warnings]


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: python validate_post.py <path-to-post.md>")
        return 2
    path = Path(sys.argv[1])
    if not path.is_file():
        print(f"ERROR: file not found: {path}")
        return 2
    findings = validate(path)
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


if __name__ == "__main__":
    sys.exit(main())
