import path from "node:path";
import { existsSync, mkdirSync, unlinkSync } from "node:fs";
import { readdir } from "node:fs/promises";
import sharp from "sharp";

import { getTilePath } from "./tiles.js";

const pagesDir = path.join(import.meta.dirname, "..", "pages");

export function getPagePath(map, pageCode) {
    mkdirSync(path.join(pagesDir, map), { recursive: true });
    return path.join(pagesDir, map, `${pageCode.replaceAll("/", "_")}.jpg`);
}

function parsePageFilename(filename) {
    const rawName = path.parse(filename).name;
    return rawName.replaceAll("_", "/");
}

export async function getRemainingPages(map, pageCodes) {
    const remainingPages = new Set(pageCodes);
    const totalPages = remainingPages.size;
    const donePages = [];

    const mapDir = path.join(pagesDir, map);
    if (!existsSync(mapDir)) {
        return { remainingPages, totalPages, donePages };
    }

    const filenames = await readdir(mapDir);

    for (const filename of filenames) {
        const presentPageCode = parsePageFilename(filename);

        if (!remainingPages.has(presentPageCode)) {
            console.log(remainingPages, presentPageCode);
            const filePath = path.join(pagesDir, map, filename);

            try {
                unlinkSync(filePath);
                console.log(`Deleting old page ${presentPageCode}`);
            }
            catch {}

            continue;
        }

        remainingPages.delete(presentPageCode);
        donePages.push(presentPageCode);
    }

    return { remainingPages, totalPages, donePages };
}

function ensureTilesExist(zoom, minX, minY, maxX, maxY) {
    for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
            const tilePath = getTilePath(x, y, zoom);

            if (!existsSync(tilePath)) {
                throw new Error(`Missing tile ${x} ${y}`);
            }
        }
    }
}

async function getTileSize(x, y, zoom) {
    const sampleTile = await sharp(getTilePath(x, y, zoom));
    const tileMetadata = await sampleTile.metadata();
    return tileMetadata.width;
}

async function loadTileLine(minX, maxX, y, zoom) {
    const tileBuffers = [];
    const tileBufferPromises = [];

    for (let x = minX; x <= maxX; x++) {
        const tilePath = getTilePath(x, y, zoom);

        const readFile = async () => {
            const tile = await sharp(tilePath);
            tileBuffers[x - minX] = await tile.raw().toBuffer();
        };

        tileBufferPromises.push(readFile());
    }

    await Promise.all(tileBufferPromises);
    return tileBuffers;
}

export async function composePage(map, pageCode) {
    const [zoom, pageX, pageY, pageWidth, pageHeight] = pageCode.split("/").map(component => parseFloat(component));

    const endX = pageX + pageWidth;
    const endY = pageY + pageHeight;
    const minX = Math.floor(pageX);
    const minY = Math.floor(pageY);
    const maxX = Math.ceil(endX) - 1;
    const maxY = Math.ceil(endY) - 1;

    ensureTilesExist(zoom, minX, minY, maxX, maxY);

    const tileSize = await getTileSize(minX, minY, zoom);
    const skipPixelsStart = Math.floor((pageX - minX) * tileSize);
    const skipPixelsEnd = Math.floor(((maxX + 1) - endX) * tileSize);
    const skipLinesStart = Math.floor((pageY - minY) * tileSize);
    const skipLinesEnd =  Math.floor(((maxY + 1) - endY) * tileSize);

    const keepPixelsEnd = tileSize - skipPixelsEnd;
    const keepLinesEnd = tileSize - skipLinesEnd;

    const channels = 3;
    const outputWidth = (maxX - minX + 1) * tileSize - skipPixelsStart - skipPixelsEnd;
    const outputHeight = (maxY - minY + 1) * tileSize - skipLinesStart - skipLinesEnd;

    const canvas = Buffer.allocUnsafe(outputWidth * outputHeight * channels);
    let canvasPosition = 0;

    for (let y = minY; y <= maxY; y++) {
        const tileBuffers = await loadTileLine(minX, maxX, y, zoom);

        for (let line = 0; line < tileSize; line++) {
            if (y == minY && line < skipLinesStart) continue;
            if (y == maxY && line >= keepLinesEnd) continue;

            for (let x = minX; x <= maxX; x++) {
                const tileBuffer = tileBuffers[x - minX];

                const tileStart = line * tileSize + ((x == minX) ? skipPixelsStart : 0);
                const tileEnd = line * tileSize + ((x == maxX) ? keepPixelsEnd : tileSize);

                canvasPosition += tileBuffer.copy(
                    canvas,
                    canvasPosition,
                    tileStart * channels,
                    tileEnd * channels
                );
            }
        }
    }

    const outputPath = getPagePath(map, pageCode);

    await sharp(canvas, {
        raw: {
            width: outputWidth,
            height: outputHeight,
            channels
        }
    }).jpeg().toFile(outputPath);
}
