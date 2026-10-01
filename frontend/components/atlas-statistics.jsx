import React from "react";

import "../style/atlas-statistics";

import useAtlas from "../atlas/use-atlas";

export default function AtlasStatistics() {
    const { atlas } = useAtlas();

    return (
        <div className="atlas-statistics">
            <div>
                <span className="figure">{ atlas?.jobProgress?.pages.length ?? "?" }</span>/{ atlas?.pages.length ?? 0 } pages
            </div>
            <div>
                <span className="figure">{ atlas?.jobProgress?.tiles ?? "?" }</span>/{ atlas?.tiles.size ?? 0 } tiles
            </div>
        </div>
    );
}
