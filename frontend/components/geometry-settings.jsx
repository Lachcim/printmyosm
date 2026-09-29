import React from "react";
import { useDispatch, useSelector } from "react-redux";

import Dropdown from "./dropdown";
import ZoomSelector from "./zoom-selector";

import Atlas from "../atlas/atlas";
import { setGeometry } from "../store/actions";

import "../style/geometry-settings";

export default function GeometrySettings() {
    const geometry = useSelector(state => state.map?.geometry);
    const dispatch = useDispatch();

    const layouts = [
        { value: false, label: "Portrait" },
        { value: true, label: "Landscape" }
    ];
    const marginSettings = [
        { value: false, label: "Standard" },
        { value: true, label: "No margins" }
    ];

    const setScale = scale => dispatch(setGeometry({ ...geometry, scale }));
    const setZoomLevel = zoomLevel => dispatch(setGeometry({ ...geometry, zoomLevel }));
    const setPaperSize = paperSize => dispatch(setGeometry({ ...geometry, paperSize }));
    const setLandscape = landscape => dispatch(setGeometry({ ...geometry, landscape }));
    const setBorderless = borderless => dispatch(setGeometry({ ...geometry, borderless }));

    return (
        <div className="geometry-settings">
            <div>
                <h3>Scale</h3>
                <Dropdown items={Atlas.scales} value={geometry.scale} onValueChange={setScale} numerical/>
            </div>
            <div>
                <h3>Zoom level</h3>
                <ZoomSelector value={geometry.zoomLevel} onCapture={setZoomLevel}/>
            </div>
            <div>
                <h3>Paper size</h3>
                <Dropdown items={Atlas.paperSizes} value={geometry.paperSize} onValueChange={setPaperSize}/>
            </div>
            <div>
                <h3>Layout</h3>
                <Dropdown items={layouts} value={geometry.landscape} onValueChange={setLandscape}/>
            </div>
            <div>
                <h3>Margins</h3>
                <Dropdown items={marginSettings} value={geometry.borderless} onValueChange={setBorderless}/>
            </div>
        </div>
    );
}
