import React, { memo } from "react";
import { useSelector } from "react-redux";
import {
    PiArrowUpLight,
    PiArrowLeftLight,
    PiArrowDownLight,
    PiArrowRightLight
} from "react-icons/pi";

import "../style/atlas-page";

import Atlas from "../atlas/atlas";
import { getFeatureFromJson } from "../features/features";
import { latLongToTileXY } from "../atlas/geometry";

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

const MapFeatures = memo(function MapFeatures({ page }) {
    const features = useSelector(state => state.map?.features) ?? [];

    const pxPerMm = 96 / 25.4;
    const pxPerTile = page.size.printable.width * pxPerMm / page.size.tiles.x;

    const { x, y } = page.position;
    const { x: width, y: height } = page.size.tiles;
    const viewBox = `${x * pxPerTile} ${y * pxPerTile} ${width * pxPerTile} ${height * pxPerTile}`;

    const project = (lat, long) => {
        const { x, y } = latLongToTileXY(lat, long, page.zoomLevel);
        return { x: x * pxPerTile, y: y * pxPerTile };
    };

    return (
        <svg viewBox={viewBox}>
            { features.map(feature => getFeatureFromJson(feature).render(project)) }
        </svg>
    );
});

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
            <div className="printable" style={printableStyle}>
                <img src={pageSrc}/>
                <MapFeatures page={page}/>
            </div>

            <p className={`page-number ${page.number % 2 == 0 ? "even" : "odd"}`}>{ page.number }</p>

            {
                page.number == 1 && <p className="map-name">{ mapName }</p>
            }
            {
                page.number == 1 && <p className="credits">Printed with PrintMyOSM</p>
            }
            {
                directions.map(
                    direction => page.neighbors[direction] != null && (
                        <NeighborMark key={direction} direction={direction} page={page.neighbors[direction]}/>
                    )
                )
            }
            {
                scale && <p className="scale">{ scale.label } ({ scale.description })</p>
            }
        </section>
    );
}
