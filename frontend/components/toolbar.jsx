import React from "react";

import Button from "./button";

import "../style/toolbar";

import compass from "../assets/compass.svg";
import document from "../assets/document.svg";
import polygon from "../assets/polygon.svg";

export default function Toolbar() {
    return (
        <div className="toolbar">
            <nav>
                <Button className="toolbar-button">
                    <img src={polygon}/>
                    Features
                </Button>
                <Button className="toolbar-button">
                    <img src={compass}/>
                    Geometry
                </Button>
                <Button className="toolbar-button">
                    <img src={document}/>
                    Print
                </Button>
            </nav>
        </div>
    );
}
