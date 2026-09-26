import React, { useContext, memo } from "react";
import { useDispatch } from "react-redux";
import { CircleMarker, Polyline } from "react-leaflet";

import { MapHoverContext } from "../components/map";
import Feature from "./feature";

import store from "../store/store";
import { completeFeature, updateFeature } from "../store/actions";

const PolylineVector = memo(function PolylineVector({ points, style }) {
    return (
        <Polyline
            pathOptions={style}
            positions={points}
            interactive={false}
        />
    );
});

function IncompletePolylineVector({ points, style }) {
    const mousePosition = useContext(MapHoverContext);
    const dispatch = useDispatch();

    const getCompleteCircle = () => {
        if (points.length < 2)
            return null;

        return (
            <CircleMarker
                center={points[points.length - 1]}
                radius={7}
                pathOptions={{ ...style, dashArray: null }}
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

export default class Line extends Feature {
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
        return "Line";
    }

    handleMapClick(event) {
        if (!this.incomplete)
            return;

        this.points = [...this.points, [event.latlng.lat, event.latlng.lng]];
        store.dispatch(updateFeature(this.toJson()));
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
