import * as THREE from "three";
import CobblePlugin from "./plugin.js";

export default class Camera extends CobblePlugin {
    constructor(camera = null, target = null) {
        super();
        this.pluginName = "Camera";
        this.isCameraPlugin = true;

        this.camera = camera ?? new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        this.camera.position.z = 5;

        this.canvasSize = { width: 100, height: 100 };
        this.canvasOffset = { x: 0, y: 0 };
        this.offset = new THREE.Vector3(0, 5, 10);
        this.sensitivity = 1.0;
        this.target = target;

        // Orbit controls
        this.orbitAngle = 0;        // Horizontal angle around target in radians

        // First person controls
        this.pitch = 0;             // Up/down look angle in radians
        this.yaw = 0;               // Left/right look angle in radians

        this._mode = "Follow";
    }

    // Called by the engine when the plugin is registered — parent is available here
    applyToEngine(engine) {
        super.applyToEngine(engine);
        this._checkInputManager(); // Re-run the check now that parent exists
    }

    get mode() {
        return this._mode;
    }

    set mode(value) {
        this._mode = value;
        this._checkInputManager();
    }

    get position() {
        return this.camera.position;
    }

    set position(value) {
        this.camera.position.copy(value);
    }

    set rotation(value) {
        this.camera.rotation.copy(value);
    }

    get rotation() {
        return this.camera.rotation;
    }

    _checkInputManager() {
        // If parent isn't available yet (e.g. set during constructor), skip silently
        if (!this.parent) return;

        const requiresInput = ["Orbit", "FirstPerson"];
        if (!requiresInput.includes(this._mode)) return;

        const inputManager = this.parent.findPlugin("Input Manager");

        if (inputManager) {
            console.log("InputManager Found!");
        } else {
            console.warn(`Camera mode "${this._mode}" won't function properly without an Input Manager plugin.`);
        }
    }

    update(dt) {
        if (!this.camera) return;

        if (this.mode === "Follow") {
            if (this.target) {
                this.camera.position.copy(this.target.position).add(this.offset);
                this.camera.lookAt(this.target.position);
            }
        }

        else if (this.mode === "Static") {
            this.camera.position.copy(this.offset);
            if (this.target) {
                this.camera.lookAt(this.target.position);
            }
        }

        else if (this.mode === "Orbit") {
            if (!this.target) return;

            const radius = this.offset.x;
            const elevation = this.offset.y;

            this.camera.position.set(
                this.target.position.x + radius * Math.sin(this.orbitAngle),
                this.target.position.y + elevation,
                this.target.position.z + radius * Math.cos(this.orbitAngle)
            );

            this.camera.lookAt(this.target.position);
        }

        else if (this.mode === "FirstPerson") {
            if (!this.target) return;

            // Position at target + eye offset
            this.camera.position.copy(this.target.position).add(this.offset);

            // YXZ order is standard for FPS — yaw first, then pitch, no roll
            this.camera.rotation.set(this.pitch, this.yaw, 0, "YXZ");
        }
    }

    render(renderer, scene) {
        if (!this.camera || !renderer) return;

        const size = new THREE.Vector2();
        renderer.getSize(size);

        const viewportWidth = Math.max(1, Math.floor(size.x * (this.canvasSize.width / 100)));
        const viewportHeight = Math.max(1, Math.floor(size.y * (this.canvasSize.height / 100)));
        const viewportX = Math.floor(size.x * (this.canvasOffset.x / 100));
        const viewportY = Math.floor(size.y * (this.canvasOffset.y / 100));

        this.camera.aspect = viewportWidth / viewportHeight;
        this.camera.updateProjectionMatrix();

        renderer.setScissorTest(true);
        renderer.setViewport(viewportX, viewportY, viewportWidth, viewportHeight);
        renderer.setScissor(viewportX, viewportY, viewportWidth, viewportHeight);
        renderer.clear();
        renderer.render(scene, this.camera);
    }
}   