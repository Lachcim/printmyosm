import React, { useContext, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CircleMarker, Polyline } from "react-leaflet";

import { MapHoverContext } from "../components/map";
import Feature from "./feature";

import store from "../store/store";
import { completeFeature, updateFeature } from "../store/actions";

const PolylineVector = memo(function PolylineVector({ id, points, color }) {
    const highlightedFeature = useSelector(state => state.toolbar.highlightedFeature);

    const style = {
        weight: highlightedFeature == id ? 2 : 1,
        dashArray: [10, 5],
        color
    };

    return (
        <Polyline
            pathOptions={style}
            positions={points}
            interactive={false}
        />
    );
});

function IncompletePolylineVector({ points, color }) {
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

    const style = {
        weight: 1,
        dashArray: [10, 5],
        color
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

    get defaultColor() {
        return "red";
    }

    render() {
        if (this.incomplete) {
            return (
                <IncompletePolylineVector
                    points={this.points}
                    color={this.resolveColor()}
                    key={this.id}
                />
            );
        }

        return (
            <PolylineVector
                id={this.id}
                points={this.points}
                color={this.resolveColor()}
                key={this.id}
            />
        );
    }
}
