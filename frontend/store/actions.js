import { createAction } from "@reduxjs/toolkit";

export const createNewMap = createAction("createNewMap");
export const loadMap = createAction("loadMap");
export const setToolbarTab = createAction("setToolbarTab");
export const setTool = createAction("setTool");
export const setZoomLevel = createAction("setZoomLevel");
export const setTileSize = createAction("setTileSize");
export const updateFeature = createAction("updateFeature");
export const printAreaStarted = createAction("printAreaStarted");
export const removeFeature = createAction("removeFeature");
