import React from "react";
import { useSelector, useDispatch } from "react-redux";

import List from "./list";
import { getFeatureFromJson } from "../features/features";
import { focusFeature, highlightFeature, removeFeature } from "../store/actions";

export default function FeatureList() {
    const dispatch = useDispatch();
    const rawFeatures = useSelector(state => state.map?.features) ?? [];
    const features = rawFeatures.map(getFeatureFromJson);

    const activeFeature = useSelector(state => state.toolbar.activeFeature);
    const activeFeatureId = activeFeature instanceof Object ? activeFeature.id : activeFeature;

    const items = features.map(feature => ({
        label: feature.label ?? feature.defaultLabel,
        key: feature.id,
        onClick: () => dispatch(focusFeature(feature.id)),
        onRemove: () => dispatch(removeFeature(feature.id)),
        active: feature.id == activeFeatureId,
        onMouseOver: () => dispatch(highlightFeature(feature.id)),
        onMouseOut: () => dispatch(highlightFeature(null)),
        onFocus: () => dispatch(highlightFeature(feature.id)),
        onBlur: () => dispatch(highlightFeature(null))
    }));

    return (
        <List mini items={items} emptyText={"There are no features yet."}/>
    );
}
