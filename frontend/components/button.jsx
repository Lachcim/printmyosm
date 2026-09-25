import React from "react";

import "../style/button";

export default function Button({ children, className, active, secondary, unobtrusive, ...props }) {
    return (
        <button className={`button ${className ?? ""} ${active && "active"} ${secondary && "secondary"} ${unobtrusive && "unobtrusive"}`} {...props}>
            { children }
        </button>
    );
}
