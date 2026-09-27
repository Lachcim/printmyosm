import React, { useEffect, useRef } from "react";

import "../style/text-input";

export default function TextInput({ major, minor, autofocus, ...props }) {
    const inputRef = useRef();
    const shouldAutofocus = useRef(autofocus);

    useEffect(() => {
        if (shouldAutofocus.current) {
            inputRef.current.select();
            shouldAutofocus.current = false;
        }
    }, []);

    return (
        <input
            type="text"
            className={`text-input ${major && "major"} ${minor && "minor"}`}
            ref={inputRef}
            {...props}
        />
    );
}
