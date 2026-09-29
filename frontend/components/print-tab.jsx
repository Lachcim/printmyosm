import React, { useContext, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";

import AtlasStatistics from "./atlas-statistics";
import Error from "./error";
import GeometrySettings from "./geometry-settings";
import ToolbarTab from "./toolbar-tab";

import Atlas, { AtlasError } from "../atlas/atlas";
import { AtlasContext } from "../app";

export default function PrintTab() {
    const { setAtlas } = useContext(AtlasContext);

    const features = useSelector(state => state.map?.features);
    const geometry = useSelector(state => state.map?.geometry);

    const printArea = features?.find(feature => feature.type == "printArea");

    const scaleSet = geometry?.scale != null;
    const zoomLevelSet = geometry?.zoomLevel != null;
    const paperSizeSet = geometry?.paperSize != null;
    const geometryComplete = scaleSet && zoomLevelSet && paperSizeSet;

    const { newAtlas, atlasError } = useMemo(() => {
        if (!geometry || !geometryComplete || !printArea) {
            return { newAtlas: null, atlasError: null };
        }

        try {
            const newAtlas = new Atlas(printArea.points, geometry);
            return { newAtlas, atlasError: null };
        }
        catch (error) {
            if (error instanceof AtlasError) {
                return { newAtlas: null, atlasError: error };
            }

            throw error;
        }
    }, [geometry, geometryComplete, printArea]);

    useEffect(() => {
        setAtlas(newAtlas);
        return () => setAtlas(null);
    }, [setAtlas, newAtlas]);

    return (
        <ToolbarTab>
            <h2>Map geometry</h2>
            <GeometrySettings/>
            <h2>Atlas</h2>
            {
                !printArea && (
                    <Error
                        heading={"Print area not defined."}
                        text={"Please use the features tab to define a print area."}
                    />
                )
            }
            {
                atlasError && <Error heading={atlasError.message} text={atlasError.details}/>
            }
            <AtlasStatistics/>
        </ToolbarTab>
    );
}
