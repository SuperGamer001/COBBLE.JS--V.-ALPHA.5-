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

        // Skybox — cubemap takes priority over spheremap when both are set
        this.cubemap = null;        // THREE.CubeTexture  — set via loadCubemap()
        this.spheremap = null;      // THREE.Texture (equirectangular) — set via loadSpheremap()

        this._mode = "Follow";
    }

    // Called by the engine when the plugin is registered — parent is available here
    applyToEngine(engine) {
        super.applyToEngine(engine);
        this._checkInputManager();
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

    /**
     * Load a cubemap skybox from six face images.
     * @param {string[]} urls - Six URLs in order: [+X, -X, +Y, -Y, +Z, -Z]
     *                          i.e. [right, left, top, bottom, front, back]
     * @returns {Promise<THREE.CubeTexture>}
     *
     * @example
     * await camera.loadCubemap([
     *   'sky/px.png', 'sky/nx.png',
     *   'sky/py.png', 'sky/ny.png',
     *   'sky/pz.png', 'sky/nz.png',
     * ]);
     */
    loadCubemap(urls) {
        return new Promise((resolve, reject) => {
            const loader = new THREE.CubeTextureLoader();
            loader.load(
                urls,
                (texture) => {
                    this.cubemap = texture;
                    resolve(texture);
                },
                undefined,
                (err) => {
                    console.error("Camera: failed to load cubemap", err);
                    reject(err);
                }
            );
        });
    }

    /**
     * Load a spheremap (equirectangular panorama) skybox from a single image.
     * @param {string} url - Path to the equirectangular panorama image.
     * @returns {Promise<THREE.Texture>}
     *
     * @example
     * await camera.loadSpheremap('sky/panorama.jpg');
     */
    loadSpheremap(url) {
        return new Promise((resolve, reject) => {
            const loader = new THREE.TextureLoader();
            loader.load(
                url,
                (texture) => {
                    texture.mapping = THREE.EquirectangularReflectionMapping;
                    this.spheremap = texture;
                    resolve(texture);
                },
                undefined,
                (err) => {
                    console.error("Camera: failed to load spheremap", err);
                    reject(err);
                }
            );
        });
    }

    /** Remove whichever skybox is currently active and clear the scene background. */
    clearSkybox() {
        this.cubemap = null;
        this.spheremap = null;
    }

    _checkInputManager() {
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

            this.camera.position.copy(this.target.position).add(this.offset);
            this.camera.rotation.set(this.pitch, this.yaw, 0, "YXZ");
        }
    }

    render(renderer, scene) {
        if (!this.camera || !renderer) return;

        const size = new THREE.Vector2();
        renderer.getSize(size);

        const viewportWidth  = Math.max(1, Math.floor(size.x * (this.canvasSize.width  / 100)));
        const viewportHeight = Math.max(1, Math.floor(size.y * (this.canvasSize.height / 100)));
        const viewportX = Math.floor(size.x * (this.canvasOffset.x / 100));
        const viewportY = Math.floor(size.y * (this.canvasOffset.y / 100));

        this.camera.aspect = viewportWidth / viewportHeight;
        this.camera.updateProjectionMatrix();

        // Apply this camera's skybox, swapping the scene background temporarily
        // so multiple cameras with different skies can coexist in the same scene.
        const previousBackground = scene.background;

        if (this.cubemap) {
            scene.background = this.cubemap;
        } else if (this.spheremap) {
            scene.background = this.spheremap;
        }

        renderer.setScissorTest(true);
        renderer.setViewport(viewportX, viewportY, viewportWidth, viewportHeight);
        renderer.setScissor(viewportX, viewportY, viewportWidth, viewportHeight);
        renderer.clear();
        renderer.render(scene, this.camera);

        // Restore scene background so other cameras/systems aren't affected
        scene.background = previousBackground;
    }
}