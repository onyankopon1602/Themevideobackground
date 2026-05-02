# ThemeVideoBackground for BetterDiscord - Developer Package

This package contains the BetterDiscord single-file plugin and a sample theme.

BetterDiscord plugins must be distributed as one `*.plugin.js` file with metadata at the top. This package follows that format.

Author: `qbvi`

Description: Adds video background support for themes using CSS variables.

Theme developers can add:

```css
:root {
  --vc-video-bg-id: "stable-theme-id";
  --vc-video-bg: url("https://example.com/background.mp4");
  --vc-video-bg-fit: cover;
  --vc-video-bg-opacity: 1;
  --vc-video-bg-z-index: 0;
}
```

Aliases:

```css
--j1c-video-bg: url("...");
--vc-video-bg-name: "cache-id";
--j1c-video-bg-id: "cache-id";
```

For shared themes, use a public direct video URL. Avoid local `file:///` URLs unless the theme is only for your own machine.

MP4 files must be compatible with Discord/Chromium. Use H.264 in `yuv420p` for best results.

The plugin is intentionally neutral. It only adds the video element and does not force transparency, blur, overlays, fallback colors, or app z-index rules. Theme authors must handle those visual choices in their own CSS.
