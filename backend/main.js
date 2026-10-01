import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import PQueue from "p-queue";
import { makeRetriable } from "p-retry";
import sharp from "sharp";

import path from "node:path";
import { createWriteStream, existsSync } from "node:fs";
import { readFile, writeFile, readdir } from "node:fs/promises";
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static("dist"));
app.use(express.json());

server.listen(8080, () => {
    console.log("PrintMyOSM listening at http://localhost:8080");
});

const mapsFile = path.join(import.meta.dirname, "..", "maps.json");
const tilesDir = path.join(import.meta.dirname, "..", "tiles");

async function downloadTile(x, y, zoom, tilePath, headers, signal) {
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

function getTilePath(x, y, zoom) {
    return path.join(tilesDir, `${zoom}-${x}-${y}.webp`);
}

function parseTileFilename(filename) {
    const rawName = path.parse(filename).name;
    const components = rawName.split("-").map(component => parseInt(component));
    return { zoom: components[0], x: components[1], y: components[2] };
}

async function getMaps() {
    if (!existsSync(mapsFile)) {
        return [];
    }

    const rawMaps = await readFile(mapsFile);
    return JSON.parse(rawMaps);
}

async function getRemainingTiles(tiles, zoomLevel) {
    const output = new Set(tiles);

    const filenames = await readdir(tilesDir);
    for (const filename of filenames) {
        const presentTile = parseTileFilename(filename);

        if (presentTile.zoom == zoomLevel)
            output.delete(`${presentTile.x}/${presentTile.y}`);
    }

    return output;
}

async function saveMaps(maps) {
    await writeFile(mapsFile, JSON.stringify(maps));
}

app.get("/maps", async (req, res) => {
    const maps = await getMaps();
    res.json(maps.map(map => ({ id: map.id, name: map.name })));
});

app.get("/maps/:id", async (req, res) => {
    const maps = await getMaps();
    res.json(maps.find(map => map.id == req.params.id));
});

app.put("/maps/:id", async (req, res) => {
    const mapsExcludingCurrent = (await getMaps()).filter(map => map.id != req.params.id);

    const map = req.body;
    const mapNotEmpty = map.name != null || map.features.length > 0;

    saveMaps(mapNotEmpty ? [map, ...mapsExcludingCurrent] : mapsExcludingCurrent);
    res.send();
});

app.delete("/maps/:id", async (req, res) => {
    let maps = await getMaps();
    maps = maps.filter(map => map.id != req.params.id);

    saveMaps(maps);
    res.send();
});

app.get("/tile/:zoom/:x/:y", async (req, res) => {
    const { zoom, x, y } = req.params;
    const tilePath = getTilePath(x, y, zoom);

    if (existsSync(tilePath)) {
        res.sendFile(tilePath);
        return;
    }

    const serverResponse = await downloadTile(x, y, zoom, tilePath, req.headers);

    res.status(serverResponse.status);
    serverResponse.headers.forEach((value, name) => {
        res.setHeader(name, value);
    });

    res.sendFile(tilePath);
});

app.post("/atlas", async (req, res) => {
    const tilesToDownload = await getRemainingTiles(req.body.tiles, req.body.zoomLevel);

    res.json({
        remaining: {
            tiles: tilesToDownload.size
        }
    });
});

wss.on("connection", ws => {
    console.log("Connection received");
    let abortJob = null;

    function startJob(tilesToDownload, zoomLevel) {
        const controller = new AbortController();
        const queue = new PQueue({
            concurrency: 10,
            intervalCap: 10,
            interval: 1000,
            strict: true
        });
        let failedTiles = 0;

        for (const tile of tilesToDownload) {
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
                        onFailedAttempt: ({ retriesLeft }) => {
                            if (controller.signal.aborted) console.log(`Tile (${x}, ${y}) aborted`);
                            else if (retriesLeft != 0) console.log(`Tile (${x}, ${y}) failed, will retry`);
                            else console.log(`Tile (${x}, ${y}) failed`);
                        },
                        signal: controller.signal
                    }
                ),
                {
                    signal: controller.signal
                }
            ).catch(() => {});
        }

        queue.on("next", () => {
            if (ws.readyState != WebSocket.OPEN)
                return;

            const inQueue = queue.size + queue.pending;
            console.log(`${inQueue} tiles remaining, ${failedTiles} tiles failed`);

            ws.send(JSON.stringify({ remaining: { tiles: inQueue + failedTiles } }));

            if (inQueue == 0)
                ws.close(1000);
        });

        queue.on("error", () => {
            failedTiles++;
        });

        const jobSize = queue.size + queue.pending;
        ws.send(JSON.stringify({ remaining: { tiles: jobSize } }));

        if (jobSize == 0)
            ws.close(1000);

        return () => controller.abort();
    }

    ws.on("message", async data => {
        if (abortJob) {
            ws.close(4000);
            return;
        }

        const { tiles, zoomLevel } = JSON.parse(data);
        const tilesToDownload = await getRemainingTiles(tiles, zoomLevel);

        const requestedTiles = new Set(tiles).size;
        console.log(`Job started: requested ${requestedTiles} tiles, ${tilesToDownload.size} tiles remaining`);

        abortJob = startJob(tilesToDownload, zoomLevel);
    });

    ws.on("close", code => {
        abortJob();
        abortJob = null;

        if (code == 1000) console.log("Connection closed");
        else if (code == 1001) console.log("Connection closed: going away");
        else if (code == 4000) console.log("Connection closed: job already in progress");
        else console.log(`Connection closed: ${code}`);
    });
});

app.get("/page/:zoom/:x/:y/:width/:height", async (req, res) => {
    const { zoom, x: pageXRaw, y: pageYRaw, width: widthRaw, height: heightRaw } = req.params;

    const pageX = parseFloat(pageXRaw);
    const pageY = parseFloat(pageYRaw);
    const width = parseFloat(widthRaw);
    const height = parseFloat(heightRaw);

    const endX = pageX + width;
    const endY = pageY + height;
    const minX = Math.floor(pageX);
    const minY = Math.floor(pageY);
    const maxX = Math.ceil(endX) - 1;
    const maxY = Math.ceil(endY) - 1;

    let tileSize = null;
    let skipPixelsStart = null;
    let skipPixelsEnd = null;
    let skipLinesStart = null;
    let skipLinesEnd = null;

    for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
            const tilePath = getTilePath(x, y, zoom);

            if (!existsSync(tilePath)) {
                res.status(404);
                res.send();
                return;
            }

            if (tileSize == null) {
                const sampleTile = await sharp(tilePath);
                const tileMetadata = await sampleTile.metadata();

                tileSize = tileMetadata.width;

                skipPixelsStart = Math.floor((pageX - minX) * tileSize);
                skipPixelsEnd = Math.floor(((maxX + 1) - endX) * tileSize);
                skipLinesStart = Math.floor((pageY - minY) * tileSize);
                skipLinesEnd =  Math.floor(((maxY + 1) - endY) * tileSize);
            }
        }
    }

    const channels = 3;
    const outputWidth = (maxX - minX + 1) * tileSize - skipPixelsStart - skipPixelsEnd;
    const outputHeight = (maxY - minY + 1) * tileSize - skipLinesStart - skipLinesEnd;

    const keepPixelsEnd = tileSize - skipPixelsEnd;
    const keepLinesEnd = tileSize - skipLinesEnd;

    const canvas = Buffer.allocUnsafe(outputWidth * outputHeight * channels);
    let canvasPosition = 0;

    for (let y = minY; y <= maxY; y++) {
        const tileBuffers = [];
        const tileBufferPromises = [];

        for (let x = minX; x <= maxX; x++) {
            const readFile = async () => {
                const tilePath = getTilePath(x, y, zoom);
                const tile = await sharp(tilePath);
                tileBuffers[x - minX] = await tile.raw().toBuffer();
            };

            tileBufferPromises.push(readFile());
        }

        await Promise.all(tileBufferPromises);

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

    res.type("jpeg");

    await sharp(canvas, {
        raw: {
            width: outputWidth,
            height: outputHeight,
            channels
        }
    }).jpeg().pipe(res);
});
