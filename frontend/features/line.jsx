import Feature from "./feature";

export default class Line extends Feature {
    constructor(json) {
        super(json);
        this.points = json["points"] ?? [];
    }

    toJson() {
        return { ...super.toJson(), points: this.points };
    }

    get complete() {
        return this.points.length >= 2;
    }
}
