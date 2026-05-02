/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import definePlugin, { PluginNative } from "@utils/types";

const Native = VencordNative.pluginHelpers.ThemeVideoBackground as PluginNative<typeof import("./native")>;

const VIDEO_ID = "vc-theme-video-background";
const STYLE_ID = "vc-theme-video-background-style";
const VARIABLE_NAMES = ["--vc-video-bg", "--j1c-video-bg"];
const ID_VARIABLE_NAMES = ["--vc-video-bg-id", "--vc-video-bg-name", "--j1c-video-bg-id"];

let video: HTMLVideoElement | null = null;
let style: HTMLStyleElement | null = null;
let currentKey = "";
let currentResolvedSrc = "";
let syncRun = 0;
let interval: number | undefined;
let observer: MutationObserver | undefined;

function readCssVariable(name: string) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
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

    video = document.createElement("video");
    video.id = VIDEO_ID;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.disablePictureInPicture = true;
    video.setAttribute("aria-hidden", "true");
    video.addEventListener("loadeddata", () => {
        console.info("[ThemeVideoBackground] Video loaded", video?.currentSrc, video?.videoWidth, video?.videoHeight);
    });
    video.addEventListener("error", () => {
        console.error("[ThemeVideoBackground] Video error", video?.currentSrc, video?.error?.code, video?.error?.message);
    });

    document.body.prepend(video);
    return video;
}

async function resolveVideoSrc(src: string, themeId: string) {
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

    ensureStyle();
    const element = ensureVideo();
    element.style.display = "";

    if (key !== currentKey) {
        currentKey = key;
        currentResolvedSrc = await resolveVideoSrc(src, themeId);
        if (run !== syncRun) return;
        console.info("[ThemeVideoBackground] Using video source", currentResolvedSrc);
        element.src = currentResolvedSrc;
        element.load();
    }

    void element.play().catch(() => void 0);
}

function cleanup() {
    window.clearInterval(interval);
    interval = undefined;
    observer?.disconnect();
    observer = undefined;

    video?.remove();
    video = null;
    removeStyle();
    currentKey = "";
    currentResolvedSrc = "";
    void Native.stopVideoServer().catch(() => void 0);
}

export default definePlugin({
    name: "ThemeVideoBackground",
    description: "Adds video background support for themes using CSS variables, with local playback and automatic remote video caching.",
    authors: [{ name: "qbvi", id: 0n }],

    start() {
        syncVideo();

        interval = window.setInterval(syncVideo, 1500);
        observer = new MutationObserver(syncVideo);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class", "style"]
        });
    },

    stop() {
        cleanup();
    }
});
