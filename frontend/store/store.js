import { configureStore, createReducer } from "@reduxjs/toolkit";

import * as actions from "./actions";
import * as reducers from "./reducers";

const initialState = {
    toolbar: {
        tab: "features",
        currentTool: null,
        currentFeature: null
    }
};

const store = configureStore({
    reducer: createReducer(initialState, builder => {
        builder.addCase(actions.setToolbarTab, reducers.reduceSetToolbarTab);
    })
});

export default store;
