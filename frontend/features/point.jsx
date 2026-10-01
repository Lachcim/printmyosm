import React, { useContext, memo } from "react";
import { useSelector } from "react-redux";

import { MapHoverContext } from "../components/map";
import DivMarker from "./div-marker";
import Feature from "./feature";

import store from "../store/store";
import { completeFeature, updateFeature } from "../store/actions";

const PointVector = memo(function PointVector({ id, coordinates, color }) {
    const highlightedFeature = useSelector(state => state.toolbar.highlightedFeature);

    const html = `
        <svg viewBox="-5 -5 10 10">
            <path stroke="${color}" stroke-width="${highlightedFeature == id ? 3 : 1}" d="M -5 -5 L 5 5 M 5 -5 L -5 5"/>
        </svg>
    `;

    return (
        <DivMarker
            html={html}
            position={coordinates}
            size={[10, 10]}
            interactive={false}
        />
    );
});

function IncompletePointVector({ color }) {
    const mousePosition = useContext(MapHoverContext);

    if (!mousePosition)
        return null;

    return (
        <>
            <PointVector
                color={color}
                coordinates={mousePosition}
            />
        </>
    );
}

const PointSvgVector = memo(function PointVector({ coordinates, project, color }) {
    const [lat, long] = coordinates;
    const { x, y } = project(lat, long);

    return (
        <path stroke={color} d={`M ${x} ${y} m -5 -5 l 10 10 m -10 0 l 10 -10`}/>
    );
});

export default class Point extends Feature {
    constructor(json) {
        super(json);
        this.coordinates = json["coordinates"] ?? null;
    }

    toJson() {
        return {
            ...super.toJson(),
            coordinates: this.coordinates
        };
    }

    get defaultLabel() {
        return "Point";
    }

    handleMapClick(event) {
        if (!this.incomplete)
            return;

        this.coordinates = [event.latlng.lat, event.latlng.lng];
        store.dispatch(updateFeature(this.toJson()));
        store.dispatch(completeFeature());
    }

    get defaultColor() {
        return "red";
    }

    render(project) {
        if (project) {
            return (
                <PointSvgVector
                    coordinates={this.coordinates}
                    project={project}
                    color={this.resolveColor()}
                    key={this.id}
                />
            );
        }

        if (this.incomplete) {
            return (
                <IncompletePointVector
                    color={this.resolveColor()}
                    key={this.id}
                />
            );
        }

        return (
            <PointVector
                id={this.id}
                coordinates={this.coordinates}
                color={this.resolveColor()}
                key={this.id}
            />
        );
    }
}
