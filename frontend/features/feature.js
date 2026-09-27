import store from "../store/store";

import { getFeatureFromJson } from "../features/features";

export default class Feature {
    constructor(json) {
        this.id = json["id"];
        this.type = json["type"];
        this.label = json["label"] ?? null;
    }

    toJson() {
        const label = this.label && { label: this.label };
        return { id: this.id, type: this.type, ...label };
    }

    clone() {
        return getFeatureFromJson(this.toJson());
    }

    get incomplete() {
        const state = store.getState();
        return state.toolbar.activeFeature instanceof Object && state.toolbar.activeFeature.id == this.id;
    }

    get defaultLabel() {
        throw new Error("Default label not implemented");
    }

    handleMapClick() {}

    render() {
        throw new Error("Render not implemented");
    }
}
