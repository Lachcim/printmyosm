export default class Feature {
    constructor(json) {
        this.id = json["id"];
        this.type = json["type"];
    }

    toJson() {
        return { id: this.id, type: this.type };
    }

    get complete() {
        throw new Error("Completeness getter not implemented");
    }

    handleMapClick() { return false; }

    render() {
        throw new Error("Render not implemented");
    }
}
