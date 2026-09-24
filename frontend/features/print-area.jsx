import Polygon from "./polygon";

export default class PrintArea extends Polygon {
    constructor(id, points, closed) {
        super(id, points, closed);
        this.type = "printArea";
    }
}
