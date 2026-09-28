import React from "react";
import { useSelector } from "react-redux";
import * as Popover from "@radix-ui/react-popover";
import { Icon } from "@radix-ui/react-select";

import Button from "./button";

import "../style/zoom-selector";

function ZoomSelector({ value, onCapture }) {
    const zoomLevel = useSelector(state => state.mapView.zoomLevel);

    return (
        <Popover.Root>
            <Popover.Trigger asChild>
                <Button secondary className="zoom-selector-trigger">
                    { value && <p className="value">{ value }</p> }
                    { !value && <p className="placeholder">Choose</p> }
                    <Icon className="icon"/>
                </Button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content asChild align="start">
                    <div className="zoom-selector-content">
                        <div>
                            <p className="value">{ zoomLevel }</p>
                            <p className="tip">Zoom the map to adjust the zoom level.</p>
                            <Popover.Close asChild>
                                <Button className="done" onClick={() => onCapture(zoomLevel)}>Capture</Button>
                            </Popover.Close>
                        </div>
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}

export default ZoomSelector;
