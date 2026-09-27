import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFeatureById } from "../features/features";

import LabelInput from "./label-input";
import { updateFeature } from "../store/actions";

function FeatureLabel({ feature, disabled }) {
    const [prevFeatureLabel, setPrevFeatureLabel] = useState(feature.label);
    const [featureLabelInput, setFeatureLabelInput] = useState(feature.label ?? "");
    const dispatch = useDispatch();

    if (feature.label != prevFeatureLabel) {
        setFeatureLabelInput(feature.label ?? "");
        setPrevFeatureLabel(feature.label);
    }

    const renameFeature = () => {
        const newFeature = feature.clone();
        newFeature.label = featureLabelInput;
        dispatch(updateFeature(newFeature.toJson()));
    };

    return (
        <LabelInput
            value={featureLabelInput}
            onChange={event => setFeatureLabelInput(event.target.value)}
            onSubmit={renameFeature}
            placeholder={feature.defaultLabel}
            disabled={disabled}
            minor
        />
    );
}

function FeatureEditorInner(props) {
    return (
        <>
            <FeatureLabel {...props}/>
        </>
    );
}

export default function FeatureEditor({ disabled }) {
    const rawActiveFeature = useSelector(state => state.toolbar.activeFeature);
    const activeFeature = getFeatureById(rawActiveFeature?.id ?? rawActiveFeature);

    if (!activeFeature)
        return;

    return <FeatureEditorInner key={activeFeature.id} feature={activeFeature} disabled={disabled}/>;
}
