# ThemeVideoBackground

ThemeVideoBackground is a Vencord and BetterDiscord plugin that lets themes define a looping video background through CSS variables.

This repository contains two platform versions:

- `vencord/`: Vencord version with local playback and automatic remote video caching.
- `betterdiscord/`: BetterDiscord version distributed as a single `.plugin.js` file.

Each platform folder contains:

- `user/`: installable user package and installation guide.
- `dev/`: developer package with theme documentation and examples.

Plugin metadata:

- Name: `ThemeVideoBackground`
- Author: `qbvi`
- Description: Adds video background support for themes using CSS variables.

Shared theme variables:

```css
:root {
  --vc-video-bg-id: "my-theme-id";
  --vc-video-bg: url("https://example.com/background.mp4");
  --vc-video-bg-fit: cover;
  --vc-video-bg-opacity: 1;
}
```

`--j1c-video-bg` is also supported as an alias.
