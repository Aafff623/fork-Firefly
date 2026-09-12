# Banner title glyph artwork

`home-welcome-to-threetwoa/` contains the transparent glyph artwork used by the
homepage title `Welcome to threetwoa's blog`. The manifest has one entry for
each of the 24 non-space character positions, including repeated letters and
the apostrophe. It uses the recovered reference artwork where available and
local generated artwork for the missing positions. The homepage controller
keeps the exact text layer underneath and only replaces the hovered character's
visual layer with its corresponding image.

The older `home-32a/` WebP set is retained as a historical asset set and is no
longer selected by the homepage manifest. The previous `home-threetwoa/` SVG
set is also no longer selected.

Article banner titles deliberately have no asset directory. They use the local,
no-network Sonnet-style special glyph renderer instead, so every article title
works without per-post artwork.
