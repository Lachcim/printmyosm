import React, { useState } from "react";

import Button from "./button";
import TextInput from "./text-input";

import "../style/label-input";

import pencil from "../assets/pencil.svg";

function Edit({ onClick, disabled }) {
    return (
        <Button
            unobtrusive
            onClick={onClick}
            disabled={disabled}
        >
            <img src={pencil} alt="Edit" className="edit"/>
        </Button>
    );
}

export default function LabelInput({ onSubmit, ...props }) {
    const [active, setActive] = useState(false);

    if (active) {
        const handleSubmit = () => {
            setActive(false);
            onSubmit?.();
        };

        return (
            <TextInput
                onBlur={handleSubmit}
                onKeyDown={event => event.key == "Enter" && handleSubmit?.()}
                autofocus
                {...props}
            />
        );
    }

    const inner = (
        <>
            { props.value || props.placeholder }
            <Edit
                onClick={() => setActive(true)}
                disabled={props.disabled}
            />
        </>
    );

    if (props.major) return <h1 className="label-input major">{ inner }</h1>;
    if (props.minor) return <h2 className="label-input minor">{ inner }</h2>;
    return <p className="label-input">{ inner }</p>;
}
