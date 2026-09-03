#!/usr/bin/env python3
"""image_utils.py — 发布链共享图片处理模块（post-publish / dynamic-publish 共用）

职责：本地图 →（压缩/缩放/透明贴底）→ 编码 →（可选）传 Cloudflare R2 → 返回公网 URL / 本地产物

设计决策（见 temp/research/post-publish-redesign/design-draft.md）：
- 编码优先 WebP q80（插画/截图类实测降 89-91% 视觉无损）；原图为照片时可用 JPEG q85 保留
- 透明图（RGBA/LA/P）先贴深色底 (26,26,32) 再编码
- 尺寸上限分级：post 正文 1600 / cover 1200 / dynamic 1200
- R2 为默认对象存储（桶 firefly-comment，公网 https://img.threetwoa.live），凭据读 env/.env
- 上传后 GET 验证 200 才返回 URL；无凭据时降级为本地产物 + 汇报
- sharp 优先（项目内 node_modules）；sharp 缺失时 PIL 回退（仅 jpg 编码，无 webp）
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

# ---------- 参数集中（可调） ----------
WEBP_Q = 80
JPEG_Q = 85
MAX_W_POST = 1600      # post 正文插图
MAX_W_COVER = 1200     # cover
MAX_W_DYNAMIC = 1200   # dynamic 配图
DARK_BG = (26, 26, 32)
R2_PUBLIC_DEFAULT = "https://img.threetwoa.live"

# ---------- 路径定位 ----------


def firefly_root() -> Path:
    here = Path(__file__).resolve()
    for parent in here.parents:
        pkg = parent / "package.json"
        if pkg.is_file():
            try:
                if json.loads(pkg.read_text(encoding="utf-8")).get("name") == "firefly":
                    return parent
            except Exception:
                pass
    return here.parents[4]


def sharp_entry() -> Path | None:
    """定位可用 sharp（.pnpm 布局优先，坏链接跳过）。"""
    nm = firefly_root() / "node_modules"
    pnpm = nm / ".pnpm"
    # 1) .pnpm/sharp@*…/node_modules/sharp（含真实 bin/lib）
    if pnpm.is_dir():
        cands = sorted(pnpm.glob("sharp@*/node_modules/sharp/package.json"),
                       key=lambda p: p.as_posix(), reverse=True)
        for pkg in cands:
            d = pkg.parent
            if (d / "lib").is_dir():
                return d
    # 2) 顶层 sharp（pnpm hoisted 兜底，须带 lib）
    top = nm / "sharp"
    if (top / "package.json").is_file() and (top / "lib").is_dir():
        return top
    return None


def has_pil() -> bool:
    try:
        import PIL  # noqa: F401
        return True
    except Exception:
        return False

# ---------- 压缩核心 ----------


def _run_sharp_webp(src: Path, dst: Path, quality: int, max_w: int, transparent_bg: bool) -> dict:
    """用 sharp 转 webp：透明贴底 + 缩放 + q80。返回 {width,height,bytes}。"""
    sharp = sharp_entry()
    # node require 需要正斜杠绝对路径（Windows）
    sharp_js = sharp.as_posix() if sharp else ""
    code = f"""
const sharp = require({sharp_js!r});
(async () => {{
  let im = sharp({str(src)!r});
  const meta = await im.metadata();
  let {{
    resize = false, w, h
  }} = {{}};
  if (meta.width > {max_w}) {{
    resize = true; w = {max_w}; h = Math.round(meta.height * {max_w} / meta.width);
  }}
  if ({str(transparent_bg).lower()}) {{
    im = im.flatten({{ background: {{ r: {DARK_BG[0]}, g: {DARK_BG[1]}, b: {DARK_BG[2]} }} }});
  }}
  if (resize) im = im.resize({{ width: w, height: h }});
  await im.webp({{ quality: {quality}, effort: 4 }}).toFile({str(dst)!r});
  const out = require('fs').statSync({str(dst)!r});
  console.log(JSON.stringify({{ width: (resize ? w : meta.width), height: (resize ? h : meta.height), bytes: out.size }}));
}})().catch(e => {{ console.error('SHARP_ERR:' + e.message); process.exit(2); }});
"""
    r = subprocess.run(["node", "-e", code], capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(r.stderr.strip() or "sharp failed")
    return json.loads(r.stdout.strip().splitlines()[-1])


def _run_pil_jpeg(src: Path, dst: Path, quality: int, max_w: int, transparent_bg: bool) -> dict:
    """PIL 回退：仅 jpg（无 webp）。逻辑继承旧 place_post.webify_one。"""
    from PIL import Image  # noqa: PLC0415
    im = Image.open(src)
    if transparent_bg and (im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)):
        rgba = im.convert("RGBA")
        bg = Image.new("RGBA", rgba.size, DARK_BG + (255,))
        im = Image.alpha_composite(bg, rgba).convert("RGB")
    else:
        im = im.convert("RGB")
    if im.width > max_w:
        h = round(im.height * max_w / im.width)
        resample = getattr(Image, "Resampling", Image).LANCZOS
        im = im.resize((max_w, h), resample)
    dst = dst.with_suffix(".jpg")
    dst.parent.mkdir(parents=True, exist_ok=True)
    im.save(dst, "JPEG", quality=quality, optimize=True)
    return {"width": im.width, "height": im.height, "bytes": dst.stat().st_size}


def compress_image(src: Path, *, role: str = "post", out_dir: Path | None = None,
                   fmt: str = "webp") -> dict:
    """压缩单图。

    role: post(正文1600) / cover(1200) / dynamic(1200) → 决定 max_w
    fmt: webp(sharp) / jpg(PIL 回退或照片保留)
    返回 {path, ext, width, height, bytes, encoder}
    """
    src = Path(src)
    if not src.is_file():
        raise FileNotFoundError(src)
    max_w = {"post": MAX_W_POST, "cover": MAX_W_COVER, "dynamic": MAX_W_DYNAMIC}.get(role, MAX_W_POST)
    transparent = True
    if fmt == "webp" and sharp_entry():
        if out_dir is None:
            out_dir = Path(tempfile.mkdtemp(prefix="img_utils_"))
        out_dir.mkdir(parents=True, exist_ok=True)
        dst = out_dir / (src.stem + ".webp")
        info = _run_sharp_webp(src, dst, WEBP_Q, max_w, transparent)
        return {"path": str(dst), "ext": ".webp", "width": info["width"],
                "height": info["height"], "bytes": info["bytes"], "encoder": "sharp"}
    # 回退 / 照片：PIL jpg
    if out_dir is None:
        out_dir = src.parent
    out_dir.mkdir(parents=True, exist_ok=True)
    dst = out_dir / (src.stem + ".jpg")
    info = _run_pil_jpeg(src, dst, JPEG_Q, max_w, transparent)
    return {"path": str(dst), "ext": ".jpg", "width": info["width"],
            "height": info["height"], "bytes": info["bytes"], "encoder": "pil"}

# ---------- R2 上传 ----------


def r2_env() -> dict:
    """读 R2 凭据（env 或 Firefly .env），缺则返回空 dict。"""
    keys = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"]
    env = {k: os.environ.get(k, "") for k in keys}
    env["R2_PUBLIC_BASE_URL"] = os.environ.get("R2_PUBLIC_BASE_URL", R2_PUBLIC_DEFAULT)
    if all(env[k] for k in keys):
        return env
    # 从 Firefly .env 兜底读（不打印值）
    dotenv = firefly_root() / ".env"
    if dotenv.is_file():
        for line in dotenv.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                if k in env and not env[k]:
                    env[k] = v.strip().strip('"').strip("'")
    return env if all(env[k] for k in keys) else {}


def upload_r2(local: Path, key: str, *, content_type: str | None = None,
              verify: bool = True) -> dict:
    """上传本地文件到 R2（子进程调用 upload_r2.py，已支持 --content-type 传 webp）。

    key: object key（如 posts/<slug>/x.webp）
    返回 {ok, key, url, bytes, get(200?)}；凭据缺失返回 {ok:False, reason}
    """
    env = r2_env()
    if not env:
        return {"ok": False, "key": key, "reason": "R2 credentials missing"}

    if content_type is None:
        ext = Path(local).suffix.lower()
        content_type = {".webp": "image/webp", ".jpg": "image/jpeg",
                        ".jpeg": "image/jpeg", ".png": "image/png"}.get(ext, "application/octet-stream")
    script = Path(__file__).resolve().parent / "upload_r2.py"
    cmd = [sys.executable, str(script), "--file", str(local), "--key", key,
           "--content-type", content_type]
    if verify:
        cmd.append("--verify")
    r = subprocess.run(cmd, capture_output=True, text=True)
    try:
        out = json.loads(r.stdout.strip().splitlines()[-1])
    except Exception:  # noqa: BLE001
        return {"ok": False, "key": key, "reason": (r.stderr or r.stdout).strip()[-300:]}
    return out

# ---------- CLI ----------


def main() -> int:
    ap = argparse.ArgumentParser(description="压缩并（可选）上传单图")
    ap.add_argument("--file", required=True)
    ap.add_argument("--role", default="post", choices=["post", "cover", "dynamic"])
    ap.add_argument("--fmt", default="webp", choices=["webp", "jpg"])
    ap.add_argument("--upload", action="store_true", help="压缩后上传 R2")
    ap.add_argument("--key", default="", help="R2 object key（--upload 时必填）")
    ap.add_argument("--out", default="", help="输出目录（默认 temp）")
    args = ap.parse_args()

    out = Path(args.out) if args.out else None
    info = compress_image(Path(args.file), role=args.role, fmt=args.fmt, out_dir=out)
    print(json.dumps(info, ensure_ascii=False))
    if args.upload:
        if not args.key:
            print("--key 必填（--upload）", file=sys.stderr)
            return 2
        up = upload_r2(Path(info["path"]), args.key)
        print(json.dumps(up, ensure_ascii=False))
        return 0 if up.get("ok") else 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
