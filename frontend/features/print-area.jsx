import Polygon from "./polygon";

import store from "../store/store";
import { printAreaStarted } from "../store/actions";

export default class PrintArea extends Polygon {
    constructor(json) {
        super(json);
        this.type = "printArea";
    }

    handleMapClick(event) {
        const pointAdded = super.handleMapClick(event);

        if (pointAdded && this.points.length == 1) {
            store.dispatch(printAreaStarted(this.id));
        }

        return pointAdded;
    }

    getStyle() {
        return {
            weight: 2,
            color: "#31572C",
            fill: false,
            lineJoin: "miter"
        };
    }
}
