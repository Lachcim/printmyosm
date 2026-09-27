import React from "react";
import { useSelector, useDispatch } from "react-redux";

import Button from "./button";

import "../style/tools";

import { setTool } from "../store/actions";

export default function Tools({ disabled }) {
    const activeTool = useSelector(state => state.toolbar.activeFeature?.type || null);
    const dispatch = useDispatch();

    const tools = [
        { name: null, label: "None" },
        { name: "printArea", label: "Print area" },
        { name: "line", label: "Line" },
        { name: "polygon", label: "Polygon" },
        { name: "point", label: "Point" },
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
                        { tool.label }
                    </Button>
                ))
            }
        </div>
    );
}
