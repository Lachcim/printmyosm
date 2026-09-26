import { configureStore, createReducer } from "@reduxjs/toolkit";

import * as actions from "./actions";
import * as reducers from "./reducers";

const initialState = {
    toolbar: {
        tab: "features",
        tool: null,
        activeFeature: null
    },
    map: null,
    mapView: {
        zoomLevel: null,
        tileSize: null
    }
};

const store = configureStore({
    reducer: createReducer(initialState, builder => {
        builder.addCase(actions.createNewMap, reducers.reduceCreateNewMap);
        builder.addCase(actions.loadMap, reducers.reduceLoadMap);
        builder.addCase(actions.setToolbarTab, reducers.reduceSetToolbarTab);
        builder.addCase(actions.setTool, reducers.reduceSetTool);
        builder.addCase(actions.setZoomLevel, reducers.reduceSetZoomLevel);
        builder.addCase(actions.setTileSize, reducers.reduceSetTileSize);
        builder.addCase(actions.completeFeature, reducers.reduceCompleteFeature);
        builder.addCase(actions.updateFeature, reducers.reduceUpdateFeature);
        builder.addCase(actions.printAreaStarted, reducers.reducePrintAreaStarted);
        builder.addCase(actions.removeFeature, reducers.reduceRemoveFeature);
    })
});

export default store;

let prevMap = null;
store.subscribe(() => {
    const state = store.getState();

    if (state.map != prevMap && prevMap != null) {
        fetch(`/maps/${state.map.id}`, {
            method: "put",
            body: JSON.stringify(state.map),
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    prevMap = state.map;
});
