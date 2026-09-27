import React from "react";

import FeatureList from "./feature-list";
import ToolbarTab from "./toolbar-tab";
import Tools from "./tools";

export default function FeaturesTab({ disabled }) {
    return (
        <ToolbarTab>
            <h2>Create feature</h2>
            <Tools disabled={disabled}/>
            <h2>Map features</h2>
            <FeatureList/>
        </ToolbarTab>
    );
}
