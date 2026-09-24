export default class Feature {
    constructor(id, type) {
        this.id = id;
        this.type = type;
    }

    toJson() {
        return { id: this.id, type: this.type };
    }

    get complete() {
        throw new Error("Completeness getter not implemented");
    }

    handleMapClick() { return false; }
    handleMapMouseMove() { return false; }
    handleMapMouseOut() { return false; }

    render() {
        throw new Error("Render not implemented");
    }
}
