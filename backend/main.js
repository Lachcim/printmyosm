import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import PQueue from "p-queue";
import { makeRetriable } from "p-retry";

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

function downloadTile(x, y, zoom, headers) {
    const url = `https://tile.tracestrack.com/topo__/${zoom}/${x}/${y}.webp?key=383118983d4a867dd2d367451720d724`;

    return fetch(url, {
        method: "get",
        headers: {
            ...headers,
            host: new URL(url).host,
            referer: "https://www.openstreetmap.org/",
        }
    });
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

    const serverResponse = await downloadTile(x, y, zoom, req.headers);

    res.status(serverResponse.status);
    serverResponse.headers.forEach((value, name) => {
        res.setHeader(name, value);
    });

    const stream = Readable.fromWeb(serverResponse.body);

    if (serverResponse.status == 200) {
        await finished(stream.pipe(createWriteStream(tilePath)));
    }

    res.sendFile(tilePath);
});

app.post("/atlas", async (req, res) => {
    const tilesToDownload = await getRemainingTiles(req.body.tiles, req.body.zoomLevel);
    res.json({ remainingTiles: tilesToDownload.size });
});

wss.on("connection", ws => {
    console.log("Connection received");
    let jobInProgress = false;

    function startJob(tilesToDownload, zoomLevel) {
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
                    async () => {
                        if (y == 5498 && (x == 9208 || x == 9207)) {
                            console.log(zoomLevel);
                            throw new Error("Failed to download tile");
                        }
                        else {
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            return;
                        }

                        /*const response = await downloadTile(x, y, zoomLevel, null);
                        if (!response.ok)
                            throw new Error("Failed to download tile");*/
                    },
                    {
                        retries: 3,
                        minTimeout: 3000,
                        onFailedAttempt: ({ retriesLeft }) => {
                            console.log(retriesLeft ? `Tile (${x}, ${y}) failed, will retry` : `Tile (${x}, ${y}) failed`);
                        }
                    }
                ),
            ).catch(() => {});
        }

        queue.on("next", () => {
            const inQueue = queue.size + queue.pending;
            console.log(`${inQueue} tiles remaining, ${failedTiles} tiles failed`);

            ws.send(JSON.stringify({ remainingTiles: inQueue + failedTiles }));

            if (inQueue == 0)
                ws.close(1000);
        });

        queue.on("error", () => {
            failedTiles++;
        });

        const jobSize = queue.size + queue.pending;
        jobInProgress = true;

        ws.send(JSON.stringify({ remainingTiles: jobSize }));
        if (jobSize == 0)
            ws.close(1000);
    }

    ws.on("message", async data => {
        if (jobInProgress) {
            ws.close(1002);
            return;
        }

        const { tiles, zoomLevel } = JSON.parse(data);
        const tilesToDownload = await getRemainingTiles(tiles, zoomLevel);

        const requestedTiles = new Set(tiles).size;
        console.log(`Job started: requested ${requestedTiles} tiles, ${tilesToDownload.size} tiles remaining`);

        startJob(tilesToDownload, zoomLevel);
    });

    ws.on("close", code => {
        if (code == 1000) console.log("Job finished");
        else if (code == 1001) console.log("Job terminated: going away");
        else if (code == 1002) console.log("Job terminated: protocol error");
        else console.log(`Connection closed: ${code}`);
    });
});
