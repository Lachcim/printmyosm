import React from "react";
import { useDispatch, useSelector } from "react-redux";

import Button from "./button";
import Map from "./map";

import "../style/map-welcome";

import { createNewMap } from "../store/actions";

export default function MapWelcome() {
    const map = useSelector(state => state.map);
    const dispatch = useDispatch();

    if (map) {
        return <Map/>;
    }

    return (
        <div className="map-welcome">
            <div>
                <h1>Welcome to PrintMyOSM</h1>
                <p>The open-source tool for printing custom maps. Where are we hiking today?</p>
                <Button className="new-map" onClick={() => dispatch(createNewMap())}>Create new map</Button>
            </div>
        </div>
    );
}
