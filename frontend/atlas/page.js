import { booleanIntersects } from "@turf/boolean-intersects";

import { makePolygon } from "./geometry";

export default class Page {
    constructor(position, size) {
        this.position = position;
        this.size = size;
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
}
