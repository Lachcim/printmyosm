import React from "react";
import { useSelector, useDispatch } from "react-redux";

import Button from "./button";

import "../style/tools";

import { setTool } from "../store/actions";

export default function Tools() {
    const currentTool = useSelector(state => state.toolbar.currentTool);
    const dispatch = useDispatch();

    const tools = [
        { name: null, label: "None" },
        { name: "printArea", label: "Print area" },
        { name: "line", label: "Line" },
        { name: "polygon", label: "Polygon" },
        { name: "point", label: "Labelled point" },
    ];

    return (
        <div className="tools">
            {
                tools.map(tool => (
                    <Button
                        key={tool.name}
                        secondary
                        className="tool-button"
                        active={currentTool == tool.name}
                        onClick={() => dispatch(setTool(tool.name))}
                    >
                        { tool.label }
                    </Button>
                ))
            }
        </div>
    );
}
