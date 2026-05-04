# ThemeVideoBackground

ThemeVideoBackground lets Discord themes define a looping video background with CSS variables.

This repository contains two platform folders:

- `vencord/` - Vencord userplugin source.
- `betterdiscord/` - BetterDiscord single-file plugin.

There are no separate user/dev packages anymore. Each folder contains the plugin, a README, and documentation.

## Theme Variables

```css
:root {
  --vc-video-bg-id: "my-theme-id";
  --vc-video-bg: url("https://example.com/background.mp4");
  --vc-video-bg-fit: cover;
  --vc-video-bg-opacity: 1;
  --vc-video-bg-z-index: 0;
}
```

Aliases are also supported:

```css
--j1c-video-bg: url("...");
--vc-video-bg-name: "my-theme-id";
--j1c-video-bg-id: "my-theme-id";
```

The plugin is visually neutral: it only creates the video element. Themes must handle transparency, overlays, blur, and colors themselves.
