// This script ships with the COBBLE.js project and provides the base Entity class that all other entities (like cameras, lights, etc.) will extend.
// This gives access to the main engine, and makes it act like a parent class for each plugin.

import * as THREE from "three";

export default class CobblePlugin {
    pluginName = "Unnamed Plugin"; // The name of the plugin - this is just for organizational purposes and doesn't affect functionality. Override this in your plugin to give it a name.

    constructor() {
        this.parent = null; // This will be set to the main Cobble instance when the plugin is registered
    }

    applyToEngine(engine) {
        this.parent = engine;
    }

    // Update method that will be called every frame. Plugins need to override this to implement their own behavior.
    update(dt) {
        // Default implementation does nothing. Override this in your plugin to add behavior.
    }
}