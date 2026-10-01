import React from "react";

import "../style/atlas-statistics";

import useAtlas from "../atlas/use-atlas";

export default function AtlasStatistics() {
    const { atlas } = useAtlas();

    return (
        <div className="atlas-statistics">
            <div>
                <span className="figure">{ atlas?.pages.length ?? 0 }</span> pages
            </div>
            <div>
                <span className="figure">{ atlas?.tiles.size ?? 0 }</span> tiles
            </div>
            <div className="downloaded">
                <span className="figure">{ atlas?.jobProgress?.tiles ?? "?" }</span> downloaded
            </div>
        </div>
    );
}
