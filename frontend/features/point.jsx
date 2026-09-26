import React, { useContext, memo } from "react";

import { MapHoverContext } from "../components/map";
import DivMarker from "./div-marker";
import Feature from "./feature";

import store from "../store/store";
import { completeFeature, updateFeature } from "../store/actions";

const PointVector = memo(function PointVector({ coordinates, color }) {
    const html = `
        <svg viewBox="-5 -5 10 10">
            <path stroke="${color}" d="M -5 -5 L 5 5 M 5 -5 L -5 5"/>
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

    getColor() {
        return "#BF360C";
    }

    render() {
        if (this.incomplete) {
            return (
                <IncompletePointVector
                    color={this.getColor()}
                    key={this.id}
                />
            );
        }

        return (
            <PointVector
                coordinates={this.coordinates}
                color={this.getColor()}
                key={this.id}
            />
        );
    }
}
