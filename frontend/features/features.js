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

function getFeatureById(id) {
    const state = store.getState();
    const json = state.map?.features?.find(feature => feature.id == id);
    if (!json) return null;

    return getFeatureFromJson(json);
}

export function resolveActiveFeature(activeFeature) {
    if (!activeFeature) return null;

    if (activeFeature instanceof Object)
        return getFeatureFromJson(activeFeature);

    return getFeatureById(activeFeature);
}

export function handleMapClick(event) {
    const state = store.getState();

    const feature = resolveActiveFeature(state.toolbar.activeFeature);
    if (!feature) return;

    feature.handleMapClick(event);
}
