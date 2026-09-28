import React from "react";

import ToolbarTab from "./toolbar-tab";

export default function GeometryTab() {
    return (
        <ToolbarTab>
            <h2>Detail level</h2>
            <table>
                <tbody>
                    <tr>
                        <th>Map scale</th>
                        <td>1:100 000</td>
                    </tr>
                    <tr>
                        <th>Zoom level</th>
                        <td>13</td>
                    </tr>
                </tbody>
            </table>
            <h2>Page layout</h2>
            <table>
                <tbody>
                    <tr>
                        <th>Paper size</th>
                        <td>A4</td>
                    </tr>
                    <tr>
                        <th>Landscape</th>
                        <td>false</td>
                    </tr>
                    <tr>
                        <th>Borderless</th>
                        <td>false</td>
                    </tr>
                </tbody>
            </table>
        </ToolbarTab>
    );
}
