import React, { useState } from "react";

import "../style/text-input";

export default function TextInput({ className, ...props }) {
    const [value, setValue] = useState("");

    return (
        <input
            type="text"
            className={`text-input ${className}`}
            value={value}
            onChange={event => setValue(event.target.value)}
            {...props}
        />
    );
}
