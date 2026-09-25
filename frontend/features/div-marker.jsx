import React from "react";
import { Marker } from "react-leaflet";
import { divIcon } from "leaflet";

import "../style/div-marker";

export default function DivMarker({ position, size, html, interactive }) {
    const icon = divIcon({
        html,
        className: "div-marker",
        iconSize: size,
        iconAnchor: [size[0] / 2, size[1] / 2]
    });

    return (
        <Marker position={position} icon={icon} interactive={interactive}/>
    );
}
