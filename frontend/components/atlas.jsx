import React, { useContext } from "react";
import { useSelector } from "react-redux";

import AtlasPage from "./atlas-page";

import { AtlasContext } from "../atlas/AtlasContextProvider";

export default function Atlas() {
    const { atlas } = useContext(AtlasContext);
    const remainingTiles = useSelector(state => state.job?.remainingTiles);

    if (atlas == null || atlas.pages.length == 0 || remainingTiles != 0)
        return;

    const { width, height } = atlas.pages[0].size.paper;

    return (
        <>
            <style>
                {
                    `
                        @page {
                            size: ${width}mm ${height}mm;
                            margin: 0;
                        }
                    `
                }
            </style>
            { atlas.pages.map(page => <AtlasPage key={page.id} page={page}/>) }
        </>
    );
}
