export default class Feature {
    constructor(json) {
        this.id = json["id"];
        this.type = json["type"];
        this.label = json["label"];
    }

    toJson() {
        return { id: this.id, type: this.type, label: this.label };
    }

    getLabel() { return this.label ?? this.defaultLabel; }

    get defaultLabel() {
        throw new Error("Default label not implemented");
    }

    complete() {}

    isComplete() {
        throw new Error("Completeness getter not implemented");
    }

    handleMapClick() { return false; }

    render() {
        throw new Error("Render not implemented");
    }
}
