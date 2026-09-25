import React from "react";
import { useSelector } from "react-redux";

import FeatureList from "./feature-list";
import ToolbarNav from "./toolbar-nav";
import Tools from "./tools";

import "../style/toolbar";

export default function Toolbar() {
    const tab = useSelector(state => state.toolbar.tab);
    const map = useSelector(state => state.map);

    const disabled = map == null;

    return (
        <div className="toolbar">
            <ToolbarNav disabled={disabled}/>
            {
                tab == "features" && (
                    <div>
                        <h2>Create feature</h2>
                        <Tools disabled={disabled}/>
                        <h2>Map features</h2>
                        <FeatureList/>
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
            { disabled && <div className="disabled-overlay"/> }
        </div>
    );
}
