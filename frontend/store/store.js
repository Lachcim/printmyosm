import { configureStore, createReducer } from "@reduxjs/toolkit";

import * as actions from "./actions";
import * as reducers from "./reducers";

const initialState = {
    toolbar: {
        tab: "features",
        tool: null,
        activeFeature: null
    },
    map: {
        id: "NDMsMjAsMTI5LDExLDE5LDE0MCwxMzMsMzc=",
        name: "Unnamed map",
        features: [],
        geometry: {
            scale: 100000,
            paperSize: "A4",
            landscape: false,
            zoomLevel: 13,
            xOffset: 0,
            yOffset: 0
        },
    },
    mapView: {
        zoomLevel: null,
        tileSize: null
    }
};

const store = configureStore({
    reducer: createReducer(initialState, builder => {
        builder.addCase(actions.setToolbarTab, reducers.reduceSetToolbarTab);
        builder.addCase(actions.setTool, reducers.reduceSetTool);
        builder.addCase(actions.setZoomLevel, reducers.reduceSetZoomLevel);
        builder.addCase(actions.setTileSize, reducers.reduceSetTileSize);
        builder.addCase(actions.updateFeature, reducers.reduceUpdateFeature);
        builder.addCase(actions.printAreaStarted, reducers.reducePrintAreaStarted);
        builder.addCase(actions.removeFeature, reducers.reduceRemoveFeature);
    })
});

export default store;
