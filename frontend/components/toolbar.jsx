import React from "react";
import { useSelector } from "react-redux";

import FeaturesTab from "./features-tab";
import GeometryTab from "./geometry-tab";
import PrintTab from "./print-tab";
import ToolbarNav from "./toolbar-nav";

import "../style/toolbar";

export default function Toolbar() {
    const tab = useSelector(state => state.toolbar.tab);
    const disabled = useSelector(state => state.map) == null;

    return (
        <div className="toolbar">
            <div>
                <ToolbarNav disabled={disabled}/>
                { tab == "features" && <FeaturesTab disabled={disabled}/> }
                { tab == "geometry" && <GeometryTab disabled={disabled}/> }
                { tab == "print" && <PrintTab disabled={disabled}/> }
            </div>
            { disabled && <div className="disabled-overlay"/> }
        </div>
    );
}
