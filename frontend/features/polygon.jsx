import React, { useContext } from "react";
import { CircleMarker, Polygon as LeftletPolygon, Polyline } from "react-leaflet";

import { MapHoverContext } from "../components/map";
import { closePolygon } from "./features";
import Feature from "./feature";

function PolygonVector({ points, style }) {
    return (
        <LeftletPolygon
            pathOptions={style}
            positions={points}
            interactive={false}
        />
    );
}

function UnclosedPolygonVector({ points, style, onClose }) {
    const mousePosition = useContext(MapHoverContext);

    const getCloseCircle = () => {
        if (points.length == 0)
            return null;

        return (
            <CircleMarker
                center={points[0]}
                radius={5}
                pathOptions={{ ...style, fill: true }}
                eventHandlers={{ click: onClose }}
                bubblingMouseEvents={false}
            />
        );
    };

    return (
        <>
            { getCloseCircle() }
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
        const getStyle = () => {
            if (this.type == "printArea") {
                return {
                    weight: 2,
                    color: "#31572C",
                    fill: false,
                    lineJoin: "miter"
                };
            }

            return {
                weight: 1,
                color: "#BF360C",
                fillOpacity: 0.1
            };
        };

        if (this.unclosed) {
            return (
                <UnclosedPolygonVector
                    points={this.points}
                    style={getStyle()}
                    onClose={() => closePolygon(this.id)}
                    key={this.id}
                />
            );
        }

        return (
            <PolygonVector
                points={this.points}
                style={getStyle()}
                key={this.id}
            />
        );
    }
}
