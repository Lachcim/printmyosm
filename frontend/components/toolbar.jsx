import React from "react";
import { useSelector } from "react-redux";

import ToolbarNav from "./toolbar-nav";
import Tools from "./tools";

import "../style/toolbar";

export default function Toolbar() {
    const tab = useSelector(state => state.toolbar.tab);

    return (
        <div className="toolbar">
            <ToolbarNav/>
            {
                tab == "features" && (
                    <div>
                        <h2>Tools</h2>
                        <Tools/>
                    </div>
                )
            }
            {
                tab == "geometry" && (
                    <div>
                        <h2>geometry</h2>
                    </div>
                )
            }
            {
                tab == "print" && (
                    <div>
                        <h2>print</h2>
                    </div>
                )
            }
        </div>
    );
}
