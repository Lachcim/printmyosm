import express from "express";
import path from "node:path";
import { createWriteStream, existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";

const app = express();

app.use(express.static("dist"));
app.use(express.json());

app.listen(8080, () => {
    console.log("PrintMyOSM listening at http://localhost:8080");
});

const mapsFile = path.join(import.meta.dirname, "..", "maps.json");

async function getMaps() {
    if (!existsSync(mapsFile)) {
        return [];
    }

    const rawMaps = await readFile(mapsFile);
    return JSON.parse(rawMaps);
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
    const mapNotEmpty = map.name != null || map.features.length > 0 || map.geometry != null;

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
    const filePath = path.join(import.meta.dirname, "..", "tiles", `${zoom}-${x}-${y}.webp`);

    if (existsSync(filePath)) {
        res.sendFile(filePath);
        return;
    }

    const url = `https://tile.tracestrack.com/topo__/${zoom}/${x}/${y}.webp?key=383118983d4a867dd2d367451720d724`;
    const serverResponse = await fetch(url, {
        method: "get",
        headers: {
            ...req.headers,
            host: new URL(url).host,
            referer: "https://www.openstreetmap.org/"
        }
    });

    res.status(serverResponse.status);
    serverResponse.headers.forEach((value, name) => {
        res.setHeader(name, value);
    });

    const stream = Readable.fromWeb(serverResponse.body);

    if (serverResponse.status == 200) {
        await finished(stream.pipe(createWriteStream(filePath)));
    }

    res.sendFile(filePath);
});
