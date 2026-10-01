import React from "react";
import { PiDownloadSimpleLight, PiMapTrifoldLight, PiArrowClockwiseLight, PiPauseCircleLight } from "react-icons/pi";

import Button from "./button";

import "../style/print-button";

export default function PrintButton({ atlas }) {
    if (!atlas)
        return null;

    const remainingTiles = atlas.remaining?.tiles;
    const remainingPages = atlas.remaining?.pages;

    const getButton = () => {
        if (remainingTiles == 0 && remainingPages == 0) {
            return {
                label: "Print map",
                icon: <PiMapTrifoldLight />,
                onClick: () => window.print()
            };
        }

        if (atlas.jobState == "notStarted") {
            return {
                label: remainingTiles == 0 ? "Download pages" : "Download tiles",
                icon: <PiDownloadSimpleLight/>,
                onClick: () => atlas.startJob()
            };
        }

        if (atlas.jobState == "inProgress") {
            return {
                label: remainingTiles == 0 ? "Downloading pages" : "Downloading tiles",
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
        <Button
            className="print-button"
            secondary={secondary}
            onClick={onClick}
        >
            { icon }
            { label }
        </Button>
    );
}
