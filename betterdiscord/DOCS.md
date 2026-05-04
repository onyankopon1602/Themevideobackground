# BetterDiscord Theme Documentation

ThemeVideoBackground reads CSS variables from active BetterDiscord themes.

## Minimal Theme Example

```css
/**
 * @name Example Video Theme
 * @author your-name
 * @description Example theme using ThemeVideoBackground.
 * @version 1.0.0
 */

:root {
  --vc-video-bg-id: "example-video-theme";
  --vc-video-bg: url("https://example.com/background.mp4");
  --vc-video-bg-fit: cover;
  --vc-video-bg-opacity: 1;
  --vc-video-bg-z-index: 0;
}

body,
#app-mount {
  background: transparent !important;
}
```

## Supported Variables

```css
--vc-video-bg: url("...");
--j1c-video-bg: url("...");
--vc-video-bg-id: "cache-id";
--vc-video-bg-name: "cache-id";
--j1c-video-bg-id: "cache-id";
--vc-video-bg-fit: cover;
--vc-video-bg-opacity: 1;
--vc-video-bg-z-index: 0;
```

## Recommended Video Format

- MP4 with H.264 video.
- `yuv420p` pixel format.
- AAC audio or no audio.
- Direct public URLs for published themes.

The plugin is neutral. It creates the video element only. Theme authors should implement transparency, panels, buttons, overlays, blur, and colors in their theme CSS.
