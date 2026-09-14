# Banner title glyph artwork

`home-welcome-to-threetwoa/` contains the transparent glyph artwork used by the
homepage title `Welcome to threetwoa's blog`. The manifest has one entry for
each of the 24 non-space character positions, including repeated letters and
the apostrophe. It uses the recovered reference artwork where available and
local generated artwork for the missing positions. The homepage controller
keeps the exact text layer underneath and only replaces the hovered character's
visual layer with its corresponding image.

Every active homepage position now has two visual variants. The controller
randomly chooses a variant on each new hover and avoids immediately repeating
the previous choice for that position. The second set is stored beside the
original assets with descriptive names such as `e-shell.webp`, `o-kitten.webp`,
and `b-bunny-jam.webp`.

All glyph artwork ships as WebP (quality 85, longest edge capped at 512px;
original PNG masters stay out of the repository) to keep the homepage preload
tens of megabytes lighter. The banner only renders each glyph at roughly
4x-retina scale, so the cap stays visually lossless at display size.

The older `home-32a/` WebP set is retained as a historical asset set and is no
longer selected by the homepage manifest. The previous `home-threetwoa/` SVG
set is also no longer selected.

Article banner titles deliberately have no asset directory. They use the local,
no-network Sonnet-style special glyph renderer instead, so every article title
works without per-post artwork.
