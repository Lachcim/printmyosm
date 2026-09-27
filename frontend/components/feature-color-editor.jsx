import React from "react";
import { useDispatch } from "react-redux";

import Button from "./button";

import "../style/feature-color-editor";

import { updateFeature } from "../store/actions";
import Feature from "../features/feature";

function Color({ value, active, onClick, disabled }) {
    return (
        <Button
            className="color"
            secondary
            active={active}
            onClick={onClick}
            disabled={disabled}
        >
            <div style={{ backgroundColor: value }}/>
        </Button>
    );
}

export default function FeatureColorEditor({ feature, disabled }) {
    const dispatch = useDispatch();

    const setColor = color => {
        const newFeature = feature.clone();
        newFeature.color = color;
        dispatch(updateFeature(newFeature.toJson()));
    };

    return (
        <div className="feature-color-editor">
            {
                Feature.colors.map(({ name, value }) => (
                    <Color
                        key={name}
                        value={value}
                        active={feature.color == name}
                        onClick={() => setColor(name)}
                        disabled={disabled}
                    />)
                )
            }
        </div>
    );
}
