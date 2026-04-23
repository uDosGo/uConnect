/**
 * Surface management
 */
import chalk from "chalk";
// Create a new surface
export function createSurface(width, height, depth = 1) {
    return {
        width,
        height,
        depth,
        layers: [{ id: "base", cells: [] }],
    };
}
// Add a layer to a surface
export function addLayer(surface, layerId) {
    surface.layers.push({ id: layerId, cells: [] });
    return surface;
}
// Add a cell to a layer
export function addCell(surface, layerId, cell) {
    const layer = surface.layers.find((l) => l.id === layerId);
    if (layer) {
        layer.cells.push(cell);
    }
    return surface;
}
// Render a surface
function renderAscii(surface) {
    let output = "";
    for (let y = 0; y < surface.height; y++) {
        for (let x = 0; x < surface.width; x++) {
            const cell = surface.layers[0].cells.find((c) => c.x === x && c.y === y);
            output += cell?.char || " ";
        }
        output += "\n";
    }
    return output;
}
function renderAnsi(surface) {
    let output = "";
    for (let y = 0; y < surface.height; y++) {
        for (let x = 0; x < surface.width; x++) {
            const cell = surface.layers[0].cells.find((c) => c.x === x && c.y === y);
            if (cell) {
                const colored = cell.fg ? chalk.hex(cell.fg)(cell.char || " ") : cell.char || " ";
                output += colored;
            }
            else {
                output += " ";
            }
        }
        output += "\n";
    }
    return output;
}
function renderHtml(surface) {
    let html = "<pre style='font-family: monospace;'>\n";
    for (let y = 0; y < surface.height; y++) {
        for (let x = 0; x < surface.width; x++) {
            const cell = surface.layers[0].cells.find((c) => c.x === x && c.y === y);
            if (cell) {
                const style = cell.fg ? `color: ${cell.fg};` : "";
                html += `<span style="${style}">${cell.char || "&nbsp;"}</span>`;
            }
            else {
                html += "&nbsp;";
            }
        }
        html += "<br>\n";
    }
    html += "</pre>\n";
    return html;
}
export function renderSurface(surface, options = {}) {
    const { mode = "ascii" } = options;
    switch (mode) {
        case "ascii":
            return renderAscii(surface);
        case "ansi":
            return renderAnsi(surface);
        case "html":
            return renderHtml(surface);
        default:
            return renderAscii(surface);
    }
}
