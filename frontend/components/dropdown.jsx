import React from "react";
import * as Select from "@radix-ui/react-select";

import "../style/button";
import "../style/dropdown";

export default function Dropdown({ items, value, onValueChange, className, numerical }) {
    return (
        <Select.Root value={value ?? undefined} onValueChange={onValueChange}>
            <Select.Trigger className={`dropdown-trigger button secondary ${className}`}>
                <Select.Value placeholder="Choose"/>
                <Select.Icon className="icon"/>
            </Select.Trigger>
            <Select.Portal>
                <Select.Content className={`dropdown-content ${numerical && "numerical"}`}>
                    <Select.Viewport>
                        {
                            items.map(item => (
                                <Select.Item className="button secondary" value={item.value} key={item.value}>
                                    <Select.ItemText>
                                        <div className="dropdown-item">
                                            <p className="label">{ item.label ?? item.value }</p>
                                            { item.description && <p className="description">{ item.description }</p> }
                                        </div>
                                    </Select.ItemText>
                                </Select.Item>
                            ))
                        }
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    );
}
