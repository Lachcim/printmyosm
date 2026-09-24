import React, { useContext, memo } from "react";
import { CircleMarker, Polyline } from "react-leaflet";

import { MapHoverContext } from "../components/map";
import { finishLine } from "./features";
import Feature from "./feature";

const PolylineVector = memo(function PolylineVector({ points, style }) {
    return (
        <Polyline
            pathOptions={style}
            positions={points}
            interactive={false}
        />
    );
});

function UnfinshedPolylineVector({ points, style, onFinish }) {
    const mousePosition = useContext(MapHoverContext);

    const getFinishCircle = () => {
        if (points.length < 2)
            return null;

        return (
            <CircleMarker
                center={points[points.length - 1]}
                radius={7}
                pathOptions={{ ...style, dashArray: null }}
                eventHandlers={{ click: onFinish }}
                bubblingMouseEvents={false}
            />
        );
    };

    return (
        <>
            { getFinishCircle() }
            <Polyline
                pathOptions={style}
                positions={mousePosition ? [...points, mousePosition] : points}
                interactive={false}
            />
        </>
    );
}

export default class Line extends Feature {
    constructor(json) {
        super(json);
        this.points = json["points"] ?? [];
        this.unfinished = json["unfinished"] || this.points.length < 2;
    }

    toJson() {
        return {
            ...super.toJson(),
            points: this.points,
            unfinished: this.unfinished
        };
    }

    get complete() {
        return !this.unfinished;
    }

    handleMapClick(event) {
        if (!this.unfinished)
            return false;

        this.points = [...this.points, [event.latlng.lat, event.latlng.lng]];
        return true;
    }

    finish() {
        delete this.unfinished;
    }

    static style = {
        weight: 1,
        color: "#F44336",
        dashArray: [10, 5]
    };

    getStyle() {
        return Line.style;
    }

    render() {
        if (this.unfinished) {
            return (
                <UnfinshedPolylineVector
                    points={this.points}
                    style={this.getStyle()}
                    onFinish={() => finishLine(this.id)}
                    key={this.id}
                />
            );
        }

        return (
            <PolylineVector
                points={this.points}
                style={this.getStyle()}
                key={this.id}
            />
        );
    }
}
