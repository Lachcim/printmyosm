export function reduceSetToolbarTab(state, action) {
    state.toolbar.tab = action.payload;

    if (action.payload != "feature") {
        state.toolbar.currentTool = null;
        state.toolbar.currentFeature = null;
    }
}
