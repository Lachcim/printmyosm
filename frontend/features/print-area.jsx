import Feature from "./feature";

export default class PrintArea extends Feature {
    constructor(id, points) {
        super(id, "printArea");
        this.points = points;
    }

    toJson() {
        return { ...super.toJson(), points: this.points };
    }

    get complete() {
        return this.points.length >= 3;
    }
}
