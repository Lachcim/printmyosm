import React from "react";

import Header from "./components/header";
import Map from "./components/map";
import Toolbar from "./components/toolbar";

import "./style/app";

export default function App() {
    return (
        <>
            <Header/>
            <div className="map-toolbar">
                <Map/>
                <Toolbar/>
            </div>
        </>
    );
}
