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
        const printArea = printAreaLatLong.map(
            ([lat, long]) => Atlas.latLongToTileXY(lat, long, geometry.zoomLevel)
        );

        const boundingBox = Atlas.getBoundingBox(printArea);
        const middleY = (boundingBox.min.y + boundingBox.max.y) / 2;

        const metersPerTile = Atlas.getMetersPerTile(middleY, geometry.zoomLevel);
        const pageSize = Atlas.getPageSize(geometry, metersPerTile);
        console.log(metersPerTile);
        console.log(boundingBox);
        console.log(pageSize);
    }

    static getBoundingBox(printArea) {
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
            max: { x: maxX, y: maxY }
        };
    }

    static getMetersPerTile(y, zoomLevel) {
        const { lat } = Atlas.tileXYtoLatLong(0, y, zoomLevel);

        const earthRadius = 6378137;
        return 2 * Math.PI * earthRadius * Math.cos(lat / 180 * Math.PI) / 2 ** zoomLevel;
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

    static latLongToTileXY(lat, long, zoomLevel) {
        const latRad = lat / 180 * Math.PI;
        return {
            x: 2 ** zoomLevel * ((long + 180) / 360),
            y: 2 ** (zoomLevel - 1) * (1 - (Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI))
        };
    }

    static tileXYtoLatLong(x, y, zoomLevel) {
        const n = 2 ** zoomLevel;
        return {
            lat: Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n))) * 180 / Math.PI,
            long: x / n * 360 - 180
        };
    }
}

new Atlas(
    [
        [
            50.77645768628246,
            22.090244293212894
        ],
        [
            50.76277250026773,
            22.147579193115238
        ],
        [
            50.74756204229723,
            22.272891998291016
        ],
        [
            50.71777869756637,
            22.40266799926758
        ],
        [
            50.697767574014044,
            22.476310729980472
        ],
        [
            50.677529455319124,
            22.675437927246094
        ],
        [
            50.62482799053481,
            22.886238098144535
        ],
        [
            50.625481676420115,
            23.04794311523438
        ],
        [
            50.51741340240051,
            23.047256469726566
        ],
        [
            50.5200340598249,
            22.71011352539063
        ],
        [
            50.57894470922133,
            22.537765502929688
        ],
        [
            50.59943289671559,
            22.15805053710938
        ],
        [
            50.63300628327606,
            22.069473266601566
        ]
    ],
    {
        zoomLevel: 14,
        scale: 100000, // 1cm = 1km
        paperSize: "A4",
        landscape: false,
        borderless: false
    }
);
