import * as THREE from "three";
import CobblePlugin from "./plugin.js";

// ─────────────────────────────────────────────
//  PhysicsManager.js  —  Cobble.js Physics Plugin
//
//  Usage:
//      const physics = new PhysicsManager();
//      engine.addPlugin(physics);
//
//      const box = entityManager.addBox();
//      physics.addBody(box, { type: "dynamic", shape: "box" });
//
//      // Per-entity overrides (all optional):
//      box.physics.config.restitution = 0.9;
//      box.physics.config.gravity = new THREE.Vector3(0, -3, 0);
//
//  Collision shapes supported: "box" (AABB/OBB) | "sphere"
//  Body types supported:       "dynamic"        | "static"
// ─────────────────────────────────────────────

export default class PhysicsManager extends CobblePlugin {
    constructor() {
        super();
        this.pluginName = "Physics Manager";

        // ── Global physics defaults ───────────────────────────────────────────
        // Any of these can be overridden per-entity via entity.physics.config
        this.defaults = {
            gravity:         new THREE.Vector3(0, -9.8, 0), // m/s²
            mass:            1,       // kg
            restitution:     0.4,     // bounciness     (0 = dead stop, 1 = perfect bounce)
            friction:        0.5,     // surface drag   (0 = ice,       1 = very rough)
            stickiness:      0.0,     // adhesion       (0 = none,      1 = glue-like)
            airResistance:   0.1,    // velocity bleed per second (applied continuously)
            sleepThreshold:  0.0,    // bodies slower than this are put to sleep
        };
        // ─────────────────────────────────────────────────────────────────────

        this._bodies     = []; // Array of registered body descriptors
        this._debugMeshes = new Map(); // body → { outline, velArrow }
        this._debug       = false;

        // ── debug (getter/setter) ─────────────────────────────────────────────
        // Toggle collision shape overlays + velocity arrows on all registered bodies.
        // Safe to set before or after addBody() calls — meshes are created lazily.
        //
        //   physics.debug = true;   // turn on
        //   physics.debug = false;  // turn off, cleans up all overlays
        Object.defineProperty(this, "debug", {
            get: () => this._debug,
            set: (value) => {
                this._debug = !!value;
                if (!this._debug) this._destroyAllDebugMeshes();
            },
        });
        // ─────────────────────────────────────────────────────────────────────
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Register an entity as a physics body.
     *
     * @param {Entity}  entity          - The Cobble Entity to register.
     * @param {object}  options
     * @param {string}  options.type    - "dynamic" (simulated) | "static" (immovable collider).
     * @param {string}  options.shape   - "box" | "sphere".
     * @param {*}       options.size    - Optional manual size.
     *                                   Box   → THREE.Vector3 of half-extents.
     *                                   Sphere → number radius.
     *                                   Omit to auto-derive from entity geometry + scale.
     * @returns {Entity} The same entity, now with entity.physics attached.
     */
    addBody(entity, { type = "dynamic", shape = "box", size = null } = {}) {
        // ── Attach physics state to the entity ────────────────────────────────
        entity.physics = {
            // Active simulation state — updated every frame by the engine.
            state: {
                velocity:        new THREE.Vector3(),
                angularVelocity: new THREE.Vector3(),
                isGrounded:      false,
                isColliding:     false,
                isSleeping:      false,
            },

            // Per-entity config overrides — empty by default (inherits PhysicsManager.defaults).
            // Set any key here to override it for this body only.
            // e.g.  entity.physics.config.restitution = 0.9;
            //       entity.physics.config.gravity = new THREE.Vector3(0, -20, 0);
            config: {},
        };
        // ─────────────────────────────────────────────────────────────────────

        if (size === null) size = this._deriveSize(entity, shape);

        const body = { entity, type, shape, size };
        this._bodies.push(body);
        if (this._debug) this._createDebugMesh(body);
        return entity;
    }

    /**
     * Remove an entity from physics simulation.
     * @param {Entity} entity
     */
    removeBody(entity) {
        const body = this._bodies.find((b) => b.entity === entity);
        if (body) this._destroyDebugMesh(body);
        this._bodies = this._bodies.filter((b) => b.entity !== entity);
    }

    /**
     * Convenience: apply an instant velocity impulse to a body.
     * @param {Entity}          entity
     * @param {THREE.Vector3}   impulse
     */
    applyImpulse(entity, impulse) {
        if (!entity.physics) return;
        const cfg = this._resolveConfig(entity);
        entity.physics.state.velocity.addScaledVector(impulse, 1 / cfg.mass);
        entity.physics.state.isSleeping = false;
    }

    /**
     * Convenience: apply a continuous force for one frame (F = ma → a = F/m).
     * Call from your own update loop before PhysicsManager ticks.
     * @param {Entity}          entity
     * @param {THREE.Vector3}   force   (Newtons)
     * @param {number}          dt      (seconds)
     */
    applyForce(entity, force, dt) {
        if (!entity.physics) return;
        const cfg = this._resolveConfig(entity);
        entity.physics.state.velocity.addScaledVector(force, dt / cfg.mass);
        entity.physics.state.isSleeping = false;
    }

    /**
     * Convenience: set the velocity of a body.
     * @param {Entity}          entity
     * @param {THREE.Vector3}   velocity
     */
    setVelocity(entity, velocity) {
        if (!entity.physics) return;
        entity.physics.state.velocity.copy(velocity);
        entity.physics.state.isSleeping = false;
    }

    // ── Main loop ─────────────────────────────────────────────────────────────

    update(dt) {
        // Guard: clamp dt to avoid tunnelling / explosion on frame spikes
        if (dt <= 0 || dt > 0.1) return;

        this._integrateVelocities(dt);
        this._detectAndResolveCollisions(dt);

        if (this._debug) this._syncDebugMeshes();
    }

    // ── Integration ───────────────────────────────────────────────────────────

    _integrateVelocities(dt) {
        for (const body of this._bodies) {
            if (body.type !== "dynamic") continue;

            const { entity } = body;
            const cfg   = this._resolveConfig(entity);
            const state = entity.physics.state;

            if (state.isSleeping) continue;

            // Gravity
            const g = cfg.gravity instanceof THREE.Vector3
                ? cfg.gravity
                : new THREE.Vector3(cfg.gravity.x ?? 0, cfg.gravity.y ?? -9.8, cfg.gravity.z ?? 0);

            state.velocity.addScaledVector(g, dt);

            // Air resistance (drag)
            state.velocity.multiplyScalar(1 - (cfg.airResistance / 100) * dt * 60);

            // Integrate position
            entity.entity.position.addScaledVector(state.velocity, dt);

            // Reset per-frame flags
            state.isGrounded  = false;
            state.isColliding = false;

            // Sleep check
            if (state.velocity.lengthSq() < cfg.sleepThreshold * cfg.sleepThreshold) {
                state.velocity.set(0, 0, 0);
                state.isSleeping = true;
            }
        }
    }

    // ── Collision pipeline ────────────────────────────────────────────────────

    _detectAndResolveCollisions(dt) {
        for (let i = 0; i < this._bodies.length; i++) {
            const a = this._bodies[i];
            if (a.type !== "dynamic") continue;

            for (let j = 0; j < this._bodies.length; j++) {
                if (i === j) continue;
                const b = this._bodies[j];

                const hit = this._detectCollision(a, b);
                if (hit) this._resolveCollision(a, b, hit);
            }
        }
    }

    // ── Collision detection ───────────────────────────────────────────────────
    // All methods return { normal: THREE.Vector3, depth: number } or null.
    // `normal` always points FROM b TOWARD a (push-out direction for a).

    _detectCollision(a, b) {
        const posA = a.entity.entity.position;
        const posB = b.entity.entity.position;
        const rotA = a.entity.entity.quaternion;
        const rotB = b.entity.entity.quaternion;

        if (a.shape === "sphere" && b.shape === "sphere") {
            return this._collideSphereVsSphere(posA, a.size, posB, b.size);
        }

        if (a.shape === "box" && b.shape === "box") {
            return this._collideBoxVsBox(posA, a.size, posB, b.size);
        }

        if (a.shape === "sphere" && b.shape === "box") {
            // Sphere vs OBB — handles slopes (rotated static boxes) correctly.
            return this._collideSphereVsOBB(posA, a.size, posB, b.size, rotB);
        }

        if (a.shape === "box" && b.shape === "sphere") {
            const hit = this._collideSphereVsOBB(posB, b.size, posA, a.size, rotA);
            if (hit) hit.normal.negate(); // flip: normal must point from b toward a
            return hit;
        }

        return null;
    }

    /** Sphere vs Sphere */
    _collideSphereVsSphere(posA, rA, posB, rB) {
        const delta = new THREE.Vector3().subVectors(posA, posB);
        const dist  = delta.length();
        const sum   = rA + rB;
        if (dist >= sum) return null;

        return {
            normal: dist > 0.0001 ? delta.normalize() : new THREE.Vector3(0, 1, 0),
            depth:  sum - dist,
        };
    }

    /** AABB Box vs AABB Box — fast axis-aligned overlap test */
    _collideBoxVsBox(posA, halfA, posB, halfB) {
        const dx = posA.x - posB.x;
        const dy = posA.y - posB.y;
        const dz = posA.z - posB.z;
        const ox = halfA.x + halfB.x - Math.abs(dx);
        const oy = halfA.y + halfB.y - Math.abs(dy);
        const oz = halfA.z + halfB.z - Math.abs(dz);

        if (ox <= 0 || oy <= 0 || oz <= 0) return null;

        // Resolve on the axis of minimum penetration
        if (oy <= ox && oy <= oz) return { normal: new THREE.Vector3(0, Math.sign(dy), 0), depth: oy };
        if (ox <= oy && ox <= oz) return { normal: new THREE.Vector3(Math.sign(dx), 0, 0), depth: ox };
        return { normal: new THREE.Vector3(0, 0, Math.sign(dz)), depth: oz };
    }

    /**
     * Sphere vs Oriented Bounding Box (OBB).
     * Works for any rotation — a 45° tilted box acts as a slope.
     * The sphere bounces off the slope's actual surface normal.
     */
    _collideSphereVsOBB(posS, rS, posB, halfB, quatB) {
        // Project sphere center into the box's local space
        const invQuat = quatB.clone().invert();
        const localS  = posS.clone().sub(posB).applyQuaternion(invQuat);

        // Closest point on the box surface to the sphere center (in local space)
        const closest = new THREE.Vector3(
            Math.max(-halfB.x, Math.min(localS.x, halfB.x)),
            Math.max(-halfB.y, Math.min(localS.y, halfB.y)),
            Math.max(-halfB.z, Math.min(localS.z, halfB.z)),
        );

        const localDelta = new THREE.Vector3().subVectors(localS, closest);
        const dist = localDelta.length();
        if (dist >= rS) return null;

        // Compute collision normal in local space, then rotate back to world space
        const localNormal = dist > 0.0001
            ? localDelta.normalize()
            : new THREE.Vector3(0, 1, 0);

        const worldNormal = localNormal.clone().applyQuaternion(quatB);

        return { normal: worldNormal, depth: rS - dist };
    }

    // ── Collision resolution ──────────────────────────────────────────────────

    _resolveCollision(a, b, { normal, depth }) {
        const cfgA = this._resolveConfig(a.entity);
        const cfgB = b.entity.physics ? this._resolveConfig(b.entity) : this.defaults;

        const stateA = a.entity.physics.state;
        const stateB = b.type === "dynamic" ? b.entity.physics.state : null;

        const velA = stateA.velocity;
        const velB = stateB ? stateB.velocity : _ZERO;

        // ── 1. Positional correction (de-penetration) ─────────────────────────
        const invMassA = 1 / cfgA.mass;
        const invMassB = stateB ? 1 / cfgB.mass : 0;
        const totalInvMass = invMassA + invMassB;

        if (totalInvMass > 0) {
            const correction = (depth / totalInvMass) * 0.8; // 0.8 = slop factor
            a.entity.entity.position.addScaledVector(normal,  correction * invMassA);
            if (stateB) b.entity.entity.position.addScaledVector(normal, -correction * invMassB);
        }

        // ── 2. Check separation — skip if already moving apart ────────────────
        const relVel          = new THREE.Vector3().subVectors(velA, velB);
        const velAlongNormal  = relVel.dot(normal);
        if (velAlongNormal > 0) return;

        // ── 3. Blend material properties ─────────────────────────────────────
        // Restitution: take the higher value (more energetic material wins)
        const restitution = Math.max(cfgA.restitution, cfgB.restitution);

        // Friction: average the two surfaces
        const friction = (cfgA.friction + (cfgB.friction ?? this.defaults.friction)) / 2;

        // Stickiness: average; amplifies friction and kills bounce
        const stickiness = ((cfgA.stickiness ?? 0) + (cfgB.stickiness ?? 0)) / 2;

        // Stickiness reduces effective bounce
        const effectiveRestitution = restitution * (1 - Math.min(stickiness * 2, 1));

        // ── 4. Normal impulse (bounce) ────────────────────────────────────────
        const impulseMag = -(1 + effectiveRestitution) * velAlongNormal / totalInvMass;
        const impulse    = normal.clone().multiplyScalar(impulseMag);

        velA.addScaledVector(impulse,  invMassA);
        if (stateB) stateB.velocity.addScaledVector(impulse, -invMassB);

        // ── 5. Tangential impulse (friction) ─────────────────────────────────
        const relVelPost    = new THREE.Vector3().subVectors(velA, stateB ? stateB.velocity : _ZERO);
        const tangentRaw    = relVelPost.clone().addScaledVector(normal, -relVelPost.dot(normal));
        const tangentLength = tangentRaw.length();
        if (tangentLength < 0.0001) {
            this._updateGroundFlags(a, normal);
            return;
        }

        const tangent = tangentRaw.divideScalar(tangentLength);
        const velAlongTangent = relVelPost.dot(tangent);

        // Stickiness multiplies effective friction coefficient
        const effectiveFriction = Math.min(friction * (1 + stickiness * 4), 1);

        // Clamp friction impulse to Coulomb's law: |Ft| ≤ μ|Fn|
        const maxFriction     = Math.abs(impulseMag) * effectiveFriction;
        const rawFriction     = -velAlongTangent / totalInvMass;
        const clampedFriction = Math.max(-maxFriction, Math.min(rawFriction, maxFriction));

        const frictionImpulse = tangent.multiplyScalar(clampedFriction);
        velA.addScaledVector(frictionImpulse,  invMassA);
        if (stateB) stateB.velocity.addScaledVector(frictionImpulse, -invMassB);

        // ── 6. Wake up sleeping bodies ────────────────────────────────────────
        stateA.isSleeping = false;
        if (stateB) stateB.isSleeping = false;

        this._updateGroundFlags(a, normal);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** Merge PhysicsManager.defaults with any per-entity overrides. */
    _resolveConfig(entity) {
        const overrides = entity.physics?.config ?? {};
        return { ...this.defaults, ...overrides };
    }

    /** Auto-derive collision size from the entity's geometry + visual scale. */
    _deriveSize(entity, shape) {
        const scale = entity._visual ? entity._visual.scale.clone() : new THREE.Vector3(1, 1, 1);

        if (entity.geometry) {
            entity.geometry.computeBoundingBox();
            entity.geometry.computeBoundingSphere();

            if (shape === "sphere") {
                return (entity.geometry.boundingSphere?.radius ?? 0.5) *
                    Math.max(scale.x, scale.y, scale.z);
            }

            const box = entity.geometry.boundingBox;
            if (box) {
                const half = new THREE.Vector3().subVectors(box.max, box.min).multiplyScalar(0.5);
                return new THREE.Vector3(half.x * scale.x, half.y * scale.y, half.z * scale.z);
            }
        }

        return shape === "sphere"
            ? 0.5
            : new THREE.Vector3(0.5, 0.5, 0.5);
    }

    /** Set isGrounded if the collision normal is mostly upward. */
    _updateGroundFlags(body, normal) {
        if (normal.y > 0.5) {
            body.entity.physics.state.isGrounded  = true;
        }
        body.entity.physics.state.isColliding = true;
    }

    // ── Debug visualisation ───────────────────────────────────────────────────
    //
    //  Each registered body gets two overlays added directly to the scene:
    //
    //    outline   — EdgeGeometry wireframe showing the exact collision shape.
    //                Color encodes body state at a glance:
    //                  Blue   (#2277ff) — static collider
    //                  Green  (#22ff66) — dynamic, awake
    //                  Gray   (#888888) — dynamic, sleeping
    //                  Red    (#ff3300) — dynamic, currently colliding
    //
    //    velArrow  — ArrowHelper showing velocity direction + magnitude.
    //                Only shown on dynamic bodies; hidden when sleeping.

    _createDebugMesh(body) {
        if (!this.parent?.scene) return; // engine not attached yet; will retry in _syncDebugMeshes

        const { shape, size, type } = body;

        // ── Collision outline ─────────────────────────────────────────────────
        let outlineGeo;
        if (shape === "sphere") {
            outlineGeo = new THREE.SphereGeometry(size, 16, 8);
        } else {
            outlineGeo = new THREE.BoxGeometry(size.x * 2, size.y * 2, size.z * 2);
        }

        const outlineMat  = new THREE.LineBasicMaterial({ color: _DEBUG_COLORS.static, depthTest: false, transparent: true, opacity: 0.85 });
        const outline     = new THREE.LineSegments(new THREE.EdgesGeometry(outlineGeo), outlineMat);
        outline.renderOrder = 999; // always draw on top
        this.parent.scene.add(outline);

        // ── Velocity arrow (dynamic bodies only) ─────────────────────────────
        let velArrow = null;
        if (type === "dynamic") {
            velArrow = new THREE.ArrowHelper(
                new THREE.Vector3(0, 1, 0), // direction placeholder
                new THREE.Vector3(),         // origin placeholder
                1,                           // length placeholder
                _DEBUG_COLORS.arrow,
                0.2,                         // head length
                0.1,                         // head width
            );
            velArrow.renderOrder = 999;
            this.parent.scene.add(velArrow);
        }

        this._debugMeshes.set(body, { outline, velArrow });
    }

    _destroyDebugMesh(body) {
        const dbg = this._debugMeshes.get(body);
        if (!dbg || !this.parent?.scene) return;

        this.parent.scene.remove(dbg.outline);
        dbg.outline.geometry.dispose();
        dbg.outline.material.dispose();

        if (dbg.velArrow) {
            this.parent.scene.remove(dbg.velArrow);
        }

        this._debugMeshes.delete(body);
    }

    _destroyAllDebugMeshes() {
        for (const body of this._debugMeshes.keys()) {
            this._destroyDebugMesh(body);
        }
    }

    _syncDebugMeshes() {
        for (const body of this._bodies) {
            // Lazily create mesh if engine wasn't ready during addBody()
            if (!this._debugMeshes.has(body)) this._createDebugMesh(body);

            const dbg = this._debugMeshes.get(body);
            if (!dbg) continue;

            const { entity, type } = body;
            const pos = entity.entity.position;
            const rot = entity.entity.quaternion;

            // ── Sync outline transform ────────────────────────────────────────
            dbg.outline.position.copy(pos);
            dbg.outline.quaternion.copy(rot);

            // ── Pick outline color based on current state ─────────────────────
            let color;
            if (type === "static") {
                color = _DEBUG_COLORS.static;
            } else {
                const state = entity.physics?.state;
                if (state?.isColliding)     color = _DEBUG_COLORS.colliding;
                else if (state?.isSleeping) color = _DEBUG_COLORS.sleeping;
                else                        color = _DEBUG_COLORS.dynamic;
            }
            dbg.outline.material.color.setHex(color);

            // ── Sync velocity arrow ───────────────────────────────────────────
            if (dbg.velArrow && type === "dynamic") {
                const vel = entity.physics?.state?.velocity ?? _ZERO;
                const speed = vel.length();

                if (speed > 0.01) {
                    dbg.velArrow.visible = true;
                    dbg.velArrow.position.copy(pos);
                    dbg.velArrow.setDirection(vel.clone().normalize());
                    dbg.velArrow.setLength(
                        Math.min(speed, 10),  // cap visual length at 10 units
                        Math.min(speed * 0.2, 0.5),
                        Math.min(speed * 0.1, 0.25),
                    );
                } else {
                    dbg.velArrow.visible = false;
                }
            }
        }
    }
};

// Reusable zero vector — never modify this
const _ZERO = Object.freeze(new THREE.Vector3(0, 0, 0));

// ── Debug overlay colors ──────────────────────────────────────────────────────
const _DEBUG_COLORS = {
    static:    0x2277ff, // blue   — immovable collider
    dynamic:   0x22ff66, // green  — awake dynamic body
    sleeping:  0x888888, // gray   — sleeping (velocity below threshold)
    colliding: 0xff3300, // red    — actively colliding this frame
    arrow:     0xffee00, // yellow — velocity arrow

}