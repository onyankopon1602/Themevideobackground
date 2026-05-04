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
        this.currentBlobUrl = "";
        this.syncRun = 0;
        this.fallbackInterval = null;
        this.syncTimer = null;
        this.observer = null;
        this.videoId = "bd-theme-video-background";
        this.styleId = "bd-theme-video-background-style";
        this.videoVariables = ["--vc-video-bg", "--j1c-video-bg"];
        this.idVariables = ["--vc-video-bg-id", "--vc-video-bg-name", "--j1c-video-bg-id"];
    }

    start() {
        this.scheduleSync(0);
        this.fallbackInterval = window.setInterval(() => this.scheduleSync(), 10000);
        this.observer = new MutationObserver(() => this.scheduleSync());

        this.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class", "style"]
        });
        this.observe(document.head, {
            childList: true,
            subtree: true,
            characterData: true
        });
        this.observe(document.body, {
            attributes: true,
            attributeFilter: ["class", "style"]
        });
    }

    stop() {
        if (this.fallbackInterval) window.clearInterval(this.fallbackInterval);
        if (this.syncTimer) window.clearTimeout(this.syncTimer);
        this.fallbackInterval = null;
        this.syncTimer = null;
        this.observer?.disconnect();
        this.observer = null;
        this.removeVideo();
        this.removeStyle();
        this.currentKey = "";
        this.currentSrc = "";
        this.revokeBlobUrl();
    }

    observe(target, options) {
        if (!target) return;
        this.observer.observe(target, options);
    }

    scheduleSync(delay = 60) {
        if (this.syncTimer) window.clearTimeout(this.syncTimer);

        this.syncTimer = window.setTimeout(() => {
            this.syncTimer = null;
            void this.syncVideo();
        }, delay);
    }

    readCssVariable(name) {
        for (const element of [document.documentElement, document.body, document.querySelector("#app-mount")]) {
            if (!element) continue;

            const value = getComputedStyle(element).getPropertyValue(name).trim();
            if (value) return value;
        }

        return "";
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
        if (!document.head) return;

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
        if (!document.body) return null;

        this.video = document.createElement("video");
        this.video.id = this.videoId;
        this.video.autoplay = true;
        this.video.loop = true;
        this.video.muted = true;
        this.video.preload = "auto";
        this.video.playsInline = true;
        this.video.disablePictureInPicture = true;
        this.video.setAttribute("aria-hidden", "true");
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

    revokeBlobUrl() {
        if (!this.currentBlobUrl) return;

        URL.revokeObjectURL(this.currentBlobUrl);
        this.currentBlobUrl = "";
    }

    localPathFromFileUrl(src) {
        if (!src.startsWith("file:///")) return "";

        try {
            return decodeURIComponent(src.replace(/^file:\/\/\//, ""));
        } catch {
            return src.replace(/^file:\/\/\//, "");
        }
    }

    isWindowsPath(src) {
        return /^[a-zA-Z]:[\\/]/.test(src);
    }

    async resolveVideoSource(src) {
        const localPath = this.localPathFromFileUrl(src) || (this.isWindowsPath(src) ? src : "");
        if (!localPath) return src;

        try {
            const fs = require("fs");
            const path = require("path");
            const bytes = fs.readFileSync(localPath);
            const extension = path.extname(localPath).toLowerCase();
            const type = extension === ".webm" ? "video/webm" : extension === ".mov" ? "video/quicktime" : "video/mp4";
            this.revokeBlobUrl();
            this.currentBlobUrl = URL.createObjectURL(new Blob([bytes], { type }));
            return this.currentBlobUrl;
        } catch (error) {
            console.error("[ThemeVideoBackground] Failed to read local video", localPath, error);
            return src;
        }
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
            this.revokeBlobUrl();
            return;
        }

        this.ensureStyle();
        const element = this.ensureVideo();
        if (!this.style || !element) return;

        if (key !== this.currentKey) {
            this.currentKey = key;
            this.currentSrc = await this.resolveVideoSource(src);
            if (run !== this.syncRun) return;
            element.src = this.currentSrc;
            element.load();
        }

        void element.play().catch(() => void 0);
    }
};
