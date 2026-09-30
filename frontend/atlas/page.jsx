import React, { memo } from "react";
import { v4 as uuidv4 } from "uuid";
import { Polygon } from "react-leaflet";
import { booleanIntersects } from "@turf/boolean-intersects";

import { makePolygon, tileXYtoLatLong } from "./geometry";

export const PageVector = memo(function PageVector({ page }) {
    const style = {
        color: "#000000",
        weight: 1,
        fill: false
    };

    return (
        <Polygon
            pathOptions={style}
            positions={page.getVertices()}
            interactive={false}
        />
    );
});

export default class Page {
    constructor(position, size, zoomLevel) {
        this.id = uuidv4();
        this.position = position;
        this.size = size;
        this.zoomLevel = zoomLevel;
        this.number = null;
        this.neighbors = { top: null, left: null, bottom: null, right: null };
    }

    intersects(printArea) {
        const { x, y } = this.position;
        const { x: width, y: height } = this.size.tiles;

        const polygon = makePolygon([
            { x, y },
            { x: x + width, y },
            { x: x + width, y: y + height },
            { x, y: y + height }
        ]);

        return booleanIntersects(polygon, printArea);
    }

    getVertices() {
        const { x, y } = this.position;
        const { x: width, y: height } = this.size.tiles;

        const minLatLong = tileXYtoLatLong(x, y, this.zoomLevel);
        const maxLatLong = tileXYtoLatLong(x + width, y + height, this.zoomLevel);

        return [
            [minLatLong.lat, minLatLong.long],
            [minLatLong.lat, maxLatLong.long],
            [maxLatLong.lat, maxLatLong.long],
            [maxLatLong.lat, minLatLong.long]
        ];
    }

    *getTiles() {
        const minX = Math.floor(this.position.x);
        const minY = Math.floor(this.position.y);
        const maxX = Math.floor(this.position.x + this.size.tiles.x);
        const maxY = Math.floor(this.position.y + this.size.tiles.y);

        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                yield `${x}/${y}`;
            }
        }
    }
}
