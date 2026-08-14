#!/usr/bin/env python3
"""Shim. Real script: .cursor/skills/_shared/scripts/upload_r2.py"""

from __future__ import annotations

import runpy
from pathlib import Path

_target = Path(__file__).resolve().parents[2] / "_shared" / "scripts" / "upload_r2.py"
runpy.run_path(str(_target), run_name="__main__")
