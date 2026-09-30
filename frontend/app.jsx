import React from "react";
import { Provider as StoreProvider } from "react-redux";

import AtlasContextProvider from "./atlas/AtlasContextProvider";
import Header from "./components/header";
import MapWelcome from "./components/map-welcome";
import Toolbar from "./components/toolbar";

import "./style/app";

import store from "./store/store";

export default function App() {
    return (
        <StoreProvider store={store}>
            <AtlasContextProvider>
                <Header/>
                <div className="map-toolbar">
                    <MapWelcome/>
                    <Toolbar/>
                </div>
            </AtlasContextProvider>
        </StoreProvider>
    );
}
