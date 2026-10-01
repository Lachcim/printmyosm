import React, { createContext, useContext, useEffect, useState, memo } from "react";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import { useSelector, useDispatch } from "react-redux";

import "../style/map";

import { getFeatureFromJson, handleMapClick } from "../features/features";
import { setZoomLevel, setTileSize } from "../store/actions";

import useAtlas from "../atlas/use-atlas";
import { PageVector } from "../atlas/page";

const MapHoverContext = createContext(null);

export function useMapHover() {
    return useContext(MapHoverContext);
}

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
    const { atlas } = useAtlas();
    const features = useSelector(state => state.map?.features) ?? [];
    const activeFeature = useSelector(state => state.toolbar.activeFeature);

    return (
        <>
            { features.map(feature => getFeatureFromJson(feature).render()) }
            { activeFeature instanceof Object && getFeatureFromJson(activeFeature).render() }
            { atlas && atlas.pages.map(page => <PageVector key={page.id} page={page}/>) }
        </>
    );
});

export default function Map() {
    const tileSize = useSelector(state => state.mapView.tileSize);
    const dispatch = useDispatch();

    const tileLayerEventHandlers = {
        tileload: event => {
            const width = event.tile.naturalWidth;
            const height = event.tile.naturalHeight;
            if (tileSize?.width != width || tileSize?.height != height)
                dispatch(setTileSize({ width, height }));
        }
    };

    return (
        <MapContainer className="map" center={[49.1925, 16.608333]} zoom={5}>
            <TileLayer
                url="/tile/{z}/{x}/{y}"
                eventHandlers={tileLayerEventHandlers}
            />
            <MapController>
                <MapFeatures/>
            </MapController>
        </MapContainer>
    );
}
