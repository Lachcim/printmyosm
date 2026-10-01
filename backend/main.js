import express from "express";
import { createServer } from "http";
import { existsSync } from "fs";
import { WebSocketServer } from "ws";

import { getMaps, saveMaps } from "./maps.js";
import { downloadTile, getTilePath, getRemainingTiles, bulkDownloadTiles } from "./tiles.js";
import { composePage, PageIncompleteError } from "./pages.js";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static("dist"));
app.use(express.json());

server.listen(8080, () => {
    console.log("PrintMyOSM listening at http://localhost:8080");
});

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
    const { remainingTiles, totalTiles } = await getRemainingTiles(req.body.tiles, req.body.zoomLevel);

    res.json({
        tiles: totalTiles - remainingTiles.size,
        pages: []
    });
});

app.get("/page/:map/:zoom/:x/:y/:width/:height", async (req, res) => {
    const { map, zoom, x, y, width, height } = req.params;
    const pageCode = `${zoom}/${x}/${y}/${width}/${height}`;

    try {
        res.sendFile(await composePage(map, pageCode));
    }
    catch (error) {
        if (error instanceof PageIncompleteError) {
            res.status(404);
            res.send();
            return;
        }

        throw error;
    }
});

wss.on("connection", ws => {
    console.log("Connection received");
    let jobAbortController = null;

    ws.on("message", async data => {
        if (jobAbortController) {
            ws.close(4000);
            return;
        }

        const { tiles, zoomLevel } = JSON.parse(data);
        const { remainingTiles, totalTiles } = await getRemainingTiles(tiles, zoomLevel);

        if (remainingTiles.size == 0) {
            console.log(`Not starting job: ${totalTiles} tiles present`);

            ws.send(JSON.stringify({ tiles: totalTiles, pages: [] }));
            ws.close(1000);
            return;
        }

        console.log(`Job started: requested ${totalTiles} tiles, ${remainingTiles.size} tiles remaining`);

        jobAbortController = new AbortController();

        await bulkDownloadTiles({
            remainingTiles,
            totalTiles,
            zoomLevel,
            abortSignal: jobAbortController.signal,
            onNext: ({ totalTiles, inQueue, failedTiles }) => {
                if (ws.readyState != WebSocket.OPEN)
                    return;

                console.log(`Tile progress: ${totalTiles - inQueue}/${totalTiles}, ${failedTiles} tiles failed`);
                ws.send(JSON.stringify({ tiles: totalTiles - inQueue, pages: [] }));
            },
            onDone: () => {
                if (ws.readyState != WebSocket.OPEN)
                    return;

                ws.close(1000);
            },
            onFailedAttempt: ({ x, y, aborted, retriesLeft }) => {
                if (aborted) console.log(`Tile (${x}, ${y}) aborted`);
                else if (retriesLeft != 0) console.log(`Tile (${x}, ${y}) failed, will retry`);
                else console.log(`Tile (${x}, ${y}) failed`);
            }
        });
    });

    ws.on("close", code => {
        if (jobAbortController) jobAbortController.abort();
        jobAbortController = null;

        if (code == 1000) console.log("Connection closed");
        else if (code == 1001) console.log("Connection closed: going away");
        else if (code == 4000) console.log("Connection closed: job already in progress");
        else console.log(`Connection closed: ${code}`);
    });
});
