import React, { useContext } from "react";
import { useSelector } from "react-redux";

import { AtlasContext } from "../atlas/AtlasContextProvider";

import "../style/atlas-statistics";

export default function AtlasStatistics() {
    const { atlas } = useContext(AtlasContext);
    const remainingTiles = useSelector(state => state.job?.remainingTiles);

    const getDownloadedTiles = () => {
        if (atlas == null || remainingTiles == null)
            return null;

        return atlas.tiles.size - remainingTiles;
    };

    return (
        <div className="atlas-statistics">
            <div>
                <span className="figure">{ atlas?.pages.length ?? 0 }</span> pages
            </div>
            <div>
                <span className="figure">{ atlas?.tiles.size ?? 0 }</span> tiles
            </div>
            <div className="downloaded">
                <span className="figure">{ getDownloadedTiles() ?? "?" }</span> downloaded
            </div>
        </div>
    );
}
