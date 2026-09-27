import React from "react";
import { useSelector, useDispatch } from "react-redux";

import Button from "./button";

import "../style/toolbar-nav";

import compass from "../assets/compass.svg";
import document from "../assets/document.svg";
import polygon from "../assets/polygon.svg";

import { setToolbarTab } from "../store/actions";

export default function ToolbarNav({ disabled }) {
    const currentTab = useSelector(state => state.toolbar.tab);
    const dispatch = useDispatch();

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
                        key={tab.name}
                        className="toolbar-button"
                        active={currentTab == tab.name}
                        onClick={() => dispatch(setToolbarTab(tab.name))}
                        disabled={disabled}
                    >
                        <img src={tab.icon}/>
                        { tab.label }
                    </Button>
                ))
            }
        </nav>
    );
}
