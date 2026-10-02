import React, { useState } from "react";
import { PiDownloadSimpleLight, PiMapTrifoldLight, PiArrowClockwiseLight } from "react-icons/pi";

import AtlasView from "./atlas-view";
import Button from "./button";
import Spinner from "./spinner";

import "../style/print-button";

export default function PrintButton({ atlas }) {
    const [atlasViewReady, setAtlasViewReady] = useState(atlas.pages.length != 0);

    const readyTiles = atlas.jobProgress?.tiles;
    const readyPages = atlas.jobProgress?.pages.length;

    const getButton = () => {
        if (readyTiles == atlas.tiles.size && readyPages == atlas.pages.length) {
            if (!atlasViewReady) {
                return {
                    label: "Downloading pages",
                    icon: <Spinner/>,
                    secondary: true
                };
            }

            return {
                label: "Print map",
                icon: <PiMapTrifoldLight />,
                onClick: () => window.print()
            };
        }

        if (atlas.jobState == "notStarted") {
            return {
                label: readyTiles == atlas.tiles.size ? "Compose pages" : "Download tiles",
                icon: <PiDownloadSimpleLight/>,
                onClick: () => atlas.startJob()
            };
        }

        if (atlas.jobState == "inProgress") {
            return {
                label: readyTiles == atlas.tiles.size ? "Composing pages" : "Downloading tiles",
                icon: <Spinner/>,
                secondary: true,
                onClick: () => atlas.stopJob()
            };
        }

        return {
            label: "Retry",
            icon: <PiArrowClockwiseLight/>,
            onClick: () => atlas.startJob()
        };
    };

    const { label, icon, secondary, onClick } = getButton();

    return (
        <>
            <Button
                className="print-button"
                secondary={secondary}
                onClick={onClick}
            >
                { icon }
                { label }
            </Button>
            <AtlasView atlas={atlas} onReady={() => setAtlasViewReady(true)}/>
        </>
    );
}
