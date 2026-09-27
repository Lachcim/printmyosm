import React from "react";

import FeatureList from "./feature-list";
import ToolbarTab from "./toolbar-tab";
import Tools from "./tools";
import LabelInput from "./label-input";

import "../style/features-tab";

export default function FeaturesTab({ disabled }) {
    return (
        <ToolbarTab className="features-tab">
            <LabelInput
                className="map-name"
                placeholder="Untitled map"
                disabled={disabled}
            />
            <h2>Create feature</h2>
            <Tools disabled={disabled}/>
            <h2>Map features</h2>
            <FeatureList/>
        </ToolbarTab>
    );
}
