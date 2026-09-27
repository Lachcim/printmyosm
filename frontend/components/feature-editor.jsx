import React from "react";
import { useSelector } from "react-redux";
import { resolveActiveFeature } from "../features/features";

import FeatureColorEditor from "./feature-color-editor";
import FeatureLabelEditor from "./feature-label-editor";

function FeatureEditorInner(props) {
    const feature = props.feature;

    return (
        <>
            <FeatureLabelEditor {...props}/>
            { feature.defaultColor && <FeatureColorEditor {...props}/> }
        </>
    );
}

export default function FeatureEditor({ disabled }) {
    const rawActiveFeature = useSelector(state => state.toolbar.activeFeature);
    const activeFeature = resolveActiveFeature(rawActiveFeature);

    if (!activeFeature)
        return;

    return <FeatureEditorInner key={activeFeature.id} feature={activeFeature} disabled={disabled}/>;
}
