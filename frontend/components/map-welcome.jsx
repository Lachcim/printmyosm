import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Button from "./button";
import List from "./list";
import Map from "./map";

import "../style/map-welcome";

import { createNewMap } from "../store/actions";

export default function MapWelcome() {
    const [mapList, setMapList] = useState(null);

    const map = useSelector(state => state.map);
    const dispatch = useDispatch();

    useEffect(() => {
        const getMaps = async () => {
            const response = await fetch("/maps");
            return await response.json();
        };

        getMaps().then(setMapList);
    }, []);

    if (map) {
        return <Map/>;
    }

    const listItems = mapList?.map(map => ({
        label: map.name,
        key: map.id
    }));

    return (
        <div className="map-welcome">
            <div>
                <h1>Welcome to PrintMyOSM</h1>
                <p>The open-source tool for printing custom maps. Where are we hiking today?</p>
                {
                    listItems && listItems.length != 0 && <List items={listItems}/>
                }
                <p className="new-map">
                    <Button onClick={() => dispatch(createNewMap())}>Create new map</Button>
                </p>
            </div>
        </div>
    );
}
