import React from "react";
import { PiDownloadSimpleLight, PiMapTrifoldLight, PiArrowClockwiseLight, PiPauseCircleLight } from "react-icons/pi";
import { GiSewingNeedle } from "react-icons/gi";

import AtlasView from "./atlas-view";
import Button from "./button";

import "../style/print-button";

export default function PrintButton({ atlas }) {
    const readyTiles = atlas.jobProgress?.tiles;
    const readyPages = atlas.jobProgress?.pages.length;

    const getButton = () => {
        if (readyTiles == atlas.tiles.size && readyPages == atlas.pages.length) {
            return {
                label: "Print map",
                icon: <PiMapTrifoldLight />,
                onClick: () => window.print()
            };
        }

        if (atlas.jobState == "notStarted") {
            return {
                label: readyTiles == atlas.tiles.size ? "Compose pages" : "Download tiles",
                icon: readyTiles == atlas.tiles.size ? <GiSewingNeedle/> : <PiDownloadSimpleLight/>,
                onClick: () => atlas.startJob()
            };
        }

        if (atlas.jobState == "inProgress") {
            return {
                label: readyTiles == atlas.tiles.size ? "Composing pages" : "Downloading tiles",
                icon: <PiPauseCircleLight/>,
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
            <AtlasView atlas={atlas}/>
        </>
    );
}
