import React from "react";

import "../style/atlas-page";

export default function AtlasPage({ page }) {
    const pageSrc = `/page/${page.zoomLevel}/${page.position.x}/${page.position.y}/${page.size.tiles.x}/${page.size.tiles.y}`;
    const printableStyle = {
        width: `${page.size.printable.width}mm`,
        height: `${page.size.printable.height}mm`
    };

    console.log(printableStyle);

    return (
        <section className="atlas-page">
            <img src={pageSrc} style={printableStyle}/>
        </section>
    );
}
