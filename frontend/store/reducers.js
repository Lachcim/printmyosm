export function reduceSetToolbarTab(state, action) {
    state.toolbar.tab = action.payload;

    if (action.payload != "feature") {
        state.toolbar.currentTool = null;
        state.toolbar.currentFeature = null;
    }
}

export function reduceSetTool(state, action) {
    state.toolbar.currentTool = action.payload;
}
