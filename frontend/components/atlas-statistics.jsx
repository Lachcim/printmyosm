import React, { useContext } from "react";
import { useSelector } from "react-redux";

import { AtlasContext } from "../app";

import "../style/atlas-statistics";

export default function AtlasStatistics() {
    const { atlas } = useContext(AtlasContext);
    const remainingTiles = useSelector(state => state.job?.remainingTiles);

    const getProgress = () => {
        if (atlas == null || remainingTiles == null)
            return null;

        return Math.floor((atlas.tiles.size - remainingTiles) * 100 / atlas.tiles.size);
    };
    const progress = getProgress();

    return (
        <div className="atlas-statistics">
            <div>
                <span className="figure">{ atlas?.pages.length ?? 0 }</span> pages
            </div>
            <div>
                <span className="figure">{ atlas?.tiles.size ?? 0 }</span> tiles
            </div>
            <div className="downloaded">
                <span className="figure">{ progress != null ? `${progress}%` : "?" }</span> downloaded
            </div>
        </div>
    );
}
