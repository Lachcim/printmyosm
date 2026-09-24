import React, { useState } from "react";

import Button from "./button";

import "../style/toolbar-nav";

import compass from "../assets/compass.svg";
import document from "../assets/document.svg";
import polygon from "../assets/polygon.svg";

export default function Toolbar() {
    const [currentTab, setCurrentTab] = useState("features");

    const tabs = [
        { name: "features", label: "Features", icon: polygon },
        { name: "geometry", label: "Geometry", icon: compass },
        { name: "print", label: "Print", icon: document },
    ];

    return (
        <nav className="toolbar-nav">
            {
                tabs.map(tab => (
                    <Button
                        key={tab.label}
                        className="toolbar-button"
                        active={currentTab == tab.name}
                        onClick={() => setCurrentTab(tab.name)}
                    >
                        <img src={tab.icon}/>
                        { tab.label }
                    </Button>
                ))
            }
        </nav>
    );
}
