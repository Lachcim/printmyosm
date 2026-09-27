import React, { useContext, memo } from "react";
import { useDispatch } from "react-redux";
import { CircleMarker, Polygon as LeftletPolygon, Polyline } from "react-leaflet";

import { MapHoverContext } from "../components/map";
import Feature from "./feature";

import store from "../store/store";
import { completeFeature, updateFeature } from "../store/actions";

const getStyle = (color, heavy) => {
    return {
        color: heavy ? "#31572C" : color,
        weight: heavy ? 2 : 1,
        fill: !heavy,
        fillOpacity: 0.1,
        lineJoin: heavy ? "miter" : "round"
    };
};

const PolygonVector = memo(function PolygonVector({ points, color, heavy }) {
    return (
        <LeftletPolygon
            pathOptions={getStyle(color, heavy)}
            positions={points}
            interactive={false}
        />
    );
});

function IncompletePolygonVector({ points, color, heavy }) {
    const mousePosition = useContext(MapHoverContext);
    const dispatch = useDispatch();

    const style = getStyle(color, heavy);

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

    get heavy() {
        return false;
    }

    get defaultColor() {
        return "orange";
    }

    render() {
        const color = !this.heavy && { color: this.resolveColor() };
        const style = { heavy: this.heavy, ...color };

        if (this.incomplete) {
            return (
                <IncompletePolygonVector
                    points={this.points}
                    key={this.id}
                    {...style}
                />
            );
        }

        return (
            <PolygonVector
                points={this.points}
                key={this.id}
                {...style}
            />
        );
    }
}
