import React, { createContext, useState } from "react";
import { Provider as StoreProvider } from "react-redux";

import Header from "./components/header";
import MapWelcome from "./components/map-welcome";
import Toolbar from "./components/toolbar";

import "./style/app";

import store from "./store/store";

export const AtlasContext = createContext([null, () => {}]);

export default function App() {
    const atlas = useState(null);

    return (
        <StoreProvider store={store}>
            <AtlasContext value={atlas}>
                <Header/>
                <div className="map-toolbar">
                    <MapWelcome/>
                    <Toolbar/>
                </div>
            </AtlasContext>
        </StoreProvider>
    );
}
