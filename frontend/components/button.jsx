import React from "react";

import "../style/button";

export default function Button({ children, className, active, ...props }) {
    return (
        <button className={`button ${className ?? ""} ${active && "active"}`} {...props}>
            { children }
        </button>
    );
}
