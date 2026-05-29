import * as THREE from "three";
import CobblePlugin from "./plugin.js";

// ─────────────────────────────────────────────────────────────────────────────
//  Module-private helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolve a scalar-or-range into a concrete number.
 *   scalar       → returned as-is
 *   [min, max]   → uniformly random float in [min, max]
 */
function resolveRange(value) {
    if (
        Array.isArray(value) &&
        value.length === 2 &&
        typeof value[0] === "number" &&
        typeof value[1] === "number"
    ) {
        return value[0] + Math.random() * (value[1] - value[0]);
    }
    return value;
}

/**
 * Resolve an options pick.
 *   single value     → returned as-is
 *   array of values  → one picked uniformly at random
 *
 * NOTE: number pairs intended as ranges should go through resolveRange instead.
 */
function resolveOptions(value) {
    if (Array.isArray(value)) {
        return value[Math.floor(Math.random() * value.length)];
    }
    return value;
}

/**
 * Resolve a color value.
 *   single THREE-compatible value  → new THREE.Color(value)
 *   [colorA, colorB]              → a random lerp between the two
 */
function resolveColor(value) {
    if (Array.isArray(value) && value.length === 2) {
        const a = new THREE.Color(value[0]);
        const b = new THREE.Color(value[1]);
        return new THREE.Color().lerpColors(a, b, Math.random());
    }
    return new THREE.Color(value);
}

/**
 * Resolve a velocity config into a THREE.Vector3.
 *   THREE.Vector3              → cloned directly
 *   { x?, y?, z? } object     → each axis resolved through resolveRange
 */
function resolveVelocity(config) {
    if (config instanceof THREE.Vector3) return config.clone();
    return new THREE.Vector3(
        resolveRange(config.x ?? 0),
        resolveRange(config.y ?? 1),
        resolveRange(config.z ?? 0),
    );
}

// ─────────────────────────────────────────────────────────────────────────────
//  ParticleEmitter  ·  internal class, not exported
// ─────────────────────────────────────────────────────────────────────────────

class ParticleEmitter {
    /**
     * @param {object}  options
     *
     * @param {"numbered"|"toggled"} options.mode
     *   "numbered" — emits up to `count` particles then stops.
     *   "toggled"  — emits continuously until .stop() is called.
     *
     * ── Range-able  (scalar  OR  [min, max] — random value in range) ──────────
     *
     * @param {number|[number,number]} [options.size=0.2]
     *   Sprite world-space scale.
     *
     * @param {number|[number,number]} [options.speed=1]
     *   Particle speed in units/second.  The velocity direction is normalised
     *   first, then multiplied by this value.
     *
     * @param {*|[*,*]}               [options.color=0xffffff]
     *   Any THREE-compatible colour (hex, CSS string, …), or [colorA, colorB]
     *   to lerp between randomly.
     *
     * @param {number|[number,number]} [options.opacity=1]
     *   Initial opacity (0–1).
     *
     * @param {number|[number,number]} [options.lifetime=2]
     *   How long each particle lives, in seconds.
     *
     * @param {number|[number,number]} [options.count=50]
     *   (Numbered only) Total particles to emit.  Resolved once at construction.
     *
     * @param {number|[number,number]} [options.emissionRate=15]
     *   Particles emitted per second.  Resolved once at construction; reassign
     *   emitter.emissionRate at runtime to change it.
     *
     * ── Velocity config ───────────────────────────────────────────────────────
     *
     * @param {THREE.Vector3|{x?,y?,z?}} [options.velocity={ x:0, y:1, z:0 }]
     *   Direction of travel.  Pass a THREE.Vector3 for a fixed direction, or an
     *   object where each axis can be a scalar or [min, max].
     *
     * ── Options-pick  (single value  OR  array — one picked at random) ────────
     *
     * @param {THREE.Texture|THREE.Texture[]|null} [options.texture=null]
     *   Sprite texture.  Pass an array to pick one at random per particle.
     *
     * ── Positioning ───────────────────────────────────────────────────────────
     *
     * @param {THREE.Vector3|{x?,y?,z?}} [options.position]
     *   World-space origin of the emitter (or local offset when using attachTo).
     *
     * @param {THREE.Object3D|null} [options.attachTo=null]
     *   Object to follow.  New particles spawn at attachTo.position + position.
     *   Useful for effects that trail a moving character.
     *
     * ── Misc ──────────────────────────────────────────────────────────────────
     *
     * @param {THREE.Vector3} [options.gravity=Vector3(0,0,0)]
     *   Constant acceleration applied to every active particle each second.
     *   Example: new THREE.Vector3(0, -9.8, 0) for realistic gravity.
     *
     * @param {boolean} [options.fadeOut=true]
     *   Linearly fade opacity to 0 over each particle's lifetime.
     *
     * @param {THREE.Scene} scene
     */
    constructor(options, scene) {
        this.scene      = scene;
        this.mode       = options.mode ?? "toggled";
        this.isFinished = false;

        // ─ Position / attachment ─────────────────────────────────────────────
        const pos = options.position;
        this.position = (pos instanceof THREE.Vector3)
            ? pos.clone()
            : new THREE.Vector3(pos?.x ?? 0, pos?.y ?? 0, pos?.z ?? 0);

        this.attachTo = options.attachTo ?? null;

        // ─ Per-particle options (public — changes take effect on the next emit) ─
        this.size     = options.size     ?? 0.2;
        this.velocity = options.velocity ?? { x: 0, y: 1, z: 0 };
        this.color    = options.color    ?? 0xffffff;
        this.opacity  = options.opacity  ?? 1.0;
        this.speed    = options.speed    ?? 1.0;
        this.lifetime = options.lifetime ?? 2.0;
        this.texture  = options.texture  ?? null;

        // ─ Emitter-level options ─────────────────────────────────────────────
        //   emissionRate is resolved once but can be reassigned freely.
        //   _targetCount is fixed for the lifetime of a Numbered emitter.
        this.emissionRate = resolveRange(options.emissionRate ?? 15);
        this._targetCount = Math.round(resolveRange(options.count ?? 50));

        // ─ Misc ──────────────────────────────────────────────────────────────
        this.gravity = (options.gravity instanceof THREE.Vector3)
            ? options.gravity.clone()
            : new THREE.Vector3(0, 0, 0);

        this.fadeOut = options.fadeOut !== false; // default true

        // ─ Private internal state ────────────────────────────────────────────
        this._particles           = [];
        this._totalEmitted        = 0;
        this._emissionAccumulator = 0;
        this._running             = true;    // toggled on/off flag
    }

    // ── Public controls ───────────────────────────────────────────────────────

    /** (Toggled) Resume emitting. */
    start() { this._running = true; }

    /** (Toggled) Pause emitting.  Active particles live out their lifetimes. */
    stop()  { this._running = false; }

    /** How many particles are currently alive. */
    get activeParticles() { return this._particles.length; }

    /**
     * Immediately destroy all active particles and mark this emitter as finished.
     * Called automatically by the Particles plugin when removeEmitter() is used.
     */
    dispose() {
        for (const p of this._particles) {
            this.scene.remove(p.sprite);
            p.sprite.material.dispose();
        }
        this._particles.length = 0;
        this.isFinished = true;
    }

    // ── Private ───────────────────────────────────────────────────────────────

    _emit() {
        const size     = resolveRange(this.size);
        const speed    = resolveRange(this.speed);
        const opacity  = resolveRange(this.opacity);
        const color    = resolveColor(this.color);
        const lifetime = resolveRange(this.lifetime);
        const texture  = resolveOptions(this.texture); // picks from array or returns single
        const dir      = resolveVelocity(this.velocity);

        // Normalise the direction vector so `speed` is the true units-per-second
        // magnitude, regardless of what the velocity components resolved to.
        if (dir.lengthSq() > 0) dir.normalize();
        dir.multiplyScalar(speed);

        const material = new THREE.SpriteMaterial({
            color,
            opacity,
            transparent: true,
            depthWrite:  false,
        });
        if (texture) material.map = texture;

        const sprite = new THREE.Sprite(material);
        sprite.scale.setScalar(size);
        sprite.position.copy(
            this.attachTo
                ? this.attachTo.position.clone().add(this.position)
                : this.position
        );

        this.scene.add(sprite);
        this._particles.push({
            sprite,
            velocity:       dir,
            lifetime,
            age:            0,
            initialOpacity: opacity,
        });
        this._totalEmitted++;
    }

    update(dt) {
        if (this.isFinished) return;

        // ── Emission ─────────────────────────────────────────────────────────
        const canEmit = this.mode === "toggled"
            ? this._running
            : this._totalEmitted < this._targetCount;

        if (canEmit) {
            this._emissionAccumulator += dt * this.emissionRate;
            while (this._emissionAccumulator >= 1) {
                if (this.mode === "numbered" && this._totalEmitted >= this._targetCount) {
                    this._emissionAccumulator = 0;
                    break;
                }
                this._emit();
                this._emissionAccumulator -= 1;
            }
        }

        // ── Update active particles ───────────────────────────────────────────
        for (let i = this._particles.length - 1; i >= 0; i--) {
            const p = this._particles[i];
            p.age += dt;

            if (p.age >= p.lifetime) {
                this.scene.remove(p.sprite);
                p.sprite.material.dispose();
                this._particles.splice(i, 1);
                continue;
            }

            // Movement + gravity
            p.sprite.position.addScaledVector(p.velocity, dt);
            p.velocity.addScaledVector(this.gravity, dt);

            // Linear opacity fade
            if (this.fadeOut) {
                p.sprite.material.opacity = p.initialOpacity * (1 - p.age / p.lifetime);
            }
        }

        // ── Numbered-mode completion check ────────────────────────────────────
        if (
            this.mode === "numbered" &&
            this._totalEmitted >= this._targetCount &&
            this._particles.length === 0
        ) {
            this.isFinished = true;
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Particles Plugin  ·  exported
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Particles — A COBBLE.js plugin for sprite-based particle effects.
 *
 * ── Setup ─────────────────────────────────────────────────────────────────────
 *
 *   const particles = new Particles();
 *   engine.addPlugin(particles);
 *
 * ── Numbered emitter  (e.g. ring / explosion — fires N particles and stops) ──
 *
 *   const ring = particles.createNumbered({
 *       position:     new THREE.Vector3(0, 1, 0),
 *       count:        [40, 60],          // random total between 40 and 60
 *       emissionRate: 300,               // emit fast so they all burst out together
 *       velocity:     { x: [-1, 1], y: [0, 0.3], z: [-1, 1] },
 *       speed:        [3, 5],
 *       size:         [0.05, 0.15],
 *       color:        [0xffcc00, 0xff4400],
 *       opacity:      [0.8, 1.0],
 *       lifetime:     [0.4, 1.0],
 *   });
 *   // The emitter is removed automatically once every particle has died.
 *
 * ── Toggled emitter  (e.g. running dust — runs until told to stop) ────────────
 *
 *   const dust = particles.createToggled({
 *       attachTo:     playerMesh,           // follows the player every frame
 *       position:     new THREE.Vector3(0, 0.05, 0),
 *       emissionRate: 25,
 *       velocity:     { x: [-0.4, 0.4], y: [0.1, 0.8], z: [-0.4, 0.4] },
 *       speed:        [0.5, 1.5],
 *       size:         [0.08, 0.18],
 *       color:        0xccbbaa,
 *       opacity:      [0.3, 0.6],
 *       lifetime:     [0.3, 0.7],
 *       texture:      [dustTex1, dustTex2, dustTex3],  // picked randomly per particle
 *   });
 *
 *   dust.stop();                           // pause emission (particles finish naturally)
 *   dust.start();                          // resume
 *   particles.removeEmitter(dust);         // full immediate cleanup
 */
export default class Particles extends CobblePlugin {
    constructor() {
        super();
        this.pluginName = "Particles";
        this._emitters  = [];
    }

    applyToEngine(engine) {
        super.applyToEngine(engine);
    }

    /**
     * Create a Numbered emitter.
     *
     * Emits up to `options.count` particles at `options.emissionRate` per second,
     * then stops.  Once all those particles have lived and died, the emitter is
     * automatically removed — no manual cleanup needed.
     *
     * @param   {object}          options  See ParticleEmitter for the full option list.
     * @returns {ParticleEmitter}
     */
    createNumbered(options = {}) {
        const emitter = new ParticleEmitter({ ...options, mode: "numbered" }, this.parent.scene);
        this._emitters.push(emitter);
        return emitter;
    }

    /**
     * Create a Toggled emitter.
     *
     * Emits indefinitely until `.stop()` is called.  Existing particles play out
     * naturally after stopping.  Call `.start()` to resume at any time.
     * Use `removeEmitter()` when the effect is no longer needed at all.
     *
     * @param   {object}          options  See ParticleEmitter for the full option list.
     * @returns {ParticleEmitter}
     */
    createToggled(options = {}) {
        const emitter = new ParticleEmitter({ ...options, mode: "toggled" }, this.parent.scene);
        this._emitters.push(emitter);
        return emitter;
    }

    /**
     * Immediately remove an emitter and kill all of its active particles.
     * For Toggled emitters, prefer calling `.stop()` first so particles fade out
     * gracefully — then call this once `emitter.activeParticles === 0`.
     *
     * @param {ParticleEmitter} emitter
     */
    removeEmitter(emitter) {
        const idx = this._emitters.indexOf(emitter);
        if (idx === -1) return;
        emitter.dispose();
        this._emitters.splice(idx, 1);
    }

    update(dt) {
        for (let i = this._emitters.length - 1; i >= 0; i--) {
            const emitter = this._emitters[i];
            emitter.update(dt);
            // Numbered emitters flag themselves finished once all particles die.
            if (emitter.isFinished) {
                this._emitters.splice(i, 1);
            }
        }
    }
}