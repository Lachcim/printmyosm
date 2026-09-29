import React from "react";
import { PiCirclesThreeLight, PiHandGrabbingLight, PiLineSegmentsLight, PiPolygonLight, PiPolygon } from "react-icons/pi";
import { useSelector, useDispatch } from "react-redux";

import Button from "./button";

import "../style/tools";

import { setTool } from "../store/actions";

export default function Tools({ disabled }) {
    const activeTool = useSelector(state => state.toolbar.activeFeature?.type || null);
    const dispatch = useDispatch();

    const tools = [
        { name: null, label: "None", icon: <PiHandGrabbingLight/> },
        { name: "printArea", label: "Print area", icon: <PiPolygon/> },
        { name: "line", label: "Line", icon: <PiLineSegmentsLight/> },
        { name: "polygon", label: "Polygon", icon: <PiPolygonLight/> },
        { name: "point", label: "Point", icon: <PiCirclesThreeLight/> },
    ];

    return (
        <div className="tools">
            {
                tools.map(tool => (
                    <Button
                        key={tool.name}
                        secondary
                        className="tool-button"
                        active={activeTool == tool.name}
                        onClick={() => dispatch(setTool(tool.name))}
                        disabled={disabled}
                    >
                        { tool.icon }
                        { tool.label }
                    </Button>
                ))
            }
        </div>
    );
}
