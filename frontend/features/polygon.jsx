import React, { useContext, memo } from "react";
import { useDispatch } from "react-redux";
import { CircleMarker, Polygon as LeftletPolygon, Polyline } from "react-leaflet";

import { MapHoverContext } from "../components/map";
import Feature from "./feature";

import store from "../store/store";
import { completeFeature, updateFeature } from "../store/actions";

const PolygonVector = memo(function PolygonVector({ points, style }) {
    return (
        <LeftletPolygon
            pathOptions={style}
            positions={points}
            interactive={false}
        />
    );
});

function IncompletePolygonVector({ points, style }) {
    const mousePosition = useContext(MapHoverContext);
    const dispatch = useDispatch();

    const getCompleteCircle = () => {
        if (points.length < 3)
            return null;

        return (
            <CircleMarker
                center={points[0]}
                radius={7}
                pathOptions={{ ...style, fill: true }}
                eventHandlers={{ click: () => dispatch(completeFeature()) }}
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
    }

    toJson() {
        return {
            ...super.toJson(),
            points: this.points,
        };
    }

    get defaultLabel() {
        return "Polygon";
    }

    handleMapClick(event) {
        if (!this.incomplete)
            return;

        this.points = [...this.points, [event.latlng.lat, event.latlng.lng]];
        store.dispatch(updateFeature(this.toJson()));
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
