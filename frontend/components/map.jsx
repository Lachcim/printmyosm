import React, { useEffect } from "react";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import { useSelector, useDispatch } from "react-redux";

import "../style/map";

import { getFeatureFromJson, handleMapEvent } from "../features/features";
import { setZoomLevel, setTileSize } from "../store/actions";

function MapController() {
    const dispatch = useDispatch();
    const map = useMapEvents({
        click: handleMapEvent,
        mousemove: handleMapEvent,
        mouseout: handleMapEvent,
        zoomend: event => dispatch(setZoomLevel(event.target.getZoom()))
    });

    useEffect(() => {
        dispatch(setZoomLevel(map.getZoom()));
    }, [dispatch, map]);
}

export default function Map() {
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
            <MapController/>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                eventHandlers={tileLayerEventHandlers}
            />
            { features.map(feature => getFeatureFromJson(feature).render()) }
        </MapContainer>
    );
}
