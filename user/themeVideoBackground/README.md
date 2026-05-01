# ThemeVideoBackground

Lets a theme define a video background with a CSS variable.

```css
:root {
  --vc-video-bg-id: "my-theme-id";
  --vc-video-bg: url("https://example.com/background.mp4");
  --vc-video-bg-fit: cover;
  --vc-video-bg-opacity: 1;
}
```

`--j1c-video-bg` is also supported as an alias.

Remote `http://` and `https://` videos are downloaded automatically to:

```text
Vencord/themes/video-backgrounds/<vc-video-bg-id>/
```

No folder is created for local `file:///` videos. If no `--vc-video-bg-id` is set, the plugin derives one from the video URL.

The plugin accepts `.mp4` video URLs, but Discord can only play MP4 files encoded with codecs supported by Chromium. For best compatibility, use MP4 with H.264 video in `yuv420p` pixel format, with AAC audio or no audio. MP4 files using unsupported profiles or pixel formats, such as H.264 `yuv444p`, may fail to load even though the file extension is `.mp4`.

For theme developers, WebM VP8/VP9 is also supported. Very large files should be compressed before publishing.

The video is injected as a muted, looping, autoplaying `<video>` behind Discord. Keep your theme's main surfaces transparent so the video can be seen.
