import React, { useState } from "react";
import { useDispatch } from "react-redux";

import LabelInput from "./label-input";
import { updateFeature } from "../store/actions";

export default function FeatureLabelEditor({ feature, disabled }) {
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
