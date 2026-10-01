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

    get heavy() {
        return true;
    }

    get defaultColor() {
        return null;
    }

    render(project) {
        if (project)
            return;

        return super.render();
    }
}
