import path from "node:path";
import { createWriteStream, mkdirSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";
import PQueue from "p-queue";
import { makeRetriable } from "p-retry";

const tilesDir = path.join(import.meta.dirname, "..", "tiles");

export async function downloadTile(x, y, zoom, tilePath, headers, signal) {
    const url = `https://tile.tracestrack.com/topo__/${zoom}/${x}/${y}.webp?key=383118983d4a867dd2d367451720d724`;

    const response = await fetch(url, {
        method: "get",
        headers: {
            ...headers,
            host: new URL(url).host,
            referer: "https://www.openstreetmap.org/",
        },
        signal
    });

    if (response.status == 200) {
        const stream = Readable.fromWeb(response.body);
        await finished(stream.pipe(createWriteStream(tilePath)));
    }

    return response;
}

export function getTilePath(x, y, zoom) {
    mkdirSync(tilesDir, { recursive: true });
    return path.join(tilesDir, `${zoom}-${x}-${y}.webp`);
}

function parseTileFilename(filename) {
    const rawName = path.parse(filename).name;
    const components = rawName.split("-").map(component => parseInt(component));
    return { zoom: components[0], x: components[1], y: components[2] };
}

export async function getRemainingTiles(tiles, zoomLevel) {
    const remainingTiles = new Set(tiles);
    const totalTiles = remainingTiles.size;

    const filenames = await readdir(tilesDir);
    for (const filename of filenames) {
        const presentTile = parseTileFilename(filename);

        if (presentTile.zoom == zoomLevel)
            remainingTiles.delete(`${presentTile.x}/${presentTile.y}`);
    }

    return { remainingTiles, totalTiles };
}

function bulkDownloadTilesInternal({ remainingTiles, totalTiles, zoomLevel, abortSignal, onNext, onDone, onFailedAttempt }) {
    const queue = new PQueue({
        concurrency: 10,
        intervalCap: 10,
        interval: 1000,
        strict: true
    });
    let failedTiles = 0;

    for (const tile of remainingTiles) {
        const [x, y] = tile.split("/").map(component => parseInt(component));

        queue.add(
            makeRetriable(
                async ({ signal }) => {
                    const tilePath = getTilePath(x, y, zoomLevel);
                    const response = await downloadTile(x, y, zoomLevel, tilePath, null, signal);

                    if (response.status != 200)
                        throw new Error("Failed to download tile");
                },
                {
                    retries: 3,
                    minTimeout: 3000,
                    onFailedAttempt: ({ ...args }) => onFailedAttempt({ ...args, aborted: abortSignal.aborted, x, y }),
                    signal: abortSignal
                }
            ),
            {
                signal: abortSignal
            }
        ).catch(() => {});
    }

    queue.on("next", () => {
        const inQueue = queue.size + queue.pending;
        onNext({ totalTiles, inQueue, failedTiles });

        if (inQueue == 0)
            onDone(failedTiles == 0);
    });

    queue.on("error", () => {
        failedTiles++;
    });
}

export function bulkDownloadTiles({ onDone, ...args }) {
    return new Promise(resolve => {
        const handleDone = (...doneArgs) => {
            onDone(...doneArgs);
            resolve();
        };

        bulkDownloadTilesInternal({ onDone: handleDone, ...args });
    });
}
