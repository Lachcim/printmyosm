import { v4 as uuidv4 } from "uuid";

import { getFeatureFromJson } from "../features/features";

export function reduceCreateNewMap(state) {
    state.map = {
        id: uuidv4(),
        name: null,
        features: [],
        geometry: null
    };
}

export function reduceLoadMap(state, action) {
    state.map = action.payload;
}

export function reduceSetMapName(state, action) {
    if (!state.map)
        return;

    state.map.name = action.payload;
}

export function reduceSetToolbarTab(state, action) {
    state.toolbar.tab = action.payload;

    if (action.payload != "feature") {
        state.toolbar.tool = null;
        state.toolbar.activeFeature = null;
    }
}

export function reduceSetTool(state, action) {
    state.toolbar.tool = action.payload;

    if (action.payload != null)
        state.toolbar.activeFeature = getFeatureFromJson({ id: uuidv4(), type: action.payload }).toJson();
}

export function reduceSetZoomLevel(state, action) {
    state.mapView.zoomLevel = action.payload;
}

export function reduceSetTileSize(state, action) {
    state.mapView.tileSize = action.payload;
}

export function reduceCompleteFeature(state) {
    if (!(state.toolbar.activeFeature instanceof Object))
        return;

    state.map.features.push(state.toolbar.activeFeature);
    state.toolbar.activeFeature = state.toolbar.activeFeature.id;
    state.toolbar.tool = null;
}

export function reduceUpdateFeature(state, action) {
    if (state.toolbar.activeFeature instanceof Object && state.toolbar.activeFeature.id == action.payload.id) {
        state.toolbar.activeFeature = action.payload;
        return;
    }

    const existingIndex = state.map.features.findIndex(feature => feature.id == action.payload.id);

    if (existingIndex != null)
        state.map.features[existingIndex] = action.payload;
    else
        state.map.features.push(action.payload);
}

export function reducePrintAreaStarted(state, action) {
    const filteredFeatures = state.map.features.filter(feature => feature.type != "printArea" || feature.id == action.payload);

    if (filteredFeatures.length != state.map.features.length)
        state.map.features = filteredFeatures;
}

export function reduceRemoveFeature(state, action) {
    state.map.features = state.map.features.filter(feature => feature.id != action.payload);
    if (state.toolbar.activeFeature == action.payload)
        state.toolbar.activeFeature = null;
}
