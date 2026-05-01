# ThemeVideoBackground

ThemeVideoBackground is a Vencord plugin that lets themes define a looping video background through CSS variables.

The repository contains two packages:

- `user/`: plugin package with installation instructions for users.
- `dev/`: plugin package with documentation and examples for theme developers.

Plugin metadata:

- Name: `ThemeVideoBackground`
- Author: `qbvi`
- Description: Adds video background support for themes using CSS variables, with local playback and automatic remote video caching.

Supported theme variables:

```css
:root {
  --vc-video-bg-id: "my-theme-id";
  --vc-video-bg: url("https://example.com/background.mp4");
  --vc-video-bg-fit: cover;
  --vc-video-bg-opacity: 1;
}
```

`--j1c-video-bg` is also supported as an alias.
