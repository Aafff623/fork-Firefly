#!/usr/bin/env python3
"""Generate procedural weather overlay GIFs for clock sky layer.

Used when video quota is exhausted; outputs transparent-ish overlays
for mix-blend-mode: screen in SurpriseClock / LayeredClock.
"""

from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "assets" / "images" / "widgets" / "clock"
W, H, FPS, DUR = 480, 270, 10, 4


def run(cmd: list[str]) -> None:
	print("+", " ".join(cmd), flush=True)
	subprocess.run(cmd, check=True)


def to_gif(src_mp4: Path, out_gif: Path) -> None:
	run(
		[
			"ffmpeg",
			"-y",
			"-i",
			str(src_mp4),
			"-vf",
			f"fps={FPS},scale={W}:{H}:flags=lanczos,split[s0][s1];"
			f"[s0]palettegen=max_colors=128:stats_mode=diff[p];"
			f"[s1][p]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle",
			"-loop",
			"0",
			str(out_gif),
		]
	)


def cloudy() -> None:
	tmp = OUT_DIR / "_cloudy.mp4"
	run(
		[
			"ffmpeg",
			"-y",
			"-f",
			"lavfi",
			"-i",
			f"color=c=black@0.0:s={W}x{H}:d={DUR}:r={FPS}",
			"-vf",
			"geq=r='0':g='0':b='0':a='if(lt(mod(X+T*18,W),W*0.55),180,0)'",
			"-c:v",
			"libx264",
			"-pix_fmt",
			"yuva420p",
			str(tmp),
		]
	)
	# softer multi-blob clouds via layered geq is heavy; use drawn clouds on gray bg for screen blend
	run(
		[
			"ffmpeg",
			"-y",
			"-f",
			"lavfi",
			"-i",
			f"color=c=0x8899aa:s={W}x{H}:d={DUR}:r={FPS}",
			"-vf",
			"format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(gt(180-r(X,Y),0),120,0)'",
			"-c:v",
			"libx264",
			"-pix_fmt",
			"yuv420p",
			str(tmp),
		]
	)
	to_gif(tmp, OUT_DIR / "weather-cloudy.gif")
	tmp.unlink(missing_ok=True)


def rain() -> None:
	tmp = OUT_DIR / "_rain.mp4"
	run(
		[
			"ffmpeg",
			"-y",
			"-f",
			"lavfi",
			"-i",
			f"color=c=black:s={W}x{H}:d={DUR}:r={FPS}",
			"-vf",
			"format=gray,geq=lum='if(mod(X+Y+T*40,14)<2,220,16)'",
			"-c:v",
			"libx264",
			"-pix_fmt",
			"yuv420p",
			str(tmp),
		]
	)
	to_gif(tmp, OUT_DIR / "weather-rain.gif")
	tmp.unlink(missing_ok=True)


def snow() -> None:
	tmp = OUT_DIR / "_snow.mp4"
	run(
		[
			"ffmpeg",
			"-y",
			"-f",
			"lavfi",
			"-i",
			f"color=c=black:s={W}x{H}:d={DUR}:r={FPS}",
			"-vf",
			"format=gray,geq=lum='if(lt(hypot(mod(X+T*8,W)-W/2,mod(Y+T*22,H)-H/2),3),240,20)'",
			"-c:v",
			"libx264",
			"-pix_fmt",
			"yuv420p",
			str(tmp),
		]
	)
	to_gif(tmp, OUT_DIR / "weather-snow.gif")
	tmp.unlink(missing_ok=True)


def fog() -> None:
	tmp = OUT_DIR / "_fog.mp4"
	run(
		[
			"ffmpeg",
			"-y",
			"-f",
			"lavfi",
			"-i",
			f"color=c=0xdde4ee:s={W}x{H}:d={DUR}:r={FPS}",
			"-vf",
			f"format=rgba,crop={W}:{H//2}:0:{H//2},geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(gt(Y,0),140,0)'",
			"-c:v",
			"libx264",
			"-pix_fmt",
			"yuv420p",
			str(tmp),
		]
	)
	to_gif(tmp, OUT_DIR / "weather-fog.gif")
	tmp.unlink(missing_ok=True)


def thunder() -> None:
	tmp = OUT_DIR / "_thunder.mp4"
	run(
		[
			"ffmpeg",
			"-y",
			"-f",
			"lavfi",
			"-i",
			f"color=c=0x223344:s={W}x{H}:d={DUR}:r={FPS}",
			"-vf",
			"geq=r='r(X,Y)+if(between(mod(T,4),0.05,0.15),80,0)':g='g(X,Y)+if(between(mod(T,4),0.05,0.15),80,0)':b='b(X,Y)+if(between(mod(T,4),0.05,0.15),100,0)'",
			"-c:v",
			"libx264",
			"-pix_fmt",
			"yuv420p",
			str(tmp),
		]
	)
	to_gif(tmp, OUT_DIR / "weather-thunder.gif")
	tmp.unlink(missing_ok=True)


def main() -> int:
	if not shutil.which("ffmpeg"):
		print("ffmpeg required", file=sys.stderr)
		return 1
	OUT_DIR.mkdir(parents=True, exist_ok=True)
	for fn in (cloudy, rain, snow, fog, thunder):
		print(f"\n== {fn.__name__} ==")
		fn()
	print("\nDone:", OUT_DIR)
	return 0


if __name__ == "__main__":
	raise SystemExit(main())
