import * as THREE from "three";
import CobblePlugin from "./plugin.js";
export default class UIManager extends CobblePlugin {
    constructor() {
        // Plugin details
        super();
        this.pluginName = "Entity Manager"; // The name of the plugin

        // Plugin properties
        this.screens = [];
    }

    addScreen(camera = null) {
        if (camera) {
            // Creates a new HTML element for a UI screen and adds it to the screens array
            const screen = document.createElement("div");
            screen.classList.add("ui-screen");
            this.parent.attachHTML(screen);

            this.camera = camera;

            // Get the size of the canvas and set the screen to match it
            const canvasRect = this.parent.renderer.domElement.getBoundingClientRect();
            screen.style.position = "absolute";
            screen.style.width = canvasRect.width + "px";
            screen.style.height = canvasRect.height + "px";
            this.screens.push(screen);

            // Check the camera for canvas offset and size properties, and apply them to the screen
            if (camera.canvasOffset) {
                screen.style.left = camera.canvasOffset.x + "%";
                // Three.js viewports are positioned from the bottom-left, but CSS `top` is from
                // the top-left. Use `bottom` so the UI overlay matches the camera viewport.
                screen.style.top = "auto";
                screen.style.bottom = camera.canvasOffset.y + "%";
            }
            if (camera.canvasSize) {
                screen.style.width = camera.canvasSize.width + "%";
                screen.style.height = camera.canvasSize.height + "%";
            }

            
            return screen;
        }
        else {
            console.warn("UIManager: No camera provided for UI screen. The screen will not be created.");
            return null;
        }
    }

    addItem(screen, data = {type: "text", content: "*****", style: {color: "white", fontSize: "2"}}) {
        // Creates a new HTML element for a UI item and adds it to the specified screen
        const item = document.createElement("div");
        item.classList.add("ui-item");
        item.style.position = "absolute";
        item.style.color = data.style.color || "white";
        item.style.fontSize = (data.style.fontSize * 10) + "%" || "2%";
        item.innerText = data.content || "*****";
        screen.appendChild(item);
        return item;
    }

    editItem(item, newData = {content: "*****", style: {color: "white", fontSize: "2"}}) {
        // Edits an existing UI item with new data
        if (newData.content) {
            item.innerText = newData.content;
        }
        if (newData.style) {
            item.style.color = newData.style.color || "white";
            item.style.fontSize = (newData.style.fontSize * 10) + "%" || "2%";
        }
    }

    update = () => {
        for (const screen of this.screens) {
            if (screen.camera) {
                let camera = screen.camera;
                
                // Check the camera for canvas offset and size properties, and apply them to the screen
                if (camera.canvasOffset) {
                    screen.style.left = camera.canvasOffset.x + "%";
                    // Three.js viewports are positioned from the bottom-left, but CSS `top` is from
                    // the top-left. Use `bottom` so the UI overlay matches the camera viewport.
                    screen.style.top = "auto";
                    screen.style.bottom = camera.canvasOffset.y + "%";
                }
                if (camera.canvasSize) {
                    screen.style.width = camera.canvasSize.width + "%";
                    screen.style.height = camera.canvasSize.height + "%";
                }
            }
        }
    }
}