import React from "react";
import { useSelector } from "react-redux";
import { PiDownloadSimpleLight, PiMapTrifoldLight, PiArrowClockwiseLight, PiPauseCircleLight } from "react-icons/pi";

import Button from "./button";

import "../style/print-button";

export default function PrintButton({ onStartJob, onStopJob }) {
    const job = useSelector(state => state.job);

    if (!job)
        return null;

    const getButton = () => {
        if (job.remainingTiles == 0) {
            return {
                label: "Print map",
                icon: <PiMapTrifoldLight />,
                onClick: () => window.print()
            };
        }

        if (job.state == "notStarted") {
            return {
                label: "Download tiles",
                icon: <PiDownloadSimpleLight/>,
                onClick: onStartJob
            };
        }

        if (job.state == "inProgress") {
            return {
                label: "Pause",
                icon: <PiPauseCircleLight/>,
                secondary: true,
                onClick: onStopJob
            };
        }

        return {
            label: "Retry",
            icon: <PiArrowClockwiseLight/>,
            onClick: onStartJob
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
