import React from "react";

import "../style/button";

export default function Button(props) {
    const { children, className, ...otherProps } = props;

    return (
        <button className={`button ${className ?? ""}`} {...otherProps}>
            { children }
        </button>
    );
}
