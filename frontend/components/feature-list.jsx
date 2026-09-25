import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

import Button from "./button";
import { getFeatureFromJson } from "../features/features";
import { removeFeature } from "../store/actions";

import "../style/button";
import "../style/feature-list";

import remove from "../assets/remove.svg";

function FeatureListItem({ feature }) {
    const dispatch = useDispatch();

    const handleRemove = () => {
        dispatch(removeFeature(feature.id));
    };

    return (
        <li className="button secondary">
            <span>{ feature.getLabel() }</span>
            <Button unobtrusive onClick={handleRemove}>
                <img src={remove} alt="Remove" className="remove"/>
            </Button>
        </li>
    );
}

export default function FeatureList() {
    const rawFeatures = useSelector(state => state.map?.features) ?? [];
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
