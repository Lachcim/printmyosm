import express from "express";
import { createServer } from "http";
import { existsSync } from "fs";
import { WebSocketServer } from "ws";

import { getMaps, saveMaps } from "./maps.js";
import { downloadTile, getTilePath, getRemainingTiles, bulkDownloadTiles } from "./tiles.js";
import { composePage, deleteOldPages, getPagePath, getRemainingPages } from "./pages.js";

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
    const { tiles, zoomLevel, map, pageCodes } = req.body;

    const { remainingTiles, totalTiles } = await getRemainingTiles(tiles, zoomLevel);
    const { donePages } = await getRemainingPages(map, pageCodes);

    res.json({
        tiles: totalTiles - remainingTiles.size,
        pages: donePages
    });
});

app.get("/page/:map/:zoom/:x/:y/:width/:height", async (req, res) => {
    const { map, zoom, x, y, width, height } = req.params;
    const pageCode = `${zoom}/${x}/${y}/${width}/${height}`;

    const pagePath = getPagePath(map, pageCode);

    if (!existsSync(pagePath)) {
        res.status(404);
        res.send();
        return;
    }

    res.sendFile(pagePath);
});

wss.on("connection", ws => {
    console.log("Connection received");
    let jobAbortController = null;

    ws.on("message", async data => {
        if (jobAbortController) {
            ws.close(4000);
            return;
        }

        const { tiles, zoomLevel, map, pageCodes } = JSON.parse(data);
        const { remainingTiles, totalTiles } = await getRemainingTiles(tiles, zoomLevel);
        const { remainingPages, donePages, totalPages } = await getRemainingPages(map, pageCodes);

        if (remainingTiles.size == 0 && remainingPages.size == 0) {
            console.log(`Not starting job: ${totalTiles} tiles and ${donePages.length} present`);

            ws.send(JSON.stringify({ tiles: totalTiles, pages: donePages }));
            ws.close(1000);
            return;
        }

        console.log(`Job started: ${remainingTiles.size} tiles and ${remainingPages.size} pages remaining`);
        jobAbortController = new AbortController();

        const tilesDownloaded = await bulkDownloadTiles({
            remainingTiles,
            totalTiles,
            zoomLevel,
            abortSignal: jobAbortController.signal,
            onNext: ({ totalTiles, inQueue, failedTiles }) => {
                if (ws.readyState != WebSocket.OPEN)
                    return;

                console.log(`Tile progress: ${totalTiles - inQueue}/${totalTiles}, ${failedTiles} tiles failed`);
                ws.send(JSON.stringify({ tiles: totalTiles - inQueue, pages: donePages }));
            },
            onFailedAttempt: ({ x, y, retriesLeft }) => {
                if (jobAbortController.signal.aborted) console.log(`Tile (${x}, ${y}) aborted`);
                else if (retriesLeft != 0) console.log(`Tile (${x}, ${y}) failed, will retry`);
                else console.log(`Tile (${x}, ${y}) failed`);
            }
        });

        if (ws.readyState != WebSocket.OPEN)
            return;

        if (!tilesDownloaded) {
            ws.close(1000);
            return;
        }

        deleteOldPages(map, pageCodes);

        for (const pageCode of remainingPages) {
            if (ws.readyState != WebSocket.OPEN)
                return;

            try {
                await composePage(map, pageCode, jobAbortController.signal);
            }
            catch (error) {
                if (error.name == "AbortError") {
                    console.log("Page aborted");
                    continue;
                }

                throw error;
            }

            if (ws.readyState != WebSocket.OPEN)
                return;

            donePages.push(pageCode);

            console.log(`Page progress: ${donePages.length}/${totalPages}`);
            ws.send(JSON.stringify({ tiles: totalTiles, pages: donePages }));
        }

        ws.close(1000);
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
