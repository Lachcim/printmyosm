import React, { useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";

import Button from "./button";

import "../style/button";
import "../style/list";

function ListItem({ children, onClick, onRemove, active, ...props }) {
    return (
        <li
            role="button"
            tabIndex={0}
            className={`button secondary ${active && "active"}`}
            onClick={onClick}
            onKeyDown={onClick && (event => {
                if (event.key == "Enter" || event.key == " ") {
                    event.preventDefault();
                    onClick();
                }
            })}
            {...props}
        >
            <span>{ children }</span>
            {
                onRemove && (
                    <Button
                        className="removeButton"
                        unobtrusive
                        onClick={event => { event.stopPropagation(); onRemove(); }}
                        onKeyDown={event => { event.stopPropagation(); }}
                    >
                        <IoClose alt="Remove" className="remove"/>
                    </Button>
                )
            }
        </li>
    );
}

export default function List({ items, emptyText, mini }) {
    const rawList = useRef();
    const previousItemCount = useRef(items.length);

    useEffect(() => {
        if (items.length <= previousItemCount.current) {
            previousItemCount.current = items.length;
            return;
        }

        const ul = rawList.current;
        if (ul) {
            ul.scrollTop = ul.scrollHeight;
        }

        previousItemCount.current = items.length;
    }, [items.length]);

    return (
        <ul className={`list ${items.length == 0 && "empty"} ${mini && "mini"}`} ref={rawList}>
            {
                items.map(item => {
                    const { label, key, ...itemProps } = item;

                    return (
                        <ListItem key={key} {...itemProps}>
                            { label }
                        </ListItem>
                    );
                })
            }
            {
                emptyText && items.length == 0 && <p>{ emptyText }</p>
            }
        </ul>
    );
}
