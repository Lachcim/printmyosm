import Feature from "./feature";

export default class Polygon extends Feature {
    constructor(id, points) {
        super(id, "polygon");
        this.points = points;
    }

    toJson() {
        return { ...super.toJson(), points: this.points };
    }

    get complete() {
        return this.points.length >= 3;
    }
}
