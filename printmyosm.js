class Grid {
    constructor(files) {
        if (!files)
            throw RangeError("No files selected");

        this.zoom = null;
        this.minX = null;
        this.maxX = null;
        this.minY = null;
        this.maxY = null;
        this.tiles = new Map();

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

            if (x < this.minX || this.minX == null) this.minX = x;
            else if (x > this.maxX || this.maxX == null) this.maxX = x;
            if (y < this.minY || this.minY == null) this.minY = y;
            else if (y > this.maxY || this.maxY == null) this.maxY = y;

            this.tiles.set(`${x} ${y}`, URL.createObjectURL(file));
        }
    }
}

function handleUpload(event) {
    const grid = new Grid(event.srcElement.files);
    console.log(grid);
}

window.addEventListener("load", () => {
    document.getElementById("upload").addEventListener("change", handleUpload);
});
