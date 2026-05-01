# ThemeVideoBackground for BetterDiscord

ThemeVideoBackground adds video background support for BetterDiscord themes using CSS variables.

Author: `qbvi`

Description: Adds video background support for themes using CSS variables.

Supported variables:

```css
:root {
  --vc-video-bg-id: "my-theme-id";
  --vc-video-bg: url("https://example.com/background.mp4");
  --vc-video-bg-fit: cover;
  --vc-video-bg-opacity: 1;
}
```

`--j1c-video-bg` is also supported.

The plugin only injects video and transparency styles when a theme actually defines a video variable, so normal themes are not affected.
