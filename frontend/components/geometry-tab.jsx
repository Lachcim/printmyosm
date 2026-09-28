import React, { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import Error from "./error";
import Dropdown from "./dropdown";
import ToolbarTab from "./toolbar-tab";
import ZoomSelector from "./zoom-selector";

import { setGeometry } from "../store/actions";

import Atlas from "../atlas/atlas";
import { AtlasContext } from "../app";

import "../style/geometry-tab";

export default function GeometryTab() {
    const [atlas, setAtlas] = useContext(AtlasContext);
    const dispatch = useDispatch();

    const features = useSelector(state => state.map?.features);
    const geometry = useSelector(state => state.map?.geometry);

    const printArea = features.find(feature => feature.type == "printArea");

    const scaleSet = geometry.scale != null;
    const zoomLevelSet = geometry.zoomLevel != null;
    const paperSizeSet = geometry.paperSize != null;
    const geometryComplete = scaleSet && zoomLevelSet && paperSizeSet;

    useEffect(() => {
        const cleanup = () => setAtlas(null);

        if (!geometryComplete || !printArea) {
            setAtlas(null);
            return cleanup;
        }

        setAtlas(new Atlas(printArea.points, geometry));
        return cleanup;
    }, [geometry, geometryComplete, printArea, setAtlas]);

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
    const setZoomLevel = zoomLevel => { dispatch(setGeometry({ ...geometry, zoomLevel })); };
    const setPaperSize = paperSize => { dispatch(setGeometry({ ...geometry, paperSize })); };
    const setLandscape = landscape => { dispatch(setGeometry({ ...geometry, landscape })); };
    const setBorderless = borderless => { dispatch(setGeometry({ ...geometry, borderless })); };

    return (
        <ToolbarTab className="geometry-tab">
            <h2>Map geometry</h2>
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
            <h2>Print</h2>
            {
                !printArea && (
                    <Error
                        heading={"Print area not defined."}
                        text={"Please use the features tab to define a print area."}
                    />
                )
            }
            {
                atlas && <p>Atlas: { atlas.pages.length } pages</p>
            }
        </ToolbarTab>
    );
}
