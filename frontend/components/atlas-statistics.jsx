import React, { useContext } from "react";

import { AtlasContext } from "../app";

import "../style/atlas-statistics";

export default function AtlasStatistics() {
    const { atlas } = useContext(AtlasContext);

    return (
        <div className="atlas-statistics">
            <div>
                <span className="figure">{ atlas?.pages.length ?? 0 }</span> pages
            </div>
            <div>
                <span className="figure">{ atlas?.tiles.size ?? 0 }</span> tiles
            </div>
            <div>
                <span className="figure">100%</span> ready
            </div>
        </div>
    );
}
