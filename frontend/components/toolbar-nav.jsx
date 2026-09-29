import React from "react";
import { PiPolygonLight, PiPrinterLight } from "react-icons/pi";
import { useSelector, useDispatch } from "react-redux";

import Button from "./button";

import "../style/toolbar-nav";

import { setToolbarTab } from "../store/actions";

export default function ToolbarNav({ disabled }) {
    const currentTab = useSelector(state => state.toolbar.tab);
    const dispatch = useDispatch();

    const tabs = [
        { name: "features", label: "Features", icon: <PiPolygonLight className="icon"/> },
        { name: "print", label: "Print", icon: <PiPrinterLight className="icon"/> }
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
                        { tab.icon }
                        { tab.label }
                    </Button>
                ))
            }
        </nav>
    );
}
