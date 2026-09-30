import React, { createContext, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";

import { createJob, destoryJob } from "../store/actions";

export const AtlasContext = createContext([null, () => {}]);

export default function AtlasContextProvider({ children }) {
    const [atlas, setAtlas] = useState(null);
    const prevAtlas = useRef(null);
    const dispatch = useDispatch();

    useEffect(() => {
        if (atlas == prevAtlas.current)
            return;

        if (atlas != null) dispatch(createJob());
        if (prevAtlas.current != null && atlas == null) dispatch(destoryJob());
        if (prevAtlas.current != null) prevAtlas.current.cleanUp();

        prevAtlas.current = atlas;
    }, [atlas, dispatch]);

    return <AtlasContext value={{ atlas, setAtlas }}>{ children }</AtlasContext>;
}
