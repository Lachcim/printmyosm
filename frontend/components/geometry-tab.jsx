import React from "react";
import { useDispatch, useSelector } from "react-redux";

import Atlas from "../atlas/atlas";
import Dropdown from "./dropdown";
import ToolbarTab from "./toolbar-tab";

import { setGeometry } from "../store/actions";

import "../style/geometry-tab";

export default function GeometryTab() {
    const features = useSelector(state => state.map?.features);
    const geometry = useSelector(state => state.map?.geometry);
    const dispatch = useDispatch();

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

    const setScale = scale => { dispatch(setGeometry({ ...geometry, scale })); };
    const setPaperSize = paperSize => { dispatch(setGeometry({ ...geometry, paperSize })); };
    const setLandscape = landscape => { dispatch(setGeometry({ ...geometry, landscape })); };
    const setBorderless = borderless => { dispatch(setGeometry({ ...geometry, borderless })); };

    return (
        <ToolbarTab className="geometry-tab">
            <h2>Map geometry</h2>
            <div className="geometry-settings">
                <div>
                    <h3>Scale</h3>
                    <Dropdown className="setting-dropdown" items={Atlas.scales} value={geometry.scale} onValueChange={setScale} numerical/>
                </div>
                <div>
                    <h3>Zoom level</h3>
                    <Dropdown className="setting-dropdown" items={Atlas.paperSizes} value={geometry.zoomLevel}/>
                </div>
                <div>
                    <h3>Paper size</h3>
                    <Dropdown className="setting-dropdown" items={Atlas.paperSizes} value={geometry.paperSize} onValueChange={setPaperSize}/>
                </div>
                <div>
                    <h3>Layout</h3>
                    <Dropdown className="setting-dropdown" items={layouts} value={geometry.landscape} onValueChange={setLandscape}/>
                </div>
                <div>
                    <h3>Margins</h3>
                    <Dropdown className="setting-dropdown" items={marginSettings} value={geometry.borderless} onValueChange={setBorderless}/>
                </div>
            </div>
        </ToolbarTab>
    );
}
