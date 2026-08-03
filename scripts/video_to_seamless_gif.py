#!/usr/bin/env python3
"""Convert a short video to a seamless-loop GIF for calendar cover.

Pipeline:
1) Optional ping-pong (forward + reverse) so motion always returns to start
2) Or xfade crossfade of last segment onto first (one-way cyclic)
3) Palette-optimized GIF at calendar size (~500px wide)

Usage:
  python scripts/video_to_seamless_gif.py --in path.mp4 --out public/.../05.gif
  python scripts/video_to_seamless_gif.py --in path.mp4 --out out.gif --mode pingpong
  python scripts/video_to_seamless_gif.py --in path.mp4 --out out.gif --mode xfade --xfade 0.45
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


def run(cmd: list[str]) -> None:
	print("+", " ".join(cmd), flush=True)
	subprocess.run(cmd, check=True)


def probe_duration(path: Path) -> float:
	out = subprocess.check_output(
		[
			"ffprobe",
			"-v",
			"error",
			"-show_entries",
			"format=duration",
			"-of",
			"json",
			str(path),
		],
		text=True,
	)
	data = json.loads(out)
	return float(data["format"]["duration"])


def main() -> int:
	ap = argparse.ArgumentParser()
	ap.add_argument("--in", dest="inp", required=True, type=Path)
	ap.add_argument("--out", dest="out", required=True, type=Path)
	ap.add_argument(
		"--mode",
		choices=("pingpong", "xfade", "both"),
		default="both",
		help="pingpong=forward+reverse; xfade=blend end→start; both=pingpong then light xfade",
	)
	ap.add_argument("--xfade", type=float, default=0.4, help="crossfade seconds")
	ap.add_argument("--width", type=int, default=500)
	ap.add_argument("--fps", type=int, default=12)
	ap.add_argument("--max-colors", type=int, default=160)
	ap.add_argument(
		"--max-seconds",
		type=float,
		default=4.0,
		help="trim source before loop build (calendar-sized loops)",
	)
	args = ap.parse_args()

	if not args.inp.is_file():
		print(f"missing input: {args.inp}", file=sys.stderr)
		return 1
	if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
		print("ffmpeg/ffprobe required", file=sys.stderr)
		return 1

	args.out.parent.mkdir(parents=True, exist_ok=True)

	with tempfile.TemporaryDirectory(prefix="seamless-gif-") as td:
		td_path = Path(td)
		src = td_path / "src.mp4"
		# normalize + trim
		dur = min(probe_duration(args.inp), args.max_seconds)
		run(
			[
				"ffmpeg",
				"-y",
				"-i",
				str(args.inp),
				"-t",
				f"{dur:.3f}",
				"-an",
				"-vf",
				f"scale={args.width}:-2:flags=lanczos,fps={args.fps}",
				"-c:v",
				"libx264",
				"-pix_fmt",
				"yuv420p",
				"-crf",
				"18",
				str(src),
			]
		)
		work = src
		src_dur = probe_duration(src)

		if args.mode in ("pingpong", "both"):
			pp = td_path / "pingpong.mp4"
			# forward + reverse (drop last of reverse to avoid double hold)
			run(
				[
					"ffmpeg",
					"-y",
					"-i",
					str(work),
					"-filter_complex",
					"[0:v]split[f][r];[r]reverse,trim=start_frame=1,setpts=PTS-STARTPTS[rev];"
					"[f][rev]concat=n=2:v=1:a=0[v]",
					"-map",
					"[v]",
					"-an",
					"-c:v",
					"libx264",
					"-pix_fmt",
					"yuv420p",
					"-crf",
					"18",
					str(pp),
				]
			)
			work = pp
			src_dur = probe_duration(work)

		if args.mode in ("xfade", "both"):
			fade = min(args.xfade, max(0.15, src_dur * 0.12))
			if src_dur > fade * 2 + 0.2:
				xf = td_path / "xfade.mp4"
				# main body ends at (dur - fade); crossfade onto cloned head
				offset = max(0.05, src_dur - fade)
				run(
					[
						"ffmpeg",
						"-y",
						"-i",
						str(work),
						"-filter_complex",
						(
							f"[0:v]split[body][headsrc];"
							f"[body]trim=0:{offset:.3f},setpts=PTS-STARTPTS[main];"
							f"[headsrc]trim=0:{fade:.3f},setpts=PTS-STARTPTS[head];"
							f"[main][head]xfade=transition=fade:duration={fade:.3f}:offset={offset - fade:.3f}[v]"
						),
						"-map",
						"[v]",
						"-an",
						"-c:v",
						"libx264",
						"-pix_fmt",
						"yuv420p",
						"-crf",
						"18",
						str(xf),
					]
				)
				work = xf

		# GIF palette
		run(
			[
				"ffmpeg",
				"-y",
				"-i",
				str(work),
				"-vf",
				(
					f"fps={args.fps},scale={args.width}:-2:flags=lanczos,"
					f"split[s0][s1];"
					f"[s0]palettegen=max_colors={args.max_colors}:stats_mode=diff[p];"
					f"[s1][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle"
				),
				"-loop",
				"0",
				str(args.out),
			]
		)

	size = args.out.stat().st_size
	print(json.dumps({"ok": True, "out": str(args.out), "bytes": size}, ensure_ascii=False))
	return 0


if __name__ == "__main__":
	raise SystemExit(main())
