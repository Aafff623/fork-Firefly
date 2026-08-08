# Example: framework-like patch release

Fictional library `acme/widgets`. Use as tone/structure reference — not a real release.

**Tag**: `v2.4.1`  
**Release title**: `v2.4.1`

```markdown
## What's new

Patch release focused on hydration edge cases and a small DX improvement for preview servers.

### Fixed

- Fixed `onerror` not firing when hydrating a failed boundary; `reset()` works again after recovery (#18556)
- Preserved `<select>` selection when spread attributes omit `value` (#18561)

### Added

- Added `preview --background` so preview servers return after ready (scripts and coding agents) (#17174)

### Changed

- Widened prerender `render()` return type to allow incremental-build metadata (#17084)

### Credits

- Thanks @matthewp for #17174
- Thanks @ghost for #18556

**Full Changelog**: https://github.com/acme/widgets/compare/v2.4.0...v2.4.1
```

**Why this shape**

- Changesets / Astro / Svelte style: curated bullets + PR links
- No install banner (library, not CLI)
- No Assets
- Empty Breaking/Migration/Security sections omitted
