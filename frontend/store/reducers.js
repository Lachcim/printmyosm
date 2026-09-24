import { createFeature, removeIncompleteFeature } from "../features/features";

export function reduceSetToolbarTab(state, action) {
    state.toolbar.tab = action.payload;

    if (action.payload != "feature") {
        state.toolbar.tool = null;
        removeIncompleteFeature(state);
        state.toolbar.activeFeature = null;
    }
}

export function reduceSetTool(state, action) {
    state.toolbar.tool = action.payload;
    removeIncompleteFeature(state);

    if (action.payload != null)
        state.toolbar.activeFeature = createFeature(state, action.payload);
    else
        state.toolbar.activeFeature = null;
}

export function reduceSetZoomLevel(state, action) {
    state.mapView.zoomLevel = action.payload;
}

export function reduceSetTileSize(state, action) {
    state.mapView.tileSize = action.payload;
}

export function reduceUpdateFeature(state, action) {
    const existingIndex = state.map.features.findIndex(feature => feature.id == action.payload.id);

    if (existingIndex)
        state.map.features[existingIndex] = action.payload;
    else
        state.map.features.push(action.payload);
}
