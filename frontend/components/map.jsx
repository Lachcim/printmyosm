import React, { createContext, useEffect, useState, memo } from "react";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import { useSelector, useDispatch } from "react-redux";

import "../style/map";

import { getFeatureFromJson, handleMapClick } from "../features/features";
import { setZoomLevel, setTileSize } from "../store/actions";

export const MapHoverContext = createContext(null);

function MapController({ children }) {
    const [mousePosition, setMousePosition] = useState(null);
    const dispatch = useDispatch();

    const map = useMapEvents({
        click: handleMapClick,
        mousemove: event => setMousePosition([event.latlng.lat, event.latlng.lng]),
        mouseout: () => setMousePosition(null),
        zoomend: event => dispatch(setZoomLevel(event.target.getZoom()))
    });

    useEffect(() => {
        dispatch(setZoomLevel(map.getZoom()));
    }, [dispatch, map]);

    return (
        <MapHoverContext value={mousePosition}>
            { children }
        </MapHoverContext>
    );
}

const MapFeatures = memo(function MapFeatures() {
    const features = useSelector(state => state.map.features);
    return features.map(feature => getFeatureFromJson(feature).render());
});

export default function Map() {
    const tileSize = useSelector(state => state.mapView.tileSize);
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
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                eventHandlers={tileLayerEventHandlers}
            />
            <MapController>
                <MapFeatures/>
            </MapController>
        </MapContainer>
    );
}
