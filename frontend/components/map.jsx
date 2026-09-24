import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";

import "../style/map";

export default function Map() {
    return (
        <MapContainer className="map" center={[51.505, -0.09]} zoom={13}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
        </MapContainer>
    );
}
