/**
 * @name ThemeVideoBackground
 * @author qbvi
 * @description Adds video background support for themes using CSS variables.
 * @version 1.0.0
 * @source https://github.com/onyankopon1602/Themevideobackground
 */

module.exports = class ThemeVideoBackground {
    constructor() {
        this.video = null;
        this.style = null;
        this.currentKey = "";
        this.currentSrc = "";
        this.syncRun = 0;
        this.interval = null;
        this.observer = null;
        this.videoId = "bd-theme-video-background";
        this.styleId = "bd-theme-video-background-style";
        this.videoVariables = ["--vc-video-bg", "--j1c-video-bg"];
        this.idVariables = ["--vc-video-bg-id", "--vc-video-bg-name", "--j1c-video-bg-id"];
    }

    start() {
        this.syncVideo();
        this.interval = window.setInterval(() => this.syncVideo(), 1500);
        this.observer = new MutationObserver(() => this.syncVideo());
        this.observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class", "style"]
        });
    }

    stop() {
        if (this.interval) window.clearInterval(this.interval);
        this.interval = null;
        this.observer?.disconnect();
        this.observer = null;
        this.removeVideo();
        this.removeStyle();
        this.currentKey = "";
        this.currentSrc = "";
    }

    readCssVariable(name) {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }

    parseCssUrl(value) {
        if (!value || value === "none") return "";

        const trimmed = value.trim();
        const urlMatch = trimmed.match(/^url\((.*)\)$/i);
        const raw = urlMatch?.[1] ?? trimmed;

        return raw.trim().replace(/^["']|["']$/g, "");
    }

    parseCssString(value) {
        if (!value || value === "none") return "";
        return value.trim().replace(/^["']|["']$/g, "");
    }

    getVideoSrc() {
        for (const variableName of this.videoVariables) {
            const src = this.parseCssUrl(this.readCssVariable(variableName));
            if (src) return src;
        }

        return "";
    }

    getVideoId() {
        for (const variableName of this.idVariables) {
            const id = this.parseCssString(this.readCssVariable(variableName));
            if (id) return id;
        }

        return "";
    }

    ensureStyle() {
        if (this.style?.isConnected) return;

        this.style = document.createElement("style");
        this.style.id = this.styleId;
        this.style.textContent = `
            #${this.videoId} {
                position: fixed !important;
                inset: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                object-fit: var(--vc-video-bg-fit, cover) !important;
                opacity: var(--vc-video-bg-opacity, 1) !important;
                pointer-events: none !important;
                z-index: var(--vc-video-bg-z-index, 0) !important;
            }
        `;
        document.head.append(this.style);
    }

    removeStyle() {
        this.style?.remove();
        this.style = null;
    }

    ensureVideo() {
        if (this.video?.isConnected) return this.video;

        this.video = document.createElement("video");
        this.video.id = this.videoId;
        this.video.autoplay = true;
        this.video.loop = true;
        this.video.muted = true;
        this.video.playsInline = true;
        this.video.disablePictureInPicture = true;
        this.video.setAttribute("aria-hidden", "true");
        this.video.addEventListener("loadeddata", () => {
            console.info("[ThemeVideoBackground] Video loaded", this.video?.currentSrc, this.video?.videoWidth, this.video?.videoHeight);
        });
        this.video.addEventListener("error", () => {
            console.error("[ThemeVideoBackground] Video error", this.video?.currentSrc, this.video?.error?.code, this.video?.error?.message);
        });

        document.body.prepend(this.video);
        return this.video;
    }

    removeVideo() {
        if (!this.video) return;

        this.video.pause();
        this.video.removeAttribute("src");
        this.video.load();
        this.video.remove();
        this.video = null;
    }

    async syncVideo() {
        const run = ++this.syncRun;
        const src = this.getVideoSrc();
        const themeId = this.getVideoId();
        const key = `${themeId}\n${src}`;

        if (!src) {
            this.currentKey = "";
            this.currentSrc = "";
            this.removeVideo();
            this.removeStyle();
            return;
        }

        this.ensureStyle();
        const element = this.ensureVideo();

        if (key !== this.currentKey) {
            this.currentKey = key;
            this.currentSrc = src;
            if (run !== this.syncRun) return;
            console.info("[ThemeVideoBackground] Using video source", this.currentSrc);
            element.src = this.currentSrc;
            element.load();
        }

        void element.play().catch(() => void 0);
    }
};
