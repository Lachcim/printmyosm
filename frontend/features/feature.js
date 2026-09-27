import store from "../store/store";

import { getFeatureFromJson } from "../features/features";

export default class Feature {
    constructor(json) {
        this.id = json["id"];
        this.type = json["type"];
        this.label = json["label"] ?? null;
        this.color = json["color"] ?? this.defaultColor;
    }

    toJson() {
        const label = this.label && { label: this.label };
        const color = this.color && { color: this.color };

        return {
            id: this.id,
            type: this.type,
            ...label,
            ...color
        };
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

    static colors = [
        { name: "red", value: "#D50000" },
        { name: "orange", value: "#FF6D00" },
        { name: "yellow", value: "#FFD600" },
        { name: "green", value: "#64DD17" },
        { name: "cyan", value: "#00B8D4" },
        { name: "blue", value: "#2962FF" },
        { name: "purple", value: "#AA00FF" },
        { name: "black", value: "#212121" }
    ];

    get defaultColor() {
        return null;
    }

    setColor(color) {
        if (!Feature.colors[color])
            throw RangeError("Invalid color");

        this.color = color;
    }

    resolveColor() {
        if (!this.color) {
            if (!this.defaultColor)
                throw RangeError("No color and no default color");

            return Feature.colors[this.defaultColor].value;
        }

        const resolvedColor = Feature.colors.find(color => color.name == this.color);
        if (!resolvedColor) {
            throw new Error(`Unknown color ${this.color}`);
        }

        return resolvedColor.value;
    }

    handleMapClick() {}

    render() {
        throw new Error("Render not implemented");
    }
}
