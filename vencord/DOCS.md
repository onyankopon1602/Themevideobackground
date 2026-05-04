# Vencord Theme Documentation

ThemeVideoBackground reads CSS variables from active themes.

## Minimal Theme Example

```css
:root {
  --vc-video-bg-id: "stable-theme-id";
  --vc-video-bg: url("https://example.com/background.mp4");
  --vc-video-bg-fit: cover;
  --vc-video-bg-opacity: 1;
  --vc-video-bg-z-index: 0;
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

## Source Behavior

- `https://...` / `http://...`: desktop Vencord downloads and caches the video.
- `file:///...`: desktop Vencord plays the local video directly.
- `data:` / `blob:`: passed through unchanged.
- Vencord Web should use public direct URLs only.

## Recommended Video Format

- MP4 with H.264 video.
- `yuv420p` pixel format.
- AAC audio or no audio.
- Keep file size reasonable.

The plugin is neutral. It does not add transparency, blur, overlays, fallback colors, or app z-index rules. Theme authors should implement those in their own CSS.
