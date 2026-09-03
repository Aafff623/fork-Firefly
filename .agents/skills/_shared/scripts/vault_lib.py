#!/usr/bin/env python3
"""Shared helpers for vault → Knowledge / post sync (stdlib only)."""

from __future__ import annotations

import hashlib
import json
import re
from dataclasses import dataclass
from pathlib import Path

WIKI_EMBED_RE = re.compile(r"!\[\[([^\]]+)\]\]")
WIKI_LINK_RE = re.compile(r"(?<!!)\[\[([^\]]+)\]\]")
FM_RE = re.compile(r"\A---\r?\n.*?\r?\n---\r?\n?", re.S)
H1_RE = re.compile(r"^#\s+.+$", re.M)
MD_IMG_RE = re.compile(r"!\[[^\]]*\]\(([^)\s]+)\)")
HTML_IMG_RE = re.compile(r"""<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["']""", re.I)
WS_RE = re.compile(r"[ \t]+\n")
MULTI_NL_RE = re.compile(r"\n{3,}")

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif", ".svg"}


@dataclass
class VaultInfo:
    root: Path
    attachment_folder: Path | None


def find_vault_root(note_path: Path) -> Path | None:
    cur = note_path.resolve().parent
    for _ in range(32):
        if (cur / ".obsidian").is_dir():
            return cur
        if cur.parent == cur:
            break
        cur = cur.parent
    return None


def load_attachment_folder(vault: Path) -> Path | None:
    app = vault / ".obsidian" / "app.json"
    if not app.is_file():
        return None
    try:
        data = json.loads(app.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None
    rel = (data.get("attachmentFolderPath") or "").strip().replace("\\", "/")
    if not rel:
        return None
    p = (vault / rel).resolve()
    return p if p.is_dir() else None


def vault_info_for_note(note_path: Path) -> VaultInfo:
    root = find_vault_root(note_path)
    if root is None:
        raise FileNotFoundError(f"no .obsidian vault above: {note_path}")
    return VaultInfo(root=root, attachment_folder=load_attachment_folder(root))


def split_wiki_target(raw: str) -> tuple[str, str | None]:
    """Return (path_or_name, size_token). size like 750 or 750x400."""
    parts = [p.strip() for p in raw.split("|")]
    target = parts[0]
    size = None
    for part in parts[1:]:
        if re.fullmatch(r"\d+(x\d+)?", part, re.I):
            size = part.lower()
    return target, size


def resolve_vault_file(vault: VaultInfo, target: str, note_dir: Path) -> Path | None:
    target = target.replace("\\", "/").strip()
    candidates: list[Path] = []
    direct = Path(target)
    if direct.is_absolute():
        return direct if direct.is_file() else None

    candidates.append((note_dir / target).resolve())
    candidates.append((vault.root / target).resolve())
    if vault.attachment_folder:
        candidates.append((vault.attachment_folder / target).resolve())
        candidates.append((vault.attachment_folder / Path(target).name).resolve())

    basename = Path(target).name
    stem = Path(basename).stem
    has_ext = Path(basename).suffix != ""

    for c in candidates:
        if c.is_file():
            return c

    if not has_ext:
        search_roots = [note_dir, vault.root]
        if vault.attachment_folder:
            search_roots.insert(0, vault.attachment_folder)
        for root in search_roots:
            if not root.is_dir():
                continue
            hits = [
                p
                for p in root.rglob("*")
                if p.is_file() and p.stem == stem and p.suffix.lower() in IMAGE_EXTS
            ]
            if len(hits) == 1:
                return hits[0].resolve()
            if hits:
                # prefer attachment folder / shorter path
                hits.sort(key=lambda p: (len(p.parts), str(p)))
                return hits[0].resolve()

    # basename-only search in attachment folder then vault
    search_roots = []
    if vault.attachment_folder:
        search_roots.append(vault.attachment_folder)
    search_roots.append(vault.root)
    for root in search_roots:
        hits = [p for p in root.rglob(basename) if p.is_file()]
        if len(hits) == 1:
            return hits[0].resolve()
        if hits:
            hits.sort(key=lambda p: (len(p.parts), str(p)))
            return hits[0].resolve()
    return None


def strip_frontmatter(text: str) -> str:
    return FM_RE.sub("", text, count=1)


def normalize_for_fingerprint(text: str, *, is_blog: bool) -> str:
    """Normalize body so OB ↔ blog can be compared for semantic drift.

    Strategy (keeps false drift low):
    - Compare from the first ``## `` heading onward (ignore cover + blog lead).
    - Images become ordered tokens ``⟦IMG:n⟧`` (names may differ after ASCII rename).
    - Drop blog-only ``::github`` cards and HTML comments.
    """
    body = strip_frontmatter(text)
    body = body.replace("\r\n", "\n").replace("\r", "\n")
    body = body.replace("\t", "  ")
    body = H1_RE.sub("", body)

    # Cover: first wiki embed before any ## is cover (OB); remove it
    pre, sep, rest = body.partition("\n## ")
    if sep:
        pre = WIKI_EMBED_RE.sub("", pre, count=1)
        body = pre + sep + rest
    else:
        body = WIKI_EMBED_RE.sub("", body, count=1)

    # Start fingerprint at first H2 (blog lead / OB blank lines ignored)
    m_h2 = re.search(r"^##\s+", body, re.M)
    if m_h2:
        body = body[m_h2.start() :]

    img_i = 0

    def next_img(_: re.Match[str]) -> str:
        nonlocal img_i
        tok = f"⟦IMG:{img_i}⟧"
        img_i += 1
        return tok

    body = WIKI_EMBED_RE.sub(next_img, body)
    body = HTML_IMG_RE.sub(next_img, body)
    body = MD_IMG_RE.sub(next_img, body)

    # blog-only ornaments — do not require them on OB side
    body = re.sub(r"^::github\{repo=\"[^\"]+\"\}\s*$", "", body, flags=re.M)
    body = WIKI_LINK_RE.sub(
        lambda m: f"⟦WIKI:{m.group(1).split('|')[0].strip()}⟧", body
    )

    lines = []
    for line in body.split("\n"):
        s = line.rstrip()
        if s.startswith("<!--") and s.endswith("-->"):
            continue
        lines.append(s)
    body = "\n".join(lines)

    # Formatting noise that differs OB ↔ blog after prep (not semantic drift)
    # Indent first so `>\s*` / list markers apply to formerly nested lines.
    body = re.sub(r"^[ \t]+", "", body, flags=re.M)
    body = re.sub(r"<(https?://[^>\s]+)>", r"\1", body)
    body = re.sub(r"^>\s*", "> ", body, flags=re.M)
    body = re.sub(r"^[-*+]\s+", "", body, flags=re.M)
    body = re.sub(r"^\d+[.)]\s+", "", body, flags=re.M)
    body = re.sub(r"[ \t]{2,}", " ", body)
    body = WS_RE.sub("\n", body)
    body = MULTI_NL_RE.sub("\n", body)
    body = re.sub(r"\n{2,}", "\n", body)
    body = body.strip().lower()
    _ = is_blog  # reserved for future side-specific tweaks
    return body


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def firefly_root_from_here() -> Path:
    # .../Firefly/.cursor/skills/_shared/scripts/this.py → Firefly/
    here = Path(__file__).resolve()
    for parent in here.parents:
        pkg = parent / "package.json"
        if pkg.is_file():
            try:
                data = json.loads(pkg.read_text(encoding="utf-8"))
            except (OSError, json.JSONDecodeError):
                continue
            if data.get("name") == "firefly":
                return parent
    # fallback: scripts(0)/_shared(1)/skills(2)/.cursor(3)/Firefly(4)
    return here.parents[4]


def default_manifest_path(repo: Path | None = None) -> Path:
    root = repo or firefly_root_from_here()
    return root / ".ob2blog" / "manifest.json"


def load_manifest(path: Path) -> dict:
    if not path.is_file():
        return {
            "version": 1,
            "vaultRoot": "",
            "posts": [],
        }
    return json.loads(path.read_text(encoding="utf-8"))


def save_manifest(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def find_post_entry(manifest: dict, *, slug: str | None = None, note: str | None = None):
    for p in manifest.get("posts") or []:
        if slug and p.get("slug") == slug:
            return p
        if note and Path(p.get("obsidianNote", "")).resolve() == Path(note).resolve():
            return p
    return None


def ascii_asset_name(src: Path, *, role: str, index: int) -> str:
    ext = src.suffix.lower() or ".png"
    if role == "cover":
        return f"cover{ext}"
    stem = re.sub(r"[^a-z0-9]+", "-", src.stem.lower()).strip("-")
    if not stem:
        stem = f"image-{index}"
    return f"{stem}{ext}"
