import React, { useContext } from "react";
import { CircleMarker, Polygon as LeftletPolygon, Polyline } from "react-leaflet";

import { MapHoverContext } from "../components/map";
import { closePolygon } from "./features";
import Feature from "./feature";

const pathOptions = {
    weight: 1,
    color: "#BF360C"
};

function PolygonVector({ points }) {
    return (
        <LeftletPolygon
            pathOptions={pathOptions}
            positions={points}
            interactive={false}
        />
    );
}

function UnclosedPolygonVector({ points, onClose }) {
    const mousePosition = useContext(MapHoverContext);

    const getCloseCircle = () => {
        if (points.length == 0)
            return null;

        return (
            <CircleMarker
                center={points[0]}
                radius={5}
                pathOptions={pathOptions}
                eventHandlers={{ click: onClose }}
                bubblingMouseEvents={false}
            />
        );
    };

    return (
        <>
            { getCloseCircle() }
            <Polyline
                pathOptions={pathOptions}
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
        this.unclosed = json["unclosed"] || this.points.length < 3;
    }

    toJson() {
        return {
            ...super.toJson(),
            points: this.points,
            unclosed: this.unclosed
        };
    }

    get complete() {
        return !this.unclosed;
    }

    handleMapClick(event) {
        if (!this.unclosed)
            return false;

        this.points = [...this.points, [event.latlng.lat, event.latlng.lng]];
        return true;
    }

    close() {
        if (this.points.length < 3)
            return;

        delete this.unclosed;
    }

    render() {
        if (this.unclosed) {
            return (
                <UnclosedPolygonVector
                    points={this.points}
                    onClose={() => closePolygon(this.id)}
                    key={this.id}
                />
            );
        }

        return <PolygonVector points={this.points} key={this.id}/>;
    }
}
