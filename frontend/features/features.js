import store from "../store/store";

import Line from "./line";
import Point from "./point";
import Polygon from "./polygon";
import PrintArea from "./print-area";

export function getFeatureFromJson(json) {
    const type = json["type"];

    if (type == "printArea")
        return new PrintArea(json);
    if (type == "line")
        return new Line(json);
    if (type == "polygon")
        return new Polygon(json);
    if (type == "point")
        return new Point(json);

    throw new RangeError(`Invalid feature type ${type}`);
}

export function getFeatureById(id) {
    const state = store.getState();
    const json = state.map?.features?.find(feature => feature.id == id);
    if (!json) return null;

    return getFeatureFromJson(json);
}

function getActiveFeature() {
    const state = store.getState();
    const feature = state.toolbar.activeFeature;

    if (!feature) return null;

    if (typeof feature == "string")
        return getFeatureById(feature);

    return getFeatureFromJson(feature);
}

export function handleMapClick(event) {
    const feature = getActiveFeature();
    if (!feature) return;

    feature.handleMapClick(event);
}
