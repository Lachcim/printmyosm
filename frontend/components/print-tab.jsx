import React, { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";

import AtlasStatistics from "./atlas-statistics";
import Error from "./error";
import GeometrySettings from "./geometry-settings";
import PrintButton from "./print-button";
import ToolbarTab from "./toolbar-tab";

import useAtlas from "../atlas/use-atlas";
import Atlas, { AtlasError } from "../atlas/atlas";

export default function PrintTab() {
    const { atlas, setAtlas } = useAtlas();

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

    useEffect(() => {
        const getRemaining = async () => {
            const response = await fetch("/atlas", {
                method: "post",
                body: JSON.stringify({
                    zoomLevel: newAtlas.zoomLevel,
                    tiles: Array.from(newAtlas.tiles)
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            });

            const { remaining } = await response.json();
            newAtlas.setRemaining(remaining);
        };

        if (newAtlas) getRemaining();
    }, [newAtlas]);

    return (
        <ToolbarTab>
            <h2>Map geometry</h2>
            {
                !printArea && (
                    <Error
                        heading={"Print area not defined."}
                        text={"Please use the features tab to define a print area."}
                    />
                )
            }
            <GeometrySettings/>
            <h2>Atlas</h2>
            {
                atlasError && <Error heading={atlasError.message} text={atlasError.details}/>
            }
            <AtlasStatistics/>
            <PrintButton atlas={atlas}/>
        </ToolbarTab>
    );
}
