import React from "react";
import { Provider as StoreProvider } from "react-redux";

import Header from "./components/header";
import Map from "./components/map";
import Toolbar from "./components/toolbar";

import "./style/app";

import store from "./store/store";

export default function App() {
    return (
        <StoreProvider store={store}>
            <Header/>
            <div className="map-toolbar">
                <Map/>
                <Toolbar/>
            </div>
        </StoreProvider>
    );
}
