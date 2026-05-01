# How To Install

This is the BetterDiscord version of `ThemeVideoBackground`.

1. Install BetterDiscord from:

```text
https://betterdiscord.app/
```

2. Open the BetterDiscord plugins folder:

```text
C:\Users\adres\AppData\Roaming\BetterDiscord\plugins
```

3. Copy this file into that folder:

```text
ThemeVideoBackground.plugin.js
```

4. Restart Discord or reload BetterDiscord.

5. Open BetterDiscord settings and enable:

```text
ThemeVideoBackground
```

6. Install a theme that defines a video variable:

```css
:root {
  --vc-video-bg-id: "my-theme";
  --vc-video-bg: url("https://example.com/background.mp4");
}
```

`--j1c-video-bg` is also supported as an alias.

The BetterDiscord version plays the video URL directly in Discord. For shared themes, use a public direct `.mp4` or `.webm` URL.

MP4 files are supported when Discord/Chromium can decode them. For best compatibility, use MP4 with H.264 video in `yuv420p` pixel format, with AAC audio or no audio.
