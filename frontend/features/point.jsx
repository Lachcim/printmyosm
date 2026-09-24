import Feature from "./feature";

export default class Point extends Feature {
    constructor(id, coordinates, label) {
        super(id, "point");
        this.coordinates = coordinates;
        this.label = label;
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
