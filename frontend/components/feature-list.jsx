import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

import { getFeatureFromJson } from "../features/features";

import "../style/button";
import "../style/feature-list";

function FeatureListItem({ feature }) {
    return (
        <li className="button secondary">{ feature.getLabel() }</li>
    );
}

export default function FeatureList() {
    const rawFeatures = useSelector(state => state.map.features);
    const features = rawFeatures.map(getFeatureFromJson).filter(feature => feature.isComplete());

    const rawList = useRef();
    const previousFeatureCount = useRef(features.length);

    useEffect(() => {
        if (features.length <= previousFeatureCount.current)
            return;

        const ul = rawList.current;
        if (ul) {
            ul.scrollTop = ul.scrollHeight;
        }

        previousFeatureCount.current = features.length;
    }, [features.length]);

    return (
        <ul className={`feature-list ${features.length == 0 && "empty"}`} ref={rawList}>
            {
                features.map(feature => <FeatureListItem key={feature.id} feature={feature}/>)
            }
            {
                features.length == 0 && <p>There are no features yet.</p>
            }
        </ul>
    );
}
