import React from "react";

import "../style/atlas-statistics";

import useAtlas from "../atlas/use-atlas";

export default function AtlasStatistics() {
    const { atlas } = useAtlas();
    const remainingTiles = atlas?.remaining?.tiles;

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
