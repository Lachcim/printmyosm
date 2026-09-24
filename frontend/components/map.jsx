import React, { createContext, useEffect, useState } from "react";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import { useSelector, useDispatch } from "react-redux";

import "../style/map";

import { getFeatureFromJson, handleMapClick } from "../features/features";
import { setZoomLevel, setTileSize } from "../store/actions";

export const MapHoverContext = createContext(null);

function MapController({ onMouseMove, onMouseOut }) {
    const dispatch = useDispatch();
    const map = useMapEvents({
        click: handleMapClick,
        mousemove: onMouseMove,
        mouseout: onMouseOut,
        zoomend: event => dispatch(setZoomLevel(event.target.getZoom()))
    });

    useEffect(() => {
        dispatch(setZoomLevel(map.getZoom()));
    }, [dispatch, map]);
}

export default function Map() {
    const [mousePosition, setMousePosition] = useState(null);
    const tileSize = useSelector(state => state.mapView.tileSize);
    const features = useSelector(state => state.map.features);
    const dispatch = useDispatch();

    const tileLayerEventHandlers = {
        tileload: event => {
            const { x, y } = event.target.getTileSize();
            if (tileSize?.x != x || tileSize?.y != y)
                dispatch(setTileSize({ x, y }));
        }
    };

    return (
        <MapContainer className="map" center={[0, 0]} zoom={4}>
            <MapController
                onMouseMove={event => setMousePosition([event.latlng.lat, event.latlng.lng])}
                onMouseOut={() => setMousePosition(null)}
            />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                eventHandlers={tileLayerEventHandlers}
            />
            <MapHoverContext value={mousePosition}>
                { features.map(feature => getFeatureFromJson(feature).render()) }
            </MapHoverContext>
        </MapContainer>
    );
}
