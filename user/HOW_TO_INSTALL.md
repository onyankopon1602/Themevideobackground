# How To Install

This plugin is made for a Vencord dev installation.

## 1. Install Vencord Dev

Install the required tools first:

- Git: https://git-scm.com/downloads
- Node.js: https://nodejs.org/
- pnpm: https://pnpm.io/installation

Check that they work:

```powershell
git --version
node --version
pnpm --version
```

Clone Vencord:

```powershell
cd "$HOME\Documents"
git clone https://github.com/Vendicated/Vencord
cd Vencord
```

Install dependencies:

```powershell
pnpm install --frozen-lockfile
```

Build the dev version:

```powershell
pnpm build --dev
```

Inject the custom build into Discord:

```powershell
pnpm inject
```

The Vencord installer will open. Select your Discord install and patch it.

## 2. Install This Plugin

1. Extract this ZIP.

2. Copy the `themeVideoBackground` folder to your Vencord user plugins folder:

```text
Vencord/src/userplugins/themeVideoBackground
```

3. Open a terminal in your Vencord folder:

```powershell
cd "$HOME\Documents\Vencord"
```

4. Build Vencord:

```powershell
pnpm build --dev
```

5. If your Discord uses another Vencord data folder, copy the generated `dist` files to that active Vencord `dist` folder.

6. Restart Discord.

7. Open Vencord settings in Discord and enable:

```text
ThemeVideoBackground
```

8. Install a theme that defines a video variable, for example:

```css
:root {
  --vc-video-bg-id: "my-theme";
  --vc-video-bg: url("https://example.com/background.mp4");
}
```

Remote videos are downloaded automatically into:

```text
Vencord/themes/video-backgrounds/<id>/
```

Local `file:///` videos are played directly and do not create a cache folder.

Official Vencord dev install documentation:

```text
https://docs.vencord.dev/installing/
```
