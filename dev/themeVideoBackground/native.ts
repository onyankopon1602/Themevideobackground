/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { CspPolicies } from "@main/csp";
import { downloadToFile } from "@main/utils/http";
import { THEMES_DIR } from "@main/utils/constants";
import { createHash } from "crypto";
import { createReadStream, stat } from "fs";
import { mkdir, readFile, rename, unlink, writeFile } from "fs/promises";
import { createServer, Server } from "http";
import { AddressInfo } from "net";
import { extname, join, normalize } from "path";
import { fileURLToPath } from "url";

CspPolicies["http://127.0.0.1:*"] ??= [];
for (const directive of ["connect-src", "media-src"]) {
    if (!CspPolicies["http://127.0.0.1:*"].includes(directive)) {
        CspPolicies["http://127.0.0.1:*"].push(directive);
    }
}

let server: Server | undefined;
let port = 0;
let currentFile = "";

interface CacheMetadata {
    file: string;
    source: string;
    downloadedAt: number;
}

function toLocalPath(src: string) {
    if (src.startsWith("file://")) return fileURLToPath(src);
    return src;
}

function hash(value: string) {
    return createHash("sha256").update(value).digest("hex");
}

function sanitizeId(value: string) {
    const id = value
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);

    return id || "video";
}

function getCacheId(src: string, themeId: string) {
    if (themeId) return sanitizeId(themeId);

    try {
        const url = new URL(src);
        const baseName = `${url.hostname}${url.pathname.replace(/\.[a-z0-9]+$/i, "")}`;
        return `${sanitizeId(baseName)}-${hash(src).slice(0, 8)}`;
    } catch {
        return `video-${hash(src).slice(0, 12)}`;
    }
}

function getRemoteExtension(src: string) {
    const allowed = new Set([".mp4", ".m4v", ".webm", ".mov", ".mkv"]);

    try {
        const extension = extname(new URL(src).pathname).toLowerCase();
        if (allowed.has(extension)) return extension;
    } catch { }

    return ".mp4";
}

async function readMetadata(path: string) {
    try {
        return JSON.parse(await readFile(path, "utf8")) as CacheMetadata;
    } catch {
        return undefined;
    }
}

async function fileExists(path: string) {
    return new Promise<boolean>(resolve => {
        stat(path, (error, stats) => resolve(!error && stats.isFile()));
    });
}

async function cacheRemoteVideo(src: string, themeId: string) {
    const cacheDir = join(THEMES_DIR, "video-backgrounds", getCacheId(src, themeId));
    const metadataPath = join(cacheDir, "metadata.json");
    const metadata = await readMetadata(metadataPath);

    if (metadata?.source === src) {
        const cachedPath = join(cacheDir, metadata.file);
        if (await fileExists(cachedPath)) return cachedPath;
    }

    await mkdir(cacheDir, { recursive: true });

    const fileName = `background${getRemoteExtension(src)}`;
    const targetPath = join(cacheDir, fileName);
    const tempPath = join(cacheDir, `${fileName}.download`);

    try {
        await unlink(tempPath);
    } catch { }

    try {
        await downloadToFile(src, tempPath);
        await rename(tempPath, targetPath);
        await writeFile(metadataPath, JSON.stringify({
            downloadedAt: Date.now(),
            file: fileName,
            source: src
        } satisfies CacheMetadata, null, 2));
    } catch (error) {
        try {
            await unlink(tempPath);
        } catch { }

        if (metadata?.file) {
            const cachedPath = join(cacheDir, metadata.file);
            if (await fileExists(cachedPath)) return cachedPath;
        }

        throw error;
    }

    return targetPath;
}

function getMimeType(filePath: string) {
    switch (extname(filePath).toLowerCase()) {
        case ".webm":
            return "video/webm";
        case ".mov":
            return "video/quicktime";
        case ".mkv":
            return "video/x-matroska";
        default:
            return "video/mp4";
    }
}

function serveVideo(filePath: string, range: string | undefined, res: Parameters<Parameters<typeof createServer>[0]>[1]) {
    stat(filePath, (error, stats) => {
        if (error || !stats.isFile()) {
            res.writeHead(404);
            res.end();
            return;
        }

        const size = stats.size;
        const headers = {
            "Accept-Ranges": "bytes",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-store",
            "Content-Type": getMimeType(filePath)
        };

        if (!range) {
            res.writeHead(200, {
                ...headers,
                "Content-Length": size
            });
            createReadStream(filePath).pipe(res);
            return;
        }

        const match = range.match(/^bytes=(\d*)-(\d*)$/);
        if (!match) {
            res.writeHead(416, { "Content-Range": `bytes */${size}` });
            res.end();
            return;
        }

        const start = match[1] ? Number(match[1]) : 0;
        const end = match[2] ? Number(match[2]) : size - 1;

        if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || end >= size || start > end) {
            res.writeHead(416, { "Content-Range": `bytes */${size}` });
            res.end();
            return;
        }

        res.writeHead(206, {
            ...headers,
            "Content-Length": end - start + 1,
            "Content-Range": `bytes ${start}-${end}/${size}`
        });
        createReadStream(filePath, { start, end }).pipe(res);
    });
}

async function ensureServer() {
    if (server) return;

    server = createServer((req, res) => {
        if (req.url?.startsWith("/theme-video") && currentFile) {
            serveVideo(currentFile, req.headers.range, res);
            return;
        }

        res.writeHead(404);
        res.end();
    });

    await new Promise<void>((resolve, reject) => {
        server!.once("error", reject);
        server!.listen(0, "127.0.0.1", () => {
            port = (server!.address() as AddressInfo).port;
            server!.off("error", reject);
            resolve();
        });
    });
}

export async function resolveVideoSource(_: Electron.IpcMainInvokeEvent, src: string, themeId = "") {
    if (/^(blob:|data:)/i.test(src)) return src;

    currentFile = normalize(
        /^https?:/i.test(src)
            ? await cacheRemoteVideo(src, themeId)
            : toLocalPath(src)
    );
    await ensureServer();

    return `http://127.0.0.1:${port}/theme-video?v=${Date.now()}`;
}

export function stopVideoServer() {
    server?.close();
    server = undefined;
    port = 0;
    currentFile = "";
}
