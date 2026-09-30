import Page from "./page";
import { getBoundingBox, getMetersPerTile, latLongToTileXY, makePolygon } from "./geometry";

import store from "../store/store";
import { setJobState, setRemainingTiles } from "../store/actions";

export class AtlasError extends Error {
    constructor(message, details) {
        super(message);
        this.name = "AtlasError";
        this.details = details;
    }
}

export default class Atlas {
    static paperSizes = [
        { value: "A0", width: 841, height: 1189, description: "841 × 1189 mm" },
        { value: "A1", width: 594, height: 841, description: "594 × 841 mm" },
        { value: "A2", width: 420, height: 594, description: "420 × 594 mm" },
        { value: "A3", width: 297, height: 420, description: "297 × 420 mm" },
        { value: "A4", width: 210, height: 297, description: "210 × 297 mm" },
        { value: "A5", width: 148, height: 210, description: "148 × 210 mm" }
    ];

    static scales = [
        { value: 10000, label: "1:10 000", description: "1 km = 10 cm" },
        { value: 20000, label: "1:20 000", description: "1 km = 5 cm" },
        { value: 25000, label: "1:25 000", description: "1 km = 4 cm" },
        { value: 33333, label: "1:33 333", description: "1 km = 3 cm" },
        { value: 50000, label: "1:50 000", description: "1 km = 2 cm" },
        { value: 100000, label: "1:100 000", description: "1 cm = 1 km" },
        { value: 200000, label: "1:200 000", description: "1 cm = 2 km" },
        { value: 300000, label: "1:300 000", description: "1 cm = 3 km" },
        { value: 400000, label: "1:400 000", description: "1 cm = 4 km" },
        { value: 500000, label: "1:500 000", description: "1 cm = 5 km" },
    ];

    constructor(printAreaLatLong, geometry) {
        this.pages = [];
        this.tiles = new Set();
        this.zoomLevel = geometry.zoomLevel;
        this.socket = null;

        const printArea = printAreaLatLong.map(
            ([lat, long]) => latLongToTileXY(lat, long, this.zoomLevel)
        );

        const boundingBox = getBoundingBox(printArea);
        const metersPerTile = getMetersPerTile(boundingBox.middle.y, this.zoomLevel);
        const pageSize = Atlas.getPageSize(geometry, metersPerTile);

        const pagesX = Math.ceil((boundingBox.max.x - boundingBox.min.x) / pageSize.tiles.x);
        const pagesY = Math.ceil((boundingBox.max.y - boundingBox.min.y) / pageSize.tiles.y);

        const startX = boundingBox.middle.x - pagesX / 2 * pageSize.tiles.x;
        const startY = boundingBox.middle.y - pagesY / 2 * pageSize.tiles.y;

        const printAreaPolygon = makePolygon(printArea);

        for (let pageY = 0; pageY < pagesY; pageY++) {
            for (let pageX = 0; pageX < pagesX; pageX++) {
                const x = startX + pageX * pageSize.tiles.x;
                const y = startY + pageY * pageSize.tiles.y;

                const page = new Page({ x, y }, pageSize, this.zoomLevel);
                if (!page.intersects(printAreaPolygon))
                    continue;

                if (this.pages.length >= 100)
                    throw new AtlasError("Page limit exceeded", "It would take over 100 pages to print this map.");

                this.pages.push(page);

                for (const tile of page.getTiles()) {
                    this.tiles.add(tile);

                    if (this.tiles.size >= 10000)
                        throw new AtlasError("Tile limit exceeded", "It would take over 10000 tiles to print this map.");
                }
            }
        }
    }

    static getPageSize(geometry, metersPerTile) {
        const paperData = Atlas.paperSizes.find(entry => entry.value == geometry.paperSize);
        if (!paperData)
            throw RangeError(`Unknown paper size ${geometry.paperSize}`);

        const paperWidth = geometry.landscape ? paperData.height : paperData.width;
        const paperHeight = geometry.landscape ? paperData.width : paperData.height;

        const margin = geometry.borderless ? 0 : 10;
        const output = {
            paper: {
                width: paperWidth,
                height: paperHeight
            },
            printable: {
                width: paperWidth - margin * 2,
                height: paperHeight - margin * 2
            }
        };

        const coverageX = output.printable.width / 1000 * geometry.scale;
        const coverageY = output.printable.height / 1000 * geometry.scale;

        return {
            ...output,
            tiles: {
                x: coverageX / metersPerTile,
                y: coverageY / metersPerTile
            }
        };
    }

    startJob() {
        if (this.socket != null)
            throw Error("Job already started");

        this.socket = new WebSocket("/");
        store.dispatch(setJobState("inProgress"));

        this.socket.addEventListener("open", () => {
            this.socket.send(
                JSON.stringify({
                    zoomLevel: this.zoomLevel,
                    tiles: Array.from(this.tiles)
                })
            );
        });

        this.socket.addEventListener("message", event => {
            if (this.socket == null)
                return;

            const { remainingTiles } = JSON.parse(event.data);
            store.dispatch(setRemainingTiles(remainingTiles));
        });

        this.socket.addEventListener("close", () => {
            if (this.socket == null)
                return;

            store.dispatch(setJobState("done"));
            this.socket = null;
        });
    }

    stopJob() {
        if (this.socket == null)
            throw Error("Job already stopped");

        this.socket.close(1000);
        this.socket = null;
        store.dispatch(setJobState("notStarted"));
    }

    cleanUp() {
        if (this.socket == null)
            return;

        const socket = this.socket;
        this.socket = null;
        socket.close(1000);
    }
}
