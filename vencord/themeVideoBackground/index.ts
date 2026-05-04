/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import definePlugin, { PluginNative } from "@utils/types";

const Native = IS_WEB ? undefined : VencordNative.pluginHelpers.ThemeVideoBackground as PluginNative<typeof import("./native")>;

const VIDEO_ID = "vc-theme-video-background";
const STYLE_ID = "vc-theme-video-background-style";
const VARIABLE_NAMES = ["--vc-video-bg", "--j1c-video-bg"];
const ID_VARIABLE_NAMES = ["--vc-video-bg-id", "--vc-video-bg-name", "--j1c-video-bg-id"];

let video: HTMLVideoElement | null = null;
let style: HTMLStyleElement | null = null;
let currentKey = "";
let currentResolvedSrc = "";
let syncRun = 0;
let fallbackInterval: number | undefined;
let syncTimer: number | undefined;
let observer: MutationObserver | undefined;
let loggedMissingSrc = false;
let loggedMissingDom = false;

function readCssVariable(name: string) {
    for (const element of [document.documentElement, document.body, document.querySelector("#app-mount")]) {
        if (!element) continue;

        const value = getComputedStyle(element).getPropertyValue(name).trim();
        if (value) return value;
    }

    return "";
}

function parseCssUrl(value: string) {
    if (!value || value === "none") return "";

    const trimmed = value.trim();
    const urlMatch = trimmed.match(/^url\((.*)\)$/i);
    const raw = urlMatch?.[1] ?? trimmed;

    return raw.trim().replace(/^["']|["']$/g, "");
}

function parseCssString(value: string) {
    if (!value || value === "none") return "";
    return value.trim().replace(/^["']|["']$/g, "");
}

function getVideoSrc() {
    for (const variableName of VARIABLE_NAMES) {
        const src = parseCssUrl(readCssVariable(variableName));
        if (src) return src;
    }

    return "";
}

function getVideoId() {
    for (const variableName of ID_VARIABLE_NAMES) {
        const id = parseCssString(readCssVariable(variableName));
        if (id) return id;
    }

    return "";
}

function ensureStyle() {
    if (style?.isConnected) return;
    if (!document.head) return;

    style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
        #${VIDEO_ID} {
            position: fixed !important;
            inset: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            object-fit: var(--vc-video-bg-fit, cover) !important;
            opacity: var(--vc-video-bg-opacity, 1) !important;
            pointer-events: none !important;
            z-index: var(--vc-video-bg-z-index, 0) !important;
            display: block !important;
            background: transparent !important;
            background-color: transparent !important;
            border: 0 !important;
            outline: 0 !important;
            box-shadow: none !important;
        }
    `;
    document.head.append(style);
}

function removeStyle() {
    style?.remove();
    style = null;
}

function ensureVideo() {
    if (video?.isConnected) return video;
    if (!document.body) return null;

    video = document.createElement("video");
    video.id = VIDEO_ID;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.preload = "auto";
    video.playsInline = true;
    video.disablePictureInPicture = true;
    video.setAttribute("aria-hidden", "true");
    video.style.background = "transparent";
    video.style.pointerEvents = "none";
    video.addEventListener("error", () => {
        console.error("[ThemeVideoBackground] Video error", video?.currentSrc, video?.error?.code, video?.error?.message);
        if (video) video.style.display = "none";
    });
    video.addEventListener("loadeddata", () => {
        if (video) video.style.display = "";
    });

    document.body.prepend(video);
    return video;
}

async function resolveVideoSrc(src: string, themeId: string) {
    if (!Native) return src;

    try {
        return await Native.resolveVideoSource(src, themeId);
    } catch (error) {
        console.error("[ThemeVideoBackground] Failed to resolve video source", error);
        return src;
    }
}

async function syncVideo() {
    const run = ++syncRun;
    const src = getVideoSrc();
    const themeId = getVideoId();
    const key = `${themeId}\n${src}`;

    if (!src) {
        if (!loggedMissingSrc) {
            loggedMissingSrc = true;
            console.info("[ThemeVideoBackground] Waiting for --vc-video-bg or --j1c-video-bg in the active theme");
        }

        currentKey = "";
        currentResolvedSrc = "";
        if (video) {
            video.pause();
            video.removeAttribute("src");
            video.load();
            video.remove();
            video = null;
        }
        removeStyle();
        return;
    }

    loggedMissingSrc = false;

    ensureStyle();
    const element = ensureVideo();
    if (!style || !element) {
        if (!loggedMissingDom) {
            loggedMissingDom = true;
            console.info("[ThemeVideoBackground] Waiting for document head/body before injecting the video");
        }
        return;
    }

    loggedMissingDom = false;

    element.style.display = "";

    if (key !== currentKey) {
        currentKey = key;
        currentResolvedSrc = await resolveVideoSrc(src, themeId);
        if (run !== syncRun) return;
        element.src = currentResolvedSrc;
        element.load();
    }

    void element.play().catch(() => void 0);
}

function cleanup() {
    window.clearInterval(fallbackInterval);
    window.clearTimeout(syncTimer);
    fallbackInterval = undefined;
    syncTimer = undefined;
    observer?.disconnect();
    observer = undefined;

    video?.remove();
    video = null;
    removeStyle();
    currentKey = "";
    currentResolvedSrc = "";
    void Native?.stopVideoServer().catch(() => void 0);
}

function scheduleSync(delay = 60) {
    window.clearTimeout(syncTimer);
    syncTimer = window.setTimeout(() => {
        syncTimer = undefined;
        void syncVideo();
    }, delay);
}

function observe(target: Node | null | undefined, options: MutationObserverInit) {
    if (!target) return;
    observer?.observe(target, options);
}

export default definePlugin({
    name: "ThemeVideoBackground",
    description: "Adds video background support for themes using CSS variables. Desktop supports local playback and remote caching; web supports direct public video URLs.",
    authors: [{ name: "qbvi", id: 0n }],
    enabledByDefault: true,

    start() {
        scheduleSync(0);

        fallbackInterval = window.setInterval(scheduleSync, 10000);
        observer = new MutationObserver(() => scheduleSync());
        observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class", "style"]
        });
        observe(document.head, {
            childList: true,
            subtree: true,
            characterData: true
        });
        observe(document.body, {
            attributes: true,
            attributeFilter: ["class", "style"]
        });
    },

    stop() {
        cleanup();
    }
});
