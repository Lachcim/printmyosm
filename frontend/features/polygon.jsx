import Feature from "./feature";

export default class Polygon extends Feature {
    constructor(id, points, closed) {
        super(id, "polygon");
        this.points = points;
        this.closed = closed;
    }

    toJson() {
        return {
            ...super.toJson(),
            points: this.points,
            closed: this.closed
        };
    }

    get complete() {
        return this.closed;
    }

    handleMapClick(event) {
        if (this.closed)
            return false;

        this.points = [...this.points, [event.latlng.lat, event.latlng.lng]];
        return true;
    }
}
