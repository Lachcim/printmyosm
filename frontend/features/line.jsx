import Feature from "./feature";

export default class Line extends Feature {
    constructor(id, points) {
        super(id, "line");
        this.points = points;
    }

    toJson() {
        return { ...super.toJson(), points: this.points };
    }

    get complete() {
        return this.points.length >= 2;
    }
}
