# ThemeVideoBackground - User Version

This package contains the Vencord plugin `ThemeVideoBackground`.

Installation in a Vencord dev setup:

1. Copy the `themeVideoBackground` folder to:

```text
Vencord/src/userplugins/themeVideoBackground
```

2. From the Vencord folder, run:

```powershell
corepack pnpm build --dev
```

3. If needed, copy the generated `dist` folder to the Vencord folder used by Discord.

4. Enable the `ThemeVideoBackground` plugin in Discord.

For themes, add this to the CSS:

```css
:root {
  --vc-video-bg-id: "my-theme";
  --vc-video-bg: url("file:///C:/path/video.mp4");
  --vc-video-bg-fit: cover;
  --vc-video-bg-opacity: 1;
}
```

`https://...` URLs are downloaded automatically to `Vencord/themes/video-backgrounds/<id>/`.
`file:///...` paths are played directly and do not create a cache folder.

MP4 files are supported when Discord/Chromium can decode them. For best compatibility, use MP4 with H.264 video in `yuv420p` pixel format, with AAC audio or no audio.
