import React from "react";
import { useSelector, useDispatch } from "react-redux";

import List from "./list";
import { getFeatureFromJson } from "../features/features";
import { removeFeature } from "../store/actions";

export default function FeatureList() {
    const dispatch = useDispatch();
    const rawFeatures = useSelector(state => state.map?.features) ?? [];
    const features = rawFeatures.map(getFeatureFromJson).filter(feature => feature.isComplete());

    const items = features.map(feature => ({
        label: feature.getLabel(),
        key: feature.id,
        onRemove: () => dispatch(removeFeature(feature.id))
    }));

    return (
        <List mini items={items} emptyText={"There are no features yet."}/>
    );
}
