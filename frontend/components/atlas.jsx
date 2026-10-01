import React from "react";

import AtlasPage from "./atlas-page";

import useAtlas from "../atlas/use-atlas";

export default function Atlas() {
    const { atlas } = useAtlas();

    if (atlas == null || atlas.pages.length == 0 || atlas.remaining?.pages != 0)
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
