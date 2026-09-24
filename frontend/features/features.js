import store from "../store/store";

import { updateFeature } from "../store/actions";

import Feature from "./feature";
import Line from "./line";
import Point from "./point";
import Polygon from "./polygon";
import PrintArea from "./print-area";

function createFeatureFromType(type) {
    const idArray = new Uint8Array(8);
    crypto.getRandomValues(idArray);
    const id = btoa(idArray);

    if (type == "printArea")
        return new PrintArea(id, []);
    if (type == "line")
        return new Line(id, []);
    if (type == "polygon")
        return new Polygon(id, []);
    if (type == "point")
        return new Point(id, null, "");

    throw new RangeError(`Invalid feature type ${type}`);
}

function getFeatureFromJson(json) {
    const type = json["type"];
    const id = json["id"];

    if (type == "printArea")
        return new PrintArea(id, json["points"]);
    if (type == "line")
        return new Line(id, json["points"]);
    if (type == "polygon")
        return new Polygon(id, json["points"]);
    if (type == "point")
        return new Point(id, json["coordinates"], json["label"]);

    throw new RangeError(`Invalid feature type ${type}`);
}

function getActiveFeature() {
    const state = store.getState();
    const id = state.toolbar.activeFeature;
    if (!id) return;

    const json = state.map.features.find(feature => feature.id == id);
    if (!json) return;

    return getFeatureFromJson(json);
}

export function handleMapEvent(event) {
    const feature = getActiveFeature();
    if (!feature) return;

    const eventMap = {
        "click": Feature.handleClick,
        "mousemove": Feature.handleMouseMove,
        "mouseout": Feature.handleMouseOut
    };

    const eventHandler = eventMap[event.type];
    if (!eventHandler)
        return;

    const needsUpdate = eventHandler.call(feature, event);

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
    stateProxy.toolbar.activeFeature = null;

    if (!id) return;

    stateProxy.map.features = stateProxy.map.features.filter(
        feature => feature.id != id || getFeatureFromJson(feature).complete
    );
}
