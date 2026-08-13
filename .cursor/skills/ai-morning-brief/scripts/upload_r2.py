#!/usr/bin/env python3
"""Upload a local JPEG to Cloudflare R2 (S3-compatible SigV4).

Reads R2_* from process env or Firefly `.env` (never prints secret values).

Example:
  python upload_r2.py --file .scratch/ai-morning-brief-r2/images/2026-08-07/foo.jpg \\
    --key posts/ai-morning-brief-2026-08-07/foo.jpg
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import hmac
import json
import ssl
import sys
import urllib.error
import urllib.request
from pathlib import Path


def load_dotenv(path: Path) -> dict[str, str]:
    if not path.is_file():
        return {}
    raw = path.read_bytes()
    text = None
    for enc in ("utf-8", "utf-8-sig", "gb18030", "latin-1"):
        try:
            text = raw.decode(enc)
            break
        except UnicodeDecodeError:
            continue
    if text is None:
        return {}
    out: dict[str, str] = {}
    for line in text.splitlines():
        s = line.strip()
        if not s or s.startswith("#") or "=" not in s:
            continue
        k, _, v = s.partition("=")
        out[k.strip()] = v.strip().strip('"').strip("'")
    return out


def env_val(name: str, filemap: dict[str, str]) -> str:
    import os

    return (os.environ.get(name) or filemap.get(name) or "").strip()


def hmac_sha256(key: bytes, msg: str) -> bytes:
    return hmac.new(key, msg.encode("utf-8"), hashlib.sha256).digest()


def sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def put_r2(
    *,
    account_id: str,
    access_key: str,
    secret: str,
    bucket: str,
    object_key: str,
    body: bytes,
    content_type: str,
) -> None:
    method = "PUT"
    host = f"{account_id}.r2.cloudflarestorage.com"
    # keep slashes in key; encode other reserved chars per segment
    encoded = "/".join(urllib.request.quote(seg, safe="") for seg in object_key.split("/"))
    pathname = f"/{bucket}/{encoded}"
    now = dt.datetime.now(dt.timezone.utc)
    amz_date = now.strftime("%Y%m%dT%H%M%SZ")
    date_stamp = amz_date[:8]
    payload_hash = sha256_hex(body)
    canonical_headers = (
        f"content-type:{content_type}\n"
        f"host:{host}\n"
        f"x-amz-content-sha256:{payload_hash}\n"
        f"x-amz-date:{amz_date}\n"
    )
    signed_headers = "content-type;host;x-amz-content-sha256;x-amz-date"
    canonical_request = "\n".join(
        [method, pathname, "", canonical_headers, signed_headers, payload_hash]
    )
    scope = f"{date_stamp}/auto/s3/aws4_request"
    string_to_sign = "\n".join(
        ["AWS4-HMAC-SHA256", amz_date, scope, sha256_hex(canonical_request.encode())]
    )
    k_date = hmac_sha256(("AWS4" + secret).encode("utf-8"), date_stamp)
    k_region = hmac.new(k_date, b"auto", hashlib.sha256).digest()
    k_service = hmac.new(k_region, b"s3", hashlib.sha256).digest()
    k_signing = hmac.new(k_service, b"aws4_request", hashlib.sha256).digest()
    signature = hmac.new(k_signing, string_to_sign.encode(), hashlib.sha256).hexdigest()
    authorization = (
        f"AWS4-HMAC-SHA256 Credential={access_key}/{scope}, "
        f"SignedHeaders={signed_headers}, Signature={signature}"
    )
    req = urllib.request.Request(
        f"https://{host}{pathname}",
        data=body,
        method="PUT",
        headers={
            "Host": host,
            "Content-Type": content_type,
            "x-amz-content-sha256": payload_hash,
            "x-amz-date": amz_date,
            "Authorization": authorization,
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=60, context=ssl.create_default_context()) as resp:
            status = getattr(resp, "status", 200)
            if status >= 400:
                raise RuntimeError(f"R2 HTTP {status}")
    except urllib.error.HTTPError as exc:
        err = exc.read()[:200]
        raise RuntimeError(f"R2 HTTP {exc.code}: {err!r}") from None


def main() -> int:
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    p = argparse.ArgumentParser()
    p.add_argument("--file", required=True)
    p.add_argument("--key", required=True, help="object key, e.g. posts/ai-morning-brief-2026-08-07/foo.jpg")
    p.add_argument("--verify", action="store_true", help="GET public URL after upload")
    args = p.parse_args()

    repo = Path(__file__).resolve().parents[4] if "Firefly" in str(Path(__file__)) else Path.cwd()
    # skill path: Firefly/.cursor/skills/ai-morning-brief/scripts/upload_r2.py → parents[4]=Firefly
    for cand in (Path.cwd(), Path(__file__).resolve().parents[4]):
        if (cand / ".env.example").exists() or (cand / "src").exists():
            repo = cand
            break

    filemap = load_dotenv(repo / ".env")
    account = env_val("R2_ACCOUNT_ID", filemap)
    access = env_val("R2_ACCESS_KEY_ID", filemap)
    secret = env_val("R2_SECRET_ACCESS_KEY", filemap)
    bucket = env_val("R2_BUCKET", filemap) or "firefly-comment"
    public = env_val("R2_PUBLIC_BASE_URL", filemap).rstrip("/") or "https://img.threetwoa.live"
    if not (account and access and secret):
        print(
            json.dumps(
                {
                    "ok": False,
                    "error": "missing R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY in env or .env",
                },
                ensure_ascii=False,
            )
        )
        return 2

    path = Path(args.file)
    body = path.read_bytes()
    put_r2(
        account_id=account,
        access_key=access,
        secret=secret,
        bucket=bucket,
        object_key=args.key,
        body=body,
        content_type="image/jpeg",
    )
    url = f"{public}/{args.key}"
    result = {"ok": True, "key": args.key, "bytes": len(body), "url": url}
    if args.verify:
        req = urllib.request.Request(url, method="GET", headers={"User-Agent": "Firefly-r2-verify"})
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                result["get"] = getattr(resp, "status", 200)
        except urllib.error.HTTPError as exc:
            result["ok"] = False
            result["get"] = exc.code
    print(json.dumps(result, ensure_ascii=False))
    return 0 if result.get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
