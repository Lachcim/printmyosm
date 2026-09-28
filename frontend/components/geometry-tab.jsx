import React from "react";
import { useSelector } from "react-redux";

import Atlas from "../atlas/atlas";
import Dropdown from "./dropdown";
import ToolbarTab from "./toolbar-tab";

import "../style/geometry-tab";

export default function GeometryTab() {
    const features = useSelector(state => state.map?.features);
    const geometry = useSelector(state => state.map?.geometry);

    if (!features || !geometry)
        return;

    const layouts = [
        { value: false, label: "Portrait" },
        { value: true, label: "Landscape" }
    ];
    const marginSettings = [
        { value: false, label: "Standard" },
        { value: true, label: "No margins" }
    ];

    return (
        <ToolbarTab className="geometry-tab">
            <h2>Map geometry</h2>
            <div className="geometry-settings">
                <div>
                    <h3>Scale</h3>
                    <Dropdown className="setting-dropdown" items={Atlas.scales} value={10000} numerical/>
                </div>
                <div>
                    <h3>Zoom level</h3>
                    <Dropdown className="setting-dropdown" items={Atlas.paperSizes} value="A4"/>
                </div>
                <div>
                    <h3>Paper size</h3>
                    <Dropdown className="setting-dropdown" items={Atlas.paperSizes} value="A4"/>
                </div>
                <div>
                    <h3>Layout</h3>
                    <Dropdown className="setting-dropdown" items={layouts} value={false}/>
                </div>
                <div>
                    <h3>Margins</h3>
                    <Dropdown className="setting-dropdown" items={marginSettings} value={false}/>
                </div>
            </div>
        </ToolbarTab>
    );
}
