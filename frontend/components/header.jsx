import React from "react";

import "../style/header";
import { useSelector } from "react-redux";

export default function Header() {
    const mapName = useSelector(state => state.map?.name);

    return (
        <>
            <title>{ mapName ? `${mapName} - PrintMyOSM` : "PrintMyOSM" }</title>
            <header className="header">
                <p>PrintMyOSM</p>
            </header>
        </>
    );
}
