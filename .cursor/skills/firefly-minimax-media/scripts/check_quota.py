#!/usr/bin/env python3
"""One-shot / mid-run MiniMax Token Plan quota check via `mmx quota show`.

Exit codes:
  0  ok for requested need (or summary-only success)
  2  insufficient quota for --need
  1  mmx missing / command failed / bad JSON

Examples:
  python check_quota.py
  python check_quota.py --json
  python check_quota.py --need video --min-remaining 1
  python check_quota.py --need general --min-percent 10
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from typing import Any


NEED_POOL = {
    "video": "video",
    "image": "general",
    "speech": "general",
    "voice": "general",
    "music": "general",
    "text": "general",
    "general": "general",
}


def run_mmx_quota() -> dict[str, Any]:
    mmx = shutil.which("mmx")
    if not mmx:
        raise RuntimeError("mmx CLI not found on PATH (install mmx-cli / check auth)")
    # Windows often resolves to mmx.cmd / mmx.ps1; subprocess handles via shell=False on which()
    cmd = [mmx, "quota", "show", "--output", "json", "--quiet"]
    try:
        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            check=False,
            shell=False,
        )
    except OSError as exc:
        # PowerShell shim sometimes needs shell=True on Windows
        proc = subprocess.run(
            " ".join(cmd),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            check=False,
            shell=True,
        )
        if proc.returncode != 0 and not proc.stdout.strip():
            raise RuntimeError(f"failed to launch mmx: {exc}") from exc

    if proc.returncode != 0:
        err = (proc.stderr or proc.stdout or "").strip()
        raise RuntimeError(f"mmx quota show failed (exit {proc.returncode}): {err}")

    raw = proc.stdout.strip()
    if not raw:
        raise RuntimeError("mmx quota show returned empty stdout")
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"invalid JSON from mmx: {raw[:200]}") from exc
    return data


def normalize(data: dict[str, Any]) -> dict[str, Any]:
    remains = data.get("model_remains") or []
    pools: dict[str, Any] = {}
    for item in remains:
        name = item.get("model_name")
        if not name:
            continue
        total = int(item.get("current_interval_total_count") or 0)
        used = int(item.get("current_interval_usage_count") or 0)
        # video: count-based; general: percent-based (total often 0)
        count_left = max(total - used, 0) if total > 0 else None
        pools[name] = {
            "model_name": name,
            "interval_remaining_percent": item.get("current_interval_remaining_percent"),
            "weekly_remaining_percent": item.get("current_weekly_remaining_percent"),
            "interval_total": total,
            "interval_used": used,
            "interval_remaining_count": count_left,
            "weekly_total": int(item.get("current_weekly_total_count") or 0),
            "weekly_used": int(item.get("current_weekly_usage_count") or 0),
            "remains_time_ms": item.get("remains_time"),
            "weekly_boost_permille": item.get("weekly_boost_permille"),
        }

    general = pools.get("general") or {}
    video = pools.get("video") or {}
    summary = {
        "ok": True,
        "general_interval_percent": general.get("interval_remaining_percent"),
        "general_weekly_percent": general.get("weekly_remaining_percent"),
        "video_interval_remaining": video.get("interval_remaining_count"),
        "video_interval_total": video.get("interval_total"),
        "video_interval_used": video.get("interval_used"),
        "video_weekly_remaining": (
            max(
                int(video.get("weekly_total") or 0) - int(video.get("weekly_used") or 0),
                0,
            )
            if video
            else None
        ),
        "pools": pools,
        "rights": {
            "general": ["image", "speech", "voice_design", "music", "text", "vision", "search"],
            "video": ["video_generate"],
        },
    }
    return summary


def evaluate(
    summary: dict[str, Any],
    need: str | None,
    min_remaining: int,
    min_percent: float,
) -> tuple[bool, str]:
    if not need:
        return True, "summary_only"
    pool_name = NEED_POOL.get(need)
    if not pool_name:
        return False, f"unknown need={need!r}; choose from {sorted(NEED_POOL)}"
    pool = (summary.get("pools") or {}).get(pool_name)
    if not pool:
        return False, f"pool {pool_name!r} missing from quota response"

    if pool_name == "video":
        left = pool.get("interval_remaining_count")
        if left is None:
            return False, "video remaining count unavailable"
        if left < min_remaining:
            return False, f"video interval remaining {left} < required {min_remaining}"
        return True, f"video ok remaining={left}"

    pct = pool.get("interval_remaining_percent")
    if pct is None:
        return False, "general percent unavailable"
    if float(pct) < float(min_percent):
        return False, f"general interval {pct}% < required {min_percent}%"
    return True, f"general ok percent={pct}"


def print_human(summary: dict[str, Any]) -> None:
    g = summary.get("general_interval_percent")
    gw = summary.get("general_weekly_percent")
    vr = summary.get("video_interval_remaining")
    vt = summary.get("video_interval_total")
    vu = summary.get("video_interval_used")
    vwr = summary.get("video_weekly_remaining")
    print("MiniMax 额度快照")
    print(f"  通用池(图/语音/音乐/文本)  当前窗口剩余: {g}%   本周剩余: {gw}%")
    print(f"  视频池(按次)              当前窗口: {vr}/{vt} 次可用 (已用 {vu})  本周约剩: {vwr}")
    print("  权益: 通用池→图/语音/音乐/文本; 视频池→短视频")


def main() -> int:
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

    parser = argparse.ArgumentParser(description="Check MiniMax quota via mmx")
    parser.add_argument("--json", action="store_true", help="print JSON only")
    parser.add_argument(
        "--need",
        choices=sorted(NEED_POOL),
        help="scenario need to gate on",
    )
    parser.add_argument(
        "--min-remaining",
        type=int,
        default=1,
        help="min video count left when --need video (default 1)",
    )
    parser.add_argument(
        "--min-percent",
        type=float,
        default=5.0,
        help="min general interval percent when --need uses general pool (default 5)",
    )
    args = parser.parse_args()

    try:
        raw = run_mmx_quota()
        summary = normalize(raw)
    except Exception as exc:  # noqa: BLE001 - CLI boundary
        payload = {"ok": False, "error": str(exc)}
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return 1

    ok, reason = evaluate(summary, args.need, args.min_remaining, args.min_percent)
    summary["gate_ok"] = ok
    summary["gate_reason"] = reason
    summary["need"] = args.need

    if args.json or args.need:
        print(json.dumps(summary, ensure_ascii=False, indent=2))
    else:
        print_human(summary)
        print(json.dumps({"gate_ok": True, "gate_reason": reason}, ensure_ascii=False))

    return 0 if ok else 2


if __name__ == "__main__":
    sys.exit(main())
