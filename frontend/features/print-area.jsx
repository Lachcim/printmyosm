import Polygon from "./polygon";

import store from "../store/store";
import { printAreaStarted } from "../store/actions";

export default class PrintArea extends Polygon {
    constructor(json) {
        super(json);
        this.type = "printArea";
    }

    get defaultLabel() {
        return "Print area";
    }

    handleMapClick(event) {
        const startPoints = this.points.length;
        super.handleMapClick(event);

        if (this.points.length == 1 && startPoints == 0) {
            store.dispatch(printAreaStarted(this.id));
        }
    }

    static style = {
        weight: 2,
        color: "#31572C",
        fill: false,
        lineJoin: "miter"
    };

    getStyle() {
        return PrintArea.style;
    }
}
