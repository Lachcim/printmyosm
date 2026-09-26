import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Button from "./button";
import List from "./list";
import Map from "./map";

import "../style/map-welcome";

import { createNewMap, loadMap } from "../store/actions";

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

    const selectMap = async id => {
        const response = await fetch(`/maps/${id}`);
        const mapData = await response.json();

        dispatch(loadMap(mapData));
    };
    const deleteMap = id => {
        fetch(`/maps/${id}`, { method: "delete" });
        setMapList(maps => maps.filter(map => map.id != id));
    };

    const listItems = mapList?.map(map => ({
        label: map.name ?? "Untitled map",
        key: map.id,
        onClick: () => selectMap(map.id),
        onRemove: () => deleteMap(map.id)
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
