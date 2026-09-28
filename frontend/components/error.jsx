import React from "react";

import "../style/error";

export default function Error({ heading, text }) {
    return (
        <div className="error">
            <h3>{ heading }</h3>
            <p>{ text }</p>
        </div>
    );
}
