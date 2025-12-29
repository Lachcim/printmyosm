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

    getRightNeighbor() {
        const tileDifference = Math.floor((this.map.getPagePrintableWidth() - this.xOffset) / this.map.tileSize);
        const offsetDifference = this.map.tileSize * tileDifference - this.map.getPagePrintableWidth();

        if (this.firstFullTileX + tileDifference > this.map.maxX)
            return null;

        return new Page(
            this.map,
            this.firstFullTileX + tileDifference,
            this.firstFullTileY,
            this.xOffset + offsetDifference,
            this.yOffset
        );
    }

    getBottomNeighbor() {
        const tileDifference = Math.floor((this.map.getPagePrintableHeight() - this.yOffset) / this.map.tileSize);
        const offsetDifference = this.map.tileSize * tileDifference - this.map.getPagePrintableHeight();

        if (this.firstFullTileY + tileDifference > this.map.maxY)
            return null;

        return new Page(
            this.map,
            this.firstFullTileX,
            this.firstFullTileY + tileDifference,
            this.xOffset,
            this.yOffset + offsetDifference
        );
    }

    isNull() {
        for (const tile of this) {
            if (this.map.tiles.get(tile.y)?.has(tile.x))
                return false;
        }

        return true;
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
        this.pages = new Map();

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

        let page = firstPage;
        let rowStart = page;
        let pageX = 0;
        let pageY = 0;

        while (page) {
            if (!page.isNull()) {
                if (!this.pages.has(pageY))
                    this.pages.set(pageY, new Map());

                this.pages.get(pageY).set(pageX, page);
            }

            page = page.getRightNeighbor();
            pageX++;

            if (!page) {
                page = rowStart.getBottomNeighbor();
                rowStart = page;

                pageX = 0;
                pageY++;
            }
        }
    }
}

function renderTileMap(tileMap) {
    tileMap.pages.entries().forEach(([y, column]) => column.entries().forEach(([x, page]) => {
        const section = document.createElement("section");
        const sectionBody = document.createElement("div");

        section.className = "tiles";
        section.setAttribute("data-x", x);
        section.setAttribute("data-y", y);
        sectionBody.style.width = `${tileMap.getPagePrintableWidth()}mm`;
        sectionBody.style.height = `${tileMap.getPagePrintableHeight()}mm`;

        document.body.appendChild(section);
        section.appendChild(sectionBody);

        for (const tile of page) {
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
    }));
}

function updatePageNumbers() {
    const sections = document.querySelectorAll("section.tiles");

    let pageNumber = 1;
    const pageNumbers = new Map();

    for (const section of sections) {
        const existingElements = section.querySelectorAll(".page-number, .page-hint");
        existingElements.forEach(element => element.remove());

        const pageNumberElement = document.createElement("p");
        pageNumberElement.className = "page-number";
        pageNumberElement.innerText = pageNumber;
        section.appendChild(pageNumberElement);

        const pageX = parseInt(section.getAttribute("data-x"));
        const pageY = parseInt(section.getAttribute("data-y"));

        if (!pageNumbers.has(pageY))
            pageNumbers.set(pageY, new Map());

        pageNumbers.get(pageY).set(pageX, pageNumber);
        pageNumber++;
    }

    for (const section of sections) {
        const pageX = parseInt(section.getAttribute("data-x"));
        const pageY = parseInt(section.getAttribute("data-y"));

        const neighbors = {
            up: pageNumbers.get(pageY - 1)?.get(pageX),
            right: pageNumbers.get(pageY)?.get(pageX + 1),
            down: pageNumbers.get(pageY + 1)?.get(pageX),
            left: pageNumbers.get(pageY)?.get(pageX - 1)
        };

        for (const [relation, page] of Object.entries(neighbors)) {
            if (!page)
                continue;

            const pageHint = document.createElement("p");
            pageHint.className = `page-hint ${relation}`;
            pageHint.innerText = page;

            const arrow = document.createElement("img");
            arrow.className = "arrow";
            arrow.src = "img/arrow.svg";

            pageHint.insertBefore(arrow, pageHint.childNodes[0]);
            section.appendChild(pageHint);
        }
    }
}

function handleUpload(event) {
    const tileMap = new TileMap(event.srcElement.files);
    tileMap.generatePages();

    renderTileMap(tileMap);
    updatePageNumbers();

    document.getElementById("home").hidden = true;
    document.getElementById("cover").hidden = false;
}

window.addEventListener("load", () => {
    document.getElementById("upload").addEventListener("change", handleUpload);
});
