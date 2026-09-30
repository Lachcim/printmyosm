import React from "react";
import { useSelector } from "react-redux";
import {
    PiArrowUpLight,
    PiArrowLeftLight,
    PiArrowDownLight,
    PiArrowRightLight
} from "react-icons/pi";

import "../style/atlas-page";

import Atlas from "../atlas/atlas";

function NeighborMark({ direction, page }) {
    return (
        <p className={`neighbor ${direction}`}>
            { direction == "top" && <PiArrowUpLight/> }
            { direction == "left" && <PiArrowLeftLight/> }
            { direction == "bottom" && <PiArrowDownLight/> }
            { direction == "right" && <PiArrowRightLight/> }
            { page }
        </p>
    );
}

export default function AtlasPage({ page }) {
    const mapName = useSelector(state => state.map?.name);
    const scaleValue = useSelector(state => state.map?.geometry?.scale);
    const scale = Atlas.scales.find(scaleOption => scaleOption.value == scaleValue);

    const pageSrc = `/page/${page.zoomLevel}/${page.position.x}/${page.position.y}/${page.size.tiles.x}/${page.size.tiles.y}`;
    const printableStyle = {
        width: `${page.size.printable.width}mm`,
        height: `${page.size.printable.height}mm`
    };

    const directions = ["top", "left", "bottom", "right"];

    return (
        <section className="atlas-page">
            <img src={pageSrc} style={printableStyle}/>
            <p className={`page-number ${page.number % 2 == 0 ? "even" : "odd"}`}>{ page.number }</p>
            { page.number == 1 && <p className="map-name">{ mapName }</p> }
            { page.number == 1 && <p className="credits">Printed with PrintMyOSM</p> }
            {
                directions.map(
                    direction => page.neighbors[direction] != null && (
                        <NeighborMark key={direction} direction={direction} page={page.neighbors[direction]}/>
                    )
                )
            }
            { scale && <p className="scale">{ scale.label } ({ scale.description })</p> }
        </section>
    );
}
