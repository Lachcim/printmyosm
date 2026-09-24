import store from "../store/store";

import { setTool, updateFeature } from "../store/actions";

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

function createFeatureFromType(type) {
    const idArray = new Uint8Array(8);
    crypto.getRandomValues(idArray);
    const id = btoa(idArray);

    return getFeatureFromJson({ id, type });
}

function getFeatureById(id) {
    const state = store.getState();
    const json = state.map.features.find(feature => feature.id == id);
    if (!json) return null;

    return getFeatureFromJson(json);
}

function getActiveFeature() {
    const state = store.getState();
    const id = state.toolbar.activeFeature;
    if (!id) return null;

    return getFeatureById(id);
}

export function handleMapClick(event) {
    const feature = getActiveFeature();
    if (!feature) return;

    const needsUpdate = feature.handleMapClick(event);

    if (needsUpdate)
        store.dispatch(updateFeature(feature.toJson()));
}

export function createFeature(stateProxy, type) {
    const feature = createFeatureFromType(type);

    stateProxy.toolbar.activeFeature = feature.id;
    stateProxy.map.features.push(feature.toJson());
    return feature.id;
}

export function removeIncompleteFeature(stateProxy) {
    const id = stateProxy.toolbar.activeFeature;
    if (!id) return;

    const json = stateProxy.map.features.find(feature => feature.id == id);
    if (!json) {
        stateProxy.toolbar.activeFeature = null;
        return;
    }

    const resolvedFeature = getFeatureFromJson(json);
    if (resolvedFeature.complete) return;

    stateProxy.map.features = stateProxy.map.features.filter(feature => feature.id != id);
    stateProxy.toolbar.activeFeature = null;
}

export function closePolygon(id) {
    const polygon = getFeatureById(id);
    polygon.close();

    if (!polygon.unclosed) {
        store.dispatch(updateFeature(polygon.toJson()));
        store.dispatch(setTool(null));
    }
}
