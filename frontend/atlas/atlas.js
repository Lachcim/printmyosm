import Page from "./page";
import { getBoundingBox, getMetersPerTile, latLongToTileXY, makePolygon } from "./geometry";

export default class Atlas {
    static paperSizes = [
        { name: "A0", width: 841, height: 1189 },
        { name: "A1", width: 594, height: 841 },
        { name: "A2", width: 420, height: 594 },
        { name: "A3", width: 297, height: 420 },
        { name: "A4", width: 210, height: 297 },
        { name: "A5", width: 148, height: 210 }
    ];

    constructor(printAreaLatLong, geometry) {
        this.pages = [];

        const printArea = printAreaLatLong.map(
            ([lat, long]) => latLongToTileXY(lat, long, geometry.zoomLevel)
        );

        const boundingBox = getBoundingBox(printArea);
        const metersPerTile = getMetersPerTile(boundingBox.middle.y, geometry.zoomLevel);
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

                const page = new Page({ x, y }, pageSize);
                if (!page.intersects(printAreaPolygon))
                    continue;

                this.pages.push(page);
            }
        }
    }

    static getPageSize(geometry, metersPerTile) {
        const paperData = Atlas.paperSizes.find(entry => entry.name == geometry.paperSize);
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
}
