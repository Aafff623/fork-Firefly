#!/usr/bin/env python3
"""Advisory lock so parallel agents do not burn multiple video slots.

Also tracks submit count so agents cannot "accidentally" call generate_video twice
while intending to poll.

Usage:
  python acquire_video_slot.py acquire --owner agent-c
  python acquire_video_slot.py mark-submit --owner agent-c --task-id <id>
  python acquire_video_slot.py release --owner agent-c
  python acquire_video_slot.py status

Lock file: <Firefly>/tmp/minimax/video.slot.lock
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]  # Firefly/
LOCK = ROOT / "tmp" / "minimax" / "video.slot.lock"
QUOTA = Path(__file__).resolve().parent / "check_quota.py"
TTL_SEC = 30 * 60
DEFAULT_MAX_SUBMITS = 1


def read_lock() -> dict | None:
    if not LOCK.exists():
        return None
    try:
        return json.loads(LOCK.read_text(encoding="utf-8"))
    except Exception:
        return None


def save_lock(payload: dict) -> None:
    LOCK.parent.mkdir(parents=True, exist_ok=True)
    LOCK.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def expired(data: dict) -> bool:
    return (time.time() - float(data.get("acquired_at") or 0)) > float(
        data.get("ttl_sec") or TTL_SEC
    )


def quota_ok() -> tuple[bool, dict]:
    proc = subprocess.run(
        [sys.executable, str(QUOTA), "--need", "video", "--min-remaining", "1", "--json"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )
    try:
        data = json.loads(proc.stdout or "{}")
    except json.JSONDecodeError:
        data = {"ok": False, "error": "bad quota json", "raw": (proc.stdout or "")[:300]}
    return proc.returncode == 0 and bool(data.get("gate_ok")), data


def cmd_status() -> int:
    data = read_lock()
    if not data:
        print(json.dumps({"locked": False}, ensure_ascii=False, indent=2))
        return 0
    alive = not expired(data)
    print(
        json.dumps(
            {"locked": alive, "stale": not alive, "lock": data},
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


def cmd_acquire(owner: str, max_submits: int) -> int:
    data = read_lock()
    if data and not expired(data) and data.get("owner") != owner:
        print(
            json.dumps(
                {"ok": False, "error": "slot held by another owner", "lock": data},
                ensure_ascii=False,
                indent=2,
            )
        )
        return 2

    ok, quota = quota_ok()
    if not ok:
        print(
            json.dumps(
                {"ok": False, "error": "video quota gate failed", "quota": quota},
                ensure_ascii=False,
                indent=2,
            )
        )
        return 2

    payload = {
        "owner": owner,
        "acquired_at": time.time(),
        "ttl_sec": TTL_SEC,
        "max_submits": max_submits,
        "submit_count": 0,
        "task_ids": [],
        "note": "After generate_video, run mark-submit. Only query_video_generation until release.",
    }
    save_lock(payload)
    print(
        json.dumps(
            {"ok": True, "owner": owner, "lock": str(LOCK), "quota": quota, "slot": payload},
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


def cmd_mark_submit(owner: str, task_id: str) -> int:
    data = read_lock()
    if not data or expired(data):
        print(json.dumps({"ok": False, "error": "no active lock — acquire first"}))
        return 2
    if data.get("owner") != owner:
        print(
            json.dumps(
                {"ok": False, "error": "owner mismatch", "lock": data},
                ensure_ascii=False,
                indent=2,
            )
        )
        return 2

    max_submits = int(data.get("max_submits") or DEFAULT_MAX_SUBMITS)
    count = int(data.get("submit_count") or 0)
    if count >= max_submits:
        print(
            json.dumps(
                {
                    "ok": False,
                    "error": (
                        f"submit_count={count} already reached max_submits={max_submits}. "
                        "Do NOT call generate_video again — use query_video_generation only."
                    ),
                    "lock": data,
                },
                ensure_ascii=False,
                indent=2,
            )
        )
        return 2

    ids = list(data.get("task_ids") or [])
    if task_id and task_id not in ids:
        ids.append(task_id)
    data["submit_count"] = count + 1
    data["task_ids"] = ids
    data["last_submit_at"] = time.time()
    save_lock(data)
    print(
        json.dumps(
            {
                "ok": True,
                "owner": owner,
                "submit_count": data["submit_count"],
                "max_submits": max_submits,
                "task_ids": ids,
                "next": "ONLY query_video_generation until success, then fetch_media, then release",
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


def cmd_release(owner: str) -> int:
    data = read_lock()
    if not data:
        print(json.dumps({"ok": True, "released": False, "reason": "no lock"}))
        return 0
    if data.get("owner") != owner and not expired(data):
        print(
            json.dumps(
                {"ok": False, "error": "owner mismatch", "lock": data},
                ensure_ascii=False,
                indent=2,
            )
        )
        return 2
    LOCK.unlink(missing_ok=True)
    print(json.dumps({"ok": True, "released": True, "owner": owner, "prior": data}, ensure_ascii=False))
    return 0


def main() -> int:
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

    p = argparse.ArgumentParser()
    p.add_argument(
        "action",
        choices=["acquire", "mark-submit", "release", "status"],
    )
    p.add_argument("--owner", default="agent")
    p.add_argument("--task-id", default="", help="required for mark-submit")
    p.add_argument(
        "--max-submits",
        type=int,
        default=DEFAULT_MAX_SUBMITS,
        help="max generate_video calls while holding slot (default 1)",
    )
    args = p.parse_args()

    if args.action == "status":
        return cmd_status()
    if args.action == "acquire":
        return cmd_acquire(args.owner, args.max_submits)
    if args.action == "mark-submit":
        if not args.task_id:
            print(json.dumps({"ok": False, "error": "--task-id required for mark-submit"}))
            return 1
        return cmd_mark_submit(args.owner, args.task_id)
    return cmd_release(args.owner)


if __name__ == "__main__":
    sys.exit(main())
