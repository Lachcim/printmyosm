import React from "react";

import ToolbarNav from "./toolbar-nav";

import "../style/toolbar";

export default function Toolbar() {
    const currentTab = "features";

    return (
        <div className="toolbar">
            <ToolbarNav/>
            {
                currentTab == "features" && (
                    <div>
                        <h2>Tools</h2>
                    </div>
                )
            }
            {
                currentTab == "geometry" && (
                    <div>
                        <h2>geometry</h2>
                    </div>
                )
            }
            {
                currentTab == "print" && (
                    <div>
                        <h2>print</h2>
                    </div>
                )
            }
        </div>
    );
}
