import React from "react";

import "../style/button";

export default function Button({ children, className, active, secondary, ...props }) {
    return (
        <button className={`button ${className ?? ""} ${active && "active"} ${secondary && "secondary"}`} {...props}>
            { children }
        </button>
    );
}
