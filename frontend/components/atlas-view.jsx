import React from "react";
import { createPortal } from "react-dom";

import AtlasPage from "./atlas-page";

import "../style/atlas-view";

export default function AtlasView({ atlas }) {
    if (atlas == null || atlas.pages.length == 0 || atlas.jobProgress?.pages.length != atlas.pages.length)
        return;

    const { width, height } = atlas.pages[0].size.paper;

    return createPortal(
        <div className="atlas-view">
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
        </div>,
        document.body
    );
}
