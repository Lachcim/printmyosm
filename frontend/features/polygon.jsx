import React, { useContext, memo } from "react";
import { CircleMarker, Polygon as LeftletPolygon, Polyline } from "react-leaflet";

import { MapHoverContext } from "../components/map";
import { completeFeature } from "./features";
import Feature from "./feature";

const PolygonVector = memo(function PolygonVector({ points, style }) {
    return (
        <LeftletPolygon
            pathOptions={style}
            positions={points}
            interactive={false}
        />
    );
});

function IncompletePolygonVector({ points, style, onComplete }) {
    const mousePosition = useContext(MapHoverContext);

    const getCompleteCircle = () => {
        if (points.length < 3)
            return null;

        return (
            <CircleMarker
                center={points[0]}
                radius={7}
                pathOptions={{ ...style, fill: true }}
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

export default class Polygon extends Feature {
    constructor(json) {
        super(json);
        this.points = json["points"] ?? [];
        this.incomplete = json["incomplete"] || this.points.length < 3;
    }

    toJson() {
        return {
            ...super.toJson(),
            points: this.points,
            incomplete: this.incomplete
        };
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
        color: "#BF360C",
        fillOpacity: 0.1
    };

    getStyle() {
        return Polygon.style;
    }

    render() {
        if (this.incomplete) {
            return (
                <IncompletePolygonVector
                    points={this.points}
                    style={this.getStyle()}
                    onComplete={() => completeFeature(this.id)}
                    key={this.id}
                />
            );
        }

        return (
            <PolygonVector
                points={this.points}
                style={this.getStyle()}
                key={this.id}
            />
        );
    }
}
