# ThemeVideoBackground - Theme Developer Guide

The plugin reads CSS variables provided by the theme.

Recommended example:

```css
:root {
  --vc-video-bg-id: "stable-theme-name";
  --vc-video-bg: url("https://example.com/background.mp4");
  --vc-video-bg-fit: cover;
  --vc-video-bg-opacity: 1;
  --vc-video-bg-z-index: 0;
}
```

Supported variables:

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

Behavior:

- `https://...` and `http://...`: the video is downloaded automatically to `Vencord/themes/video-backgrounds/<id>/`.
- `file:///...`: the local video is played directly, without creating a cache folder.
- `data:` and `blob:`: the source is passed through unchanged.

Recommended formats:

- MP4 is supported, but it must use codecs supported by Discord/Chromium.
- For best MP4 compatibility, use H.264 video in `yuv420p` pixel format, with AAC audio or no audio.
- MP4 files using unsupported profiles or pixel formats, such as H.264 `yuv444p`, may fail to load even though the extension is `.mp4`.
- WebM VP8/VP9.
- Avoid very large files; compress videos before publishing.

The plugin is intentionally neutral. It only adds the video element and does not force transparency, blur, overlays, fallback colors, or app z-index rules. Theme authors must handle those visual choices in their own CSS.
