import React from "react";

import "../style/toolbar-tab";

export default function ToolbarTab({ className, children }) {
    return <div className={`toolbar-tab ${className}`}>{ children }</div>;
}
