import React from "react";
import { Polyline } from "react-leaflet";

import Feature from "./feature";

export default class Polygon extends Feature {
    constructor(json) {
        super(json);
        this.points = json["points"] ?? [];
        this.closed = json["closed"] ?? false;
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

    render() {
        return (
            <Polyline pathOptions={{ color: "red" }} positions={this.points} key={this.id}/>
        );
    }
}
