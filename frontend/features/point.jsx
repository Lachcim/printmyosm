import Feature from "./feature";

export default class Point extends Feature {
    constructor(json) {
        super(json);
        this.coordinates = json["coordinates"] ?? [];
        this.label = json["label"] ?? "";
    }

    toJson() {
        return {
            ...super.toJson(),
            coordinates: this.coordinates,
            label: this.label
        };
    }

    get complete() {
        return this.coordinates != null;
    }
}
