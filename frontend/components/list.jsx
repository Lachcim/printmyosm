import React, { useEffect, useRef } from "react";

import Button from "./button";

import "../style/button";
import "../style/list";

import remove from "../assets/remove.svg";

function ListItem({ children, onClick, onRemove }) {
    return (
        <li
            role="button"
            tabIndex={0}
            className="button secondary"
            onClick={onClick}
            onKeyDown={onClick && (event => {
                if (event.key == "Enter" || event.key == " ") {
                    event.preventDefault();
                    onClick();
                }
            })}
        >
            <span>{ children }</span>
            {
                onRemove && (
                    <Button
                        unobtrusive
                        onClick={event => { event.stopPropagation(); onRemove(); }}
                        onKeyDown={event => { event.stopPropagation(); }}
                    >
                        <img src={remove} alt="Remove" className="remove"/>
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
        if (items.length <= previousItemCount.current)
            return;

        const ul = rawList.current;
        if (ul) {
            ul.scrollTop = ul.scrollHeight;
        }

        previousItemCount.current = items.length;
    }, [items.length]);

    return (
        <ul className={`list ${items.length == 0 && "empty"} ${mini && "mini"}`} ref={rawList}>
            {
                items.map(item => (
                    <ListItem key={item.key} onClick={item.onClick} onRemove={item.onRemove}>
                        { item.label }
                    </ListItem>)
                )
            }
            {
                emptyText && items.length == 0 && <p>{ emptyText }</p>
            }
        </ul>
    );
}
