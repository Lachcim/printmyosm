class Page {
    constructor(map, firstFullTileX, firstFullTileY, xOffset, yOffset) {
        this.map = map;
        this.firstFullTileX = firstFullTileX;
        this.firstFullTileY = firstFullTileY;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
    }

    *[Symbol.iterator]() {
        const firstX = this.firstFullTileX - (this.xOffset != 0);
        const firstY = this.firstFullTileY - (this.yOffset != 0);

        let yTile = firstY;
        for (let top = this.yOffset; top < this.map.getPagePrintableHeight(); top += this.map.tileSize) {
            let xTile = firstX;
            for (let left = this.xOffset; left < this.map.getPagePrintableWidth(); left += this.map.tileSize) {
                yield {
                    left,
                    top,
                    x: xTile,
                    y: yTile
                };

                xTile++;
            }

            yTile++;
        }
    }
}

class TileMap {
    tileSize = 25;
    pageWidth = 210;
    pageHeight = 294;
    pageMargin = 20;

    getPagePrintableWidth() { return this.pageWidth - this.pageMargin; }
    getPagePrintableHeight() { return this.pageHeight - this.pageMargin; }

    constructor(files) {
        if (!files)
            throw RangeError("No files selected");

        this.zoom = null;
        this.minX = null;
        this.maxX = null;
        this.minY = null;
        this.maxY = null;

        this.tiles = new Map();
        this.pages = [];

        for (const file of files) {
            const nameElements = file.name.substring(0, file.name.indexOf(".")).split("-");

            const zoom = parseInt(nameElements[0]);
            const x = parseInt(nameElements[1]);
            const y = parseInt(nameElements[2]);

            if (Number.isNaN(zoom) || Number.isNaN(x) || Number.isNaN(y))
                throw RangeError(`Invalid filename ${file.name}`)

            if (this.zoom == null)
                this.zoom = zoom;
            else if (this.zoom != zoom)
                throw RangeError("Inconsistent zoom level");

            if (this.minX == null) {
                this.minX = x;
                this.maxX = x;
                this.minY = y;
                this.maxY = y;
            }

            if (x < this.minX) this.minX = x;
            else if (x > this.maxX) this.maxX = x;
            if (y < this.minY) this.minY = y;
            else if (y > this.maxY) this.maxY = y;

            if (!this.tiles.has(y))
                this.tiles.set(y, new Map());

            this.tiles.get(y).set(x, URL.createObjectURL(file));
        }
    }

    generatePages() {
        const getInitialOffset = (tileCount, printableLength) => {
            const pageCount = Math.ceil(tileCount * this.tileSize / printableLength);
            const initialOffset = Math.floor((pageCount * printableLength - tileCount * this.tileSize) / 2);

            if (initialOffset == 0) {
                return {
                    millimeters: 0,
                    tiles: 0
                };
            }

            const tiles = -Math.floor(initialOffset / this.tileSize);
            const millimeters = initialOffset + (tiles - 1) * this.tileSize;

            return { millimeters, tiles };
        };

        const xInitialOffset = getInitialOffset(this.maxX - this.minX + 1, this.getPagePrintableWidth());
        const yInitialOffset = getInitialOffset(this.maxY - this.minY + 1, this.getPagePrintableHeight());

        const firstPage = new Page(
            this,
            this.minX + xInitialOffset.tiles,
            this.minY + yInitialOffset.tiles,
            xInitialOffset.millimeters,
            yInitialOffset.millimeters
        );

        this.pages.push(firstPage);
    }
}

function renderTileMap(tileMap) {
    const section = document.createElement("section");
    const sectionBody = document.createElement("div");

    section.className = "tiles";
    sectionBody.style.width = `${tileMap.getPagePrintableWidth()}mm`;
    sectionBody.style.height = `${tileMap.getPagePrintableHeight()}mm`;

    document.body.appendChild(section);
    section.appendChild(sectionBody);

    for (const tile of tileMap.pages[0]) {
        const src = tileMap.tiles.get(tile.y)?.get(tile.x);
        if (!src)
            continue;

        const tileImg = document.createElement("img");
        tileImg.style.width = `${tileMap.tileSize}mm`;
        tileImg.style.height = `${tileMap.tileSize}mm`;
        tileImg.style.left = `${tile.left}mm`;
        tileImg.style.top = `${tile.top}mm`;
        tileImg.src = src;

        sectionBody.append(tileImg);
    }
}

function handleUpload(event) {
    const tileMap = new TileMap(event.srcElement.files);
    tileMap.generatePages();

    renderTileMap(tileMap);
}

window.addEventListener("load", () => {
    document.getElementById("upload").addEventListener("change", handleUpload);
});
