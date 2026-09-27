import React from "react";
import { useSelector, useDispatch } from "react-redux";

import List from "./list";
import { getFeatureFromJson } from "../features/features";
import { focusFeature, removeFeature } from "../store/actions";

export default function FeatureList() {
    const dispatch = useDispatch();
    const rawFeatures = useSelector(state => state.map?.features) ?? [];
    const features = rawFeatures.map(getFeatureFromJson);

    const activeFeature = useSelector(state => state.toolbar.activeFeature);
    const activeFeatureId = activeFeature instanceof Object ? activeFeature.id : activeFeature;

    const items = features.map(feature => ({
        label: feature.getLabel(),
        key: feature.id,
        onClick: () => dispatch(focusFeature(feature.id)),
        onRemove: () => dispatch(removeFeature(feature.id)),
        active: feature.id == activeFeatureId
    }));

    return (
        <List mini items={items} emptyText={"There are no features yet."}/>
    );
}
