function resetActiveFeature(state) {
    if (!state.toolbar.activeFeature)
        return;

    if (!state.toolbar.activeFeature.complete) {
        state.map.features = state.map.features.filter(feature => feature.id != state.toolbar.activeFeature.id);
    }

    state.toolbar.activeFeature = null;
}

export function reduceSetToolbarTab(state, action) {
    state.toolbar.tab = action.payload;

    if (action.payload != "feature") {
        state.toolbar.tool = null;
        resetActiveFeature(state);
    }
}

export function reduceSetTool(state, action) {
    state.toolbar.tool = action.payload;
    resetActiveFeature(state);
}

export function reduceSetZoomLevel(state, action) {
    state.mapView.zoomLevel = action.payload;
}

export function reduceSetTileSize(state, action) {
    state.mapView.tileSize = action.payload;
}
