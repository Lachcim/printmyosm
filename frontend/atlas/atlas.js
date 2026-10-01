import { v4 as uuidv4 } from "uuid";

import Page from "./page";
import { getBoundingBox, getMetersPerTile, latLongToTileXY, makePolygon } from "./geometry";

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

    static margins = [
        { value: 0, label: "No margins", description: "0 mm" },
        { value: 7, label: "Minimal", description: "7 mm" },
        { value: 12, label: "Narrow", description: "12 mm" },
        { value: 20, label: "Full", description: "20 mm" }
    ];

    constructor(mapId, printAreaLatLong, geometry) {
        this.id = uuidv4();
        this.mapId = mapId;
        this.pages = [];
        this.tiles = new Set();
        this.zoomLevel = geometry.zoomLevel;
        this.socket = null;

        this.jobState = "notStarted";
        this.jobProgress = null;
        this.onChange = null;

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
        const grid = new Map();

        for (const [pageX, pageY] of Atlas.getPageGenerator(pagesX, pagesY, geometry.landscape)) {
            const x = startX + pageX * pageSize.tiles.x;
            const y = startY + pageY * pageSize.tiles.y;

            const page = new Page({ x, y }, pageSize, this.zoomLevel);
            if (!page.intersects(printAreaPolygon))
                continue;

            if (this.pages.length >= 100)
                throw new AtlasError("Page limit exceeded", "It would take over 100 pages to print this map.");

            this.pages.push(page);
            page.number = this.pages.length;

            for (const tile of page.getTiles()) {
                this.tiles.add(tile);

                if (this.tiles.size >= 10000)
                    throw new AtlasError("Tile limit exceeded", "It would take over 10000 tiles to print this map.");
            }

            grid.set(`${pageX}/${pageY}`, page);
            const leftNeighbor = grid.get(`${pageX - 1}/${pageY}`);
            const topNeighbor = grid.get(`${pageX}/${pageY - 1}`);

            if (leftNeighbor) {
                leftNeighbor.neighbors.right = page.number;
                page.neighbors.left = leftNeighbor.number;
            }
            if (topNeighbor) {
                topNeighbor.neighbors.bottom = page.number;
                page.neighbors.top = topNeighbor.number;
            }
        }
    }

    static getPageSize(geometry, metersPerTile) {
        const paperData = Atlas.paperSizes.find(entry => entry.value == geometry.paperSize);
        if (!paperData)
            throw RangeError(`Unknown paper size ${geometry.paperSize}`);

        const paperWidth = geometry.landscape ? paperData.height : paperData.width;
        const paperHeight = geometry.landscape ? paperData.width : paperData.height;

        const baseMargin = geometry.margins;
        const spineMargin = geometry.margins > 0 ? (20 - baseMargin) : 0;
        const spineMarginX = geometry.landscape ? 0 : spineMargin;
        const spineMarginY = geometry.landscape ? spineMargin : 0;

        const output = {
            paper: {
                width: paperWidth,
                height: paperHeight
            },
            printable: {
                width: paperWidth - baseMargin * 2 - spineMarginX,
                height: paperHeight - baseMargin * 2 - spineMarginY,
                spineMargin
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

    static *getPageGenerator(pagesX, pagesY, landscape) {
        if (landscape) {
            for (let pageX = 0; pageX < pagesX; pageX++) {
                for (let pageY = 0; pageY < pagesY; pageY++) {
                    yield [pageX, pageY];
                }
            }

            return;
        }

        for (let pageY = 0; pageY < pagesY; pageY++) {
            for (let pageX = 0; pageX < pagesX; pageX++) {
                yield [pageX, pageY];
            }
        }
    }

    startJob() {
        if (this.socket != null)
            throw Error("Job already started");

        this.socket = new WebSocket("/");
        this.jobState = "inProgress";
        this.onChange?.();

        this.socket.addEventListener("open", () => {
            this.socket.send(
                JSON.stringify({
                    map: this.mapId,
                    zoomLevel: this.zoomLevel,
                    tiles: Array.from(this.tiles),
                    pageCodes: this.pages.map(page => page.getCode())
                })
            );
        });

        this.socket.addEventListener("message", event => {
            if (this.socket == null)
                return;

            this.jobProgress = JSON.parse(event.data);
            this.onChange?.();
        });

        this.socket.addEventListener("close", () => {
            if (this.socket == null)
                return;

            this.socket = null;
            this.jobState = "done";
            this.onChange?.();
        });
    }

    stopJob() {
        if (this.socket == null)
            throw Error("Job already stopped");

        this.socket.close(1000);
        this.socket = null;

        this.jobState = "notStarted";
        this.onChange?.();
    }

    setJobProgress(progress) {
        this.jobProgress = progress;
        this.onChange?.();
    }

    cleanUp() {
        if (this.socket == null)
            return;

        const socket = this.socket;
        this.socket = null;
        socket.close(1000);
    }
}
