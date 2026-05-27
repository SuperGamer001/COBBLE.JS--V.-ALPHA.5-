// The main Cobble.js class that ships with the COBBLE.js project. This is the core of the engine and provides the main loop, scene management, and entity management.
import * as THREE from "three";
import CobblePlugin from "./plugins/plugin.js";

export default class Cobble {
    constructor() {
        this.version = "0.1.0"; // Version number for debugging and compatibility checks
        this.isReady = false; // Set to true when Three.js is loaded
        this.plugins = {}; // Collection of plugins
        this._lastTime = 0; // For delta time calculation in the main loop
        this._skyColor = 0x87ceeb; // Default sky color

        Object.defineProperty(this, "skyColor", {
            get: () => this._skyColor,
            set: (value) => {
                this._skyColor = value;

                // Keep the scene background in sync with the sky color.
                if (this.isReady && this.scene) {
                    this.scene.background = new THREE.Color(value);
                }
            }
        });

        if (typeof THREE !== "undefined") {
            this.isReady = true; // Three.js is loaded and ready to use
            this.scene = new THREE.Scene(); // Create a new scene
            this.skyColor = this._skyColor;

            // The default camera
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.camera.position.z = 5;

            // The default sun light
            this.sun = new THREE.DirectionalLight(0xffffff, 1);
            this.sun.position.set(5, 10, 7.5);
            this.scene.add(this.sun);

            // The default ambient light
            this.ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
            this.scene.add(this.ambientLight);

            // The default renderer
            this.renderer = new THREE.WebGLRenderer();
            this.renderer.setSize(window.innerWidth, window.innerHeight);

            this.frame = 0; // Frame counter for debugging and time-based events

            // Append the renderer to the body
            document.body.appendChild(this.renderer.domElement);
        } else {
            console.warn("Three.js is not available. Cobble.js will not function properly.");
        }

        this.update = (time = 0) => {
            this.frame++;
            if (!this.isReady) return;

            // If the user made a custom nextFrame function, call it. This allows users to inject code that runs at the start of every frame, before the plugins update.
            if (this.nextFrame) {
                this.nextFrame();
            }

            const dt = (time - this._lastTime) / 1000; // seconds
            this._lastTime = time;

            // `this.plugins` is stored as an object (map). Objects are not iterable with `for...of`.
            // Use `Object.values` to iterate the plugin instances safely.
            for (const plugin of Object.values(this.plugins)) {
                if (plugin && typeof plugin.update === "function") {
                    plugin.update(dt);
                }
            }

            const uiPlugins = Object.values(this.plugins).filter(
                (plugin) => plugin && plugin.isUIPlugin && typeof plugin.render === "function"
            );

            const cameraPluginEntries = Object.entries(this.plugins).filter(
                ([, plugin]) => plugin && plugin.isCameraPlugin
            );

            if (cameraPluginEntries.length > 0) {
                for (const [cameraKey, cameraPlugin] of cameraPluginEntries) {
                    if (typeof cameraPlugin.render === "function") {
                        cameraPlugin.render(this.renderer, this.scene);
                    }

                    for (const uiPlugin of uiPlugins) {
                        uiPlugin.render(this.renderer, cameraPlugin, cameraKey);
                    }
                }
            }
            else {
                this.renderer.setScissorTest(false);
                this.renderer.render(this.scene, this.camera);

                for (const uiPlugin of uiPlugins) {
                    uiPlugin.render(this.renderer, null, null);
                }
            }

            requestAnimationFrame(this.update);
        };

        this.addPlugin = (plugin) => {
            if (plugin instanceof CobblePlugin) {
                plugin.applyToEngine(this);

                let pluginKey = plugin.pluginName;
                let duplicateIndex = 2;

                while (this.plugins[pluginKey]) {
                    pluginKey = `${plugin.pluginName} ${duplicateIndex}`;
                    duplicateIndex += 1;
                }

                this.plugins[pluginKey] = plugin;
            }
            else {
                console.warn("The parameter entered is not a valid Cobble Plugin", plugin);
            }
        }

        this.findPlugin = (pluginName) => {
            // return true if the plugin exists, false if it doesn't
            return this.plugins[pluginName] ? this.plugins[pluginName] : false;
        }

        requestAnimationFrame(this.update);
    }
}