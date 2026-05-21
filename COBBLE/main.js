// The main Cobble.js class that ships with the COBBLE.js project. This is the core of the engine and provides the main loop, scene management, and entity management.
import * as THREE from "three";
import CobblePlugin from "./plugins/plugin.js";

export default class Cobble {
    constructor() {
        this.version = "0.1.0"; // Version number for debugging and compatibility checks
        this.isReady = false; // Set to true when Three.js is loaded
        this.plugins = {}; // Collection of plugins
        this._lastTime = 0; // For delta time calculation in the main loop

        if (typeof THREE !== "undefined") {
            this.isReady = true; // Three.js is loaded and ready to use
            this.scene = new THREE.Scene(); // Create a new scene

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

            // Append the renderer to the body
            document.body.appendChild(this.renderer.domElement);
        } else {
            console.warn("Three.js is not available. Cobble.js will not function properly.");
        }

        this.update = (time = 0) => {
            if (!this.isReady) return;

            const dt = (time - this._lastTime) / 1000; // seconds
            this._lastTime = time;

            // `this.plugins` is stored as an object (map). Objects are not iterable with `for...of`.
            // Use `Object.values` to iterate the plugin instances safely.
            for (const plugin of Object.values(this.plugins)) {
                if (plugin && typeof plugin.update === "function") {
                    plugin.update(dt);
                }
            }

            const cameraPlugins = Object.values(this.plugins).filter((plugin) => plugin && plugin.isCameraPlugin);

            if (cameraPlugins.length > 0) {
                for (const cameraPlugin of cameraPlugins) {
                    if (typeof cameraPlugin.render === "function") {
                        cameraPlugin.render(this.renderer, this.scene);
                    }
                }
            }
            else {
                this.renderer.setScissorTest(false);
                this.renderer.render(this.scene, this.camera);
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