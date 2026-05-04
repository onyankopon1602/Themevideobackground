# ThemeVideoBackground for Vencord

Vencord plugin source for ThemeVideoBackground.

## Install

1. Copy the `themeVideoBackground` folder into:

```text
Vencord/src/userplugins/themeVideoBackground
```

2. Build and inject your Vencord development build:

```powershell
pnpm build --dev
pnpm inject
```

3. Enable `ThemeVideoBackground` in Vencord plugins.

## Notes

- Desktop Vencord supports local playback and automatic remote video caching.
- Vencord Web can only use direct public video URLs.
- The plugin does not force Discord transparency. The theme CSS must do that.

See `DOCS.md` for theme author documentation.
