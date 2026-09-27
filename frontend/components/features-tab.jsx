import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import FeatureEditor from "./feature-editor";
import FeatureList from "./feature-list";
import ToolbarTab from "./toolbar-tab";
import Tools from "./tools";
import LabelInput from "./label-input";

import { setMapName } from "../store/actions";

import "../style/features-tab";

export default function FeaturesTab({ disabled }) {
    const mapName = useSelector(state => state.map?.name);
    const [prevMapName, setPrevMapName] = useState(mapName);

    const [mapNameInput, setMapNameInput] = useState(mapName ?? "");
    const dispatch = useDispatch();

    if (mapName != prevMapName) {
        setMapNameInput(mapName ?? "");
        setPrevMapName(mapName);
    }

    return (
        <ToolbarTab className="features-tab">
            <LabelInput
                value={mapNameInput}
                onChange={event => setMapNameInput(event.target.value)}
                onSubmit={() => dispatch(setMapName(mapNameInput || null))}
                placeholder="Untitled map"
                disabled={disabled}
                major
            />
            <h2>Create feature</h2>
            <Tools disabled={disabled}/>
            <h2>Map features</h2>
            <FeatureList/>
            <FeatureEditor disabled={disabled}/>
        </ToolbarTab>
    );
}
