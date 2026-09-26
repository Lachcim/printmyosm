import store from "../store/store";

export default class Feature {
    constructor(json) {
        this.id = json["id"];
        this.type = json["type"];
        this.label = json["label"];
    }

    toJson() {
        return { id: this.id, type: this.type, label: this.label };
    }

    getLabel() { return this.label ?? this.defaultLabel; }

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
