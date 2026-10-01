import path from "node:path";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";

const mapsFile = path.join(import.meta.dirname, "..", "maps.json");

export async function getMaps() {
    if (!existsSync(mapsFile)) {
        return [];
    }

    const rawMaps = await readFile(mapsFile);
    return JSON.parse(rawMaps);
}

export async function saveMaps(maps) {
    await writeFile(mapsFile, JSON.stringify(maps));
}
