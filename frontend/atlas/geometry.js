export function getBoundingBox(printArea) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const { x, y } of printArea) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
    }

    return {
        min: { x: minX, y: minY },
        max: { x: maxX, y: maxY },
        middle: {
            x: (minX + maxX) / 2,
            y: (minY + maxY) / 2
        }
    };
}

export function getMetersPerTile(y, zoomLevel) {
    const { lat } = tileXYtoLatLong(0, y, zoomLevel);

    const earthRadius = 6378137;
    return 2 * Math.PI * earthRadius * Math.cos(lat / 180 * Math.PI) / 2 ** zoomLevel;
}

export function latLongToTileXY(lat, long, zoomLevel) {
    const latRad = lat / 180 * Math.PI;
    return {
        x: 2 ** zoomLevel * ((long + 180) / 360),
        y: 2 ** (zoomLevel - 1) * (1 - (Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI))
    };
}

export function tileXYtoLatLong(x, y, zoomLevel) {
    const n = 2 ** zoomLevel;
    return {
        lat: Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n))) * 180 / Math.PI,
        long: x / n * 360 - 180
    };
}

export function makePolygon(xyObjectArray) {
    const vertices = xyObjectArray.map(({ x, y }) => [x, y]);

    return {
        type: "Polygon",
        coordinates: [[...vertices, vertices[0]]]
    };
}
