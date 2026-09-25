import React, { useContext, memo } from "react";
import { CircleMarker, Polyline } from "react-leaflet";

import { MapHoverContext } from "../components/map";
import { completeFeature } from "./features";
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

function IncompletePolylineVector({ points, style, onComplete }) {
    const mousePosition = useContext(MapHoverContext);

    const getCompleteCircle = () => {
        if (points.length < 2)
            return null;

        return (
            <CircleMarker
                center={points[points.length - 1]}
                radius={7}
                pathOptions={{ ...style, dashArray: null }}
                eventHandlers={{ click: onComplete }}
                bubblingMouseEvents={false}
            />
        );
    };

    return (
        <>
            { getCompleteCircle() }
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
        this.incomplete = json["incomplete"] || this.points.length < 2;
    }

    toJson() {
        return {
            ...super.toJson(),
            points: this.points,
            incomplete: this.incomplete
        };
    }

    get defaultLabel() {
        return "Line";
    }

    complete() {
        delete this.incomplete;
    }

    isComplete() {
        return !this.incomplete;
    }

    handleMapClick(event) {
        if (!this.incomplete)
            return false;

        this.points = [...this.points, [event.latlng.lat, event.latlng.lng]];
        return true;
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
        if (this.incomplete) {
            return (
                <IncompletePolylineVector
                    points={this.points}
                    style={this.getStyle()}
                    onComplete={() => completeFeature(this.id)}
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
