export default class Feature {
    constructor(id, type) {
        this.id = id;
        this.type = type;
    }

    toJson() {
        return { id: this.id, type: this.type };
    }

    get complete() {
        throw new Error("Completeness getter not implemented");
    }

    handleClick() { return false; }
    handleMouseMove() { return false; }
    handleMouseOut() { return false; }

    render() {
        throw new Error("Render not implemented");
    }
}
