import Polygon from "./polygon";

export default class PrintArea extends Polygon {
    constructor(json) {
        super(json);
        this.type = "printArea";
    }
}
