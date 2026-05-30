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
//  Body types supported:       "dynamic"        | "static" | "ghost"
//
//  Ghost bodies:
//      physics.addBody(ring, { type: "ghost", shape: "sphere" });
//
//      Ghost bodies phase through all other bodies — no push-out or velocity
//      change is ever applied. They still participate in overlap detection,
//      so the "collision" event fires whenever anything touches them.
//      Ideal for collectables, triggers, and secret entrances.
//
//  Collision events:
//      physics.on("collision", ({ entities }) => {
//          const [a, b] = entities;   // the two overlapping entities
//          // a or b may be a ghost — check body type if needed:
//          //   physics.getBodyType(a) === "ghost"
//      });
//      physics.off("collision", handler);   // unsubscribe
// ─────────────────────────────────────────────

export default class PhysicsManager extends CobblePlugin {
    constructor() {
        super();
        this.pluginName = "Physics Manager";

        // Browser CustomEvent name fired on every detected overlap.
        // Listen with: window.addEventListener("cobbleCollision", (e) => console.log(e.detail))
        this.collisionCustomEventName = "cobbleCollision";

        // ── Global physics defaults ───────────────────────────────────────────
        this.defaults = {
            gravity:         new THREE.Vector3(0, -9.8, 0),
            mass:            1,
            restitution:     0.4,
            friction:        0.5,
            stickiness:      0.0,
            airResistance:   0.1,
            sleepThreshold:  0.0,
            collisionType: "ghost",
        };
        // ─────────────────────────────────────────────────────────────────────

        this._bodies      = [];
        this._debugMeshes = new Map();
        this._debug       = false;

        // ── Event listeners ───────────────────────────────────────────────────
        // Internal map of eventName → Set of handler functions.
        // Currently emitted events:
        //   "collision"  →  { entities: [entityA, entityB] }
        this._listeners = new Map();
        // ─────────────────────────────────────────────────────────────────────

        Object.defineProperty(this, "debug", {
            get: () => this._debug,
            set: (value) => {
                this._debug = !!value;
                if (!this._debug) this._destroyAllDebugMeshes();
            },
        });
    }

    // ── Event system ──────────────────────────────────────────────────────────

    /**
     * Subscribe to a PhysicsManager event.
     *
     * @param {string}   eventName  - Name of the event (e.g. "collision").
     * @param {Function} handler    - Callback receiving the event payload.
     *
     * @example
     * physics.on("collision", ({ entities }) => {
     *     const [a, b] = entities;
     *     if (a === ring || b === ring) ring.collect();
     * });
     */
    on(eventName, handler) {
        if (!this._listeners.has(eventName)) {
            this._listeners.set(eventName, new Set());
        }
        this._listeners.get(eventName).add(handler);
    }

    /**
     * Unsubscribe a previously registered handler.
     *
     * @param {string}   eventName
     * @param {Function} handler
     */
    off(eventName, handler) {
        this._listeners.get(eventName)?.delete(handler);
    }

    /**
     * Emit an event to all registered handlers.
     * @param {string} eventName
     * @param {*}      payload
     */
    _emit(eventName, payload) {
        const handlers = this._listeners.get(eventName);
        if (!handlers) return;
        for (const fn of handlers) {
            try { fn(payload); }
            catch (err) { console.error(`PhysicsManager: error in "${eventName}" handler`, err); }
        }
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Register an entity as a physics body.
     *
     * @param {Entity}  entity          - The Cobble Entity to register.
     * @param {object}  options
     * @param {string}  options.type    - "dynamic" (simulated) | "static" (immovable) | "ghost" (no collision response).
     * @param {string}  options.shape   - "box" | "sphere".
     * @param {*}       options.size    - Optional manual size.
     *                                   Box   → THREE.Vector3 of half-extents.
     *                                   Sphere → number radius.
     *                                   Omit to auto-derive from entity geometry + scale.
     * @returns {Entity} The same entity, now with entity.physics attached.
     */
    addBody(entity, { type = "dynamic", shape = "box", size = null, ignore = [] } = {}) {
        entity.physics = {
            state: {
                velocity:        new THREE.Vector3(),
                angularVelocity: new THREE.Vector3(),
                isGrounded:      false,
                isColliding:     false,
                isSleeping:      false,
            },
            config: {
                ignore: ignore, // optional array of other entities to ignore collisions with
            },
        };

        if (size === null) size = this._deriveSize(entity, shape);

        const body = { entity, type, shape, size };
        this._bodies.push(body);
        if (this._debug) this._createDebugMesh(body);
        return entity;
    }

    /**
     * Have entityA ignore collisions with entityB (one-way).
     * @param {Entity} entityA
     * @param {Entity} entityB
     */
    ignore(entityA, entityB) {
        entityA.physics.config.ignore.push(entityB);
    }

    /**
     * Have both given entities ignore each other (two-way).
     * @param {Entity} entityA
     * @param {Entity} entityB
     */
    bothIgnore(entityA, entityB) {
        this.ignore(entityA, entityB);
        this.ignore(entityB, entityA);
    }

    /**
     * Stop ignoring collisions between entityA and entityB.
     * @param {Entity} entityA
     * @param {Entity} entityB
     */
    stopIgnoring(entityA, entityB) {
        entityA.physics.config.ignore = entityA.physics.config.ignore.filter((e) => e !== entityB);
        entityB.physics.config.ignore = entityB.physics.config.ignore.filter((e) => e !== entityA);
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
     * Returns the body type of a registered entity, or null if not registered.
     * Useful inside collision handlers to check whether a participant is a ghost.
     *
     * @param {Entity} entity
     * @returns {"dynamic"|"static"|"ghost"|null}
     *
     * @example
     * physics.on("collision", ({ entities }) => {
     *     const [a, b] = entities;
     *     if (physics.getBodyType(a) === "ghost" || physics.getBodyType(b) === "ghost") {
     *         // one of them is a trigger / collectable
     *     }
     * });
     */
    getBodyType(entity) {
        return this._bodies.find((b) => b.entity === entity)?.type ?? null;
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

            const g = cfg.gravity instanceof THREE.Vector3
                ? cfg.gravity
                : new THREE.Vector3(cfg.gravity.x ?? 0, cfg.gravity.y ?? -9.8, cfg.gravity.z ?? 0);

            state.velocity.addScaledVector(g, dt);
            state.velocity.multiplyScalar(1 - (cfg.airResistance / 100) * dt * 60);
            entity.entity.position.addScaledVector(state.velocity, dt);

            state.isGrounded  = false;
            state.isColliding = false;

            if (state.velocity.lengthSq() < cfg.sleepThreshold * cfg.sleepThreshold) {
                state.velocity.set(0, 0, 0);
                state.isSleeping = true;
            }
        }
    }

    // ── Collision pipeline ────────────────────────────────────────────────────

    _detectAndResolveCollisions() {
        // Detect overlaps for all unordered pairs.
        // This ensures collision events fire for:
        //   - dynamic vs static
        //   - dynamic vs ghost
        //   - dynamic vs dynamic
        //   - ghost vs ghost
        //   - static vs ghost
        // (Resolution is still only applied when at least one body is dynamic,
        //  and never when either body is a ghost.)
        for (let i = 0; i < this._bodies.length; i++) {
            const a = this._bodies[i];
            for (let j = i + 1; j < this._bodies.length; j++) {
                const b = this._bodies[j];
                const ignored = a.entity.physics.config.ignore.includes(b.entity)

                // Static-static overlaps are usually irrelevant and can be costly
                // to check in large scenes.
                if (a.type === "static" && b.type === "static") continue;

                const hit = this._detectCollision(a, b);
                if (!hit) continue;

                // ── Emit collision event (once per unique pair per frame) ─────
                this._emit("collision", { entities: [a.entity, b.entity] });
                this._dispatchCollisionCustomEvent(a.entity, b.entity);

                // If either body ignores the other, let them pass through.
                if (ignored) continue;

                // ── Skip resolution when either participant is a ghost ───────
                if (a.type === "ghost" || b.type === "ghost") continue;

                // ── Apply resolution if possible (at least one dynamic) ───────
                if (a.type === "dynamic") {
                    this._resolveCollision(a, b, hit);
                } else if (b.type === "dynamic") {
                    this._resolveCollision(b, a, { normal: hit.normal.clone().negate(), depth: hit.depth });
                }
            }
        }
    }

    _dispatchCollisionCustomEvent(entityA, entityB) {
        if (typeof window === "undefined" || typeof window.dispatchEvent !== "function") return;
        if (typeof CustomEvent === "undefined") return;

        const detail = this._buildCollisionDetail(entityA, entityB);
        window.dispatchEvent(new CustomEvent(this.collisionCustomEventName, { detail }));
    }

    _buildCollisionDetail(entityA, entityB) {
        const out = {};
        const keyA = this._uniqueCollisionKey(out, entityA?.name ?? "EntityA");
        const keyB = this._uniqueCollisionKey(out, entityB?.name ?? "EntityB");
        out[keyA] = entityA;
        out[keyB] = entityB;
        return out;
    }

    _uniqueCollisionKey(target, base) {
        if (!(base in target)) return base;
        let i = 2;
        while (`${base}#${i}` in target) i++;
        return `${base}#${i}`;
    }

    // ── Collision detection ───────────────────────────────────────────────────

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
            return this._collideSphereVsOBB(posA, a.size, posB, b.size, rotB);
        }

        if (a.shape === "box" && b.shape === "sphere") {
            const hit = this._collideSphereVsOBB(posB, b.size, posA, a.size, rotA);
            if (hit) hit.normal.negate();
            return hit;
        }

        return null;
    }

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

    _collideBoxVsBox(posA, halfA, posB, halfB) {
        const dx = posA.x - posB.x;
        const dy = posA.y - posB.y;
        const dz = posA.z - posB.z;
        const ox = halfA.x + halfB.x - Math.abs(dx);
        const oy = halfA.y + halfB.y - Math.abs(dy);
        const oz = halfA.z + halfB.z - Math.abs(dz);
        if (ox <= 0 || oy <= 0 || oz <= 0) return null;
        if (oy <= ox && oy <= oz) return { normal: new THREE.Vector3(0, Math.sign(dy), 0), depth: oy };
        if (ox <= oy && ox <= oz) return { normal: new THREE.Vector3(Math.sign(dx), 0, 0), depth: ox };
        return { normal: new THREE.Vector3(0, 0, Math.sign(dz)), depth: oz };
    }

    _collideSphereVsOBB(posS, rS, posB, halfB, quatB) {
        const invQuat = quatB.clone().invert();
        const localS  = posS.clone().sub(posB).applyQuaternion(invQuat);
        const closest = new THREE.Vector3(
            Math.max(-halfB.x, Math.min(localS.x, halfB.x)),
            Math.max(-halfB.y, Math.min(localS.y, halfB.y)),
            Math.max(-halfB.z, Math.min(localS.z, halfB.z)),
        );
        const localDelta = new THREE.Vector3().subVectors(localS, closest);
        const dist = localDelta.length();
        if (dist >= rS) return null;
        const localNormal = dist > 0.0001 ? localDelta.normalize() : new THREE.Vector3(0, 1, 0);
        return { normal: localNormal.clone().applyQuaternion(quatB), depth: rS - dist };
    }

    // ── Collision resolution ──────────────────────────────────────────────────

    _resolveCollision(a, b, { normal, depth }) {
        const cfgA = this._resolveConfig(a.entity);
        const cfgB = b.entity.physics ? this._resolveConfig(b.entity) : this.defaults;

        const stateA = a.entity.physics.state;
        const stateB = b.type === "dynamic" ? b.entity.physics.state : null;

        const velA = stateA.velocity;
        const velB = stateB ? stateB.velocity : _ZERO;

        const invMassA = 1 / cfgA.mass;
        const invMassB = stateB ? 1 / cfgB.mass : 0;
        const totalInvMass = invMassA + invMassB;

        if (totalInvMass > 0) {
            const correction = (depth / totalInvMass) * 0.8;
            a.entity.entity.position.addScaledVector(normal,  correction * invMassA);
            if (stateB) b.entity.entity.position.addScaledVector(normal, -correction * invMassB);
        }

        const relVel         = new THREE.Vector3().subVectors(velA, velB);
        const velAlongNormal = relVel.dot(normal);
        if (velAlongNormal > 0) return;

        const restitution         = Math.max(cfgA.restitution, cfgB.restitution);
        const friction            = (cfgA.friction + (cfgB.friction ?? this.defaults.friction)) / 2;
        const stickiness          = ((cfgA.stickiness ?? 0) + (cfgB.stickiness ?? 0)) / 2;
        const effectiveRestitution = restitution * (1 - Math.min(stickiness * 2, 1));

        const impulseMag = -(1 + effectiveRestitution) * velAlongNormal / totalInvMass;
        const impulse    = normal.clone().multiplyScalar(impulseMag);

        velA.addScaledVector(impulse,  invMassA);
        if (stateB) stateB.velocity.addScaledVector(impulse, -invMassB);

        const relVelPost    = new THREE.Vector3().subVectors(velA, stateB ? stateB.velocity : _ZERO);
        const tangentRaw    = relVelPost.clone().addScaledVector(normal, -relVelPost.dot(normal));
        const tangentLength = tangentRaw.length();
        if (tangentLength < 0.0001) {
            this._updateGroundFlags(a, normal);
            return;
        }

        const tangent             = tangentRaw.divideScalar(tangentLength);
        const velAlongTangent     = relVelPost.dot(tangent);
        const effectiveFriction   = Math.min(friction * (1 + stickiness * 4), 1);
        const maxFriction         = Math.abs(impulseMag) * effectiveFriction;
        const rawFriction         = -velAlongTangent / totalInvMass;
        const clampedFriction     = Math.max(-maxFriction, Math.min(rawFriction, maxFriction));

        const frictionImpulse = tangent.multiplyScalar(clampedFriction);
        velA.addScaledVector(frictionImpulse,  invMassA);
        if (stateB) stateB.velocity.addScaledVector(frictionImpulse, -invMassB);

        stateA.isSleeping = false;
        if (stateB) stateB.isSleeping = false;

        this._updateGroundFlags(a, normal);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    _resolveConfig(entity) {
        return { ...this.defaults, ...(entity.physics?.config ?? {}) };
    }

    _deriveSize(entity, shape) {
        const scale = entity._visual ? entity._visual.scale.clone() : new THREE.Vector3(1, 1, 1);
        const absScale = new THREE.Vector3(Math.abs(scale.x), Math.abs(scale.y), Math.abs(scale.z));
        if (entity.geometry) {
            entity.geometry.computeBoundingBox();
            entity.geometry.computeBoundingSphere();
            if (shape === "sphere") {
                return (entity.geometry.boundingSphere?.radius ?? 0.5) *
                    Math.max(absScale.x, absScale.y, absScale.z);
            }
            const box = entity.geometry.boundingBox;
            if (box) {
                const half = new THREE.Vector3().subVectors(box.max, box.min).multiplyScalar(0.5);
                return new THREE.Vector3(half.x * absScale.x, half.y * absScale.y, half.z * absScale.z);
            }
        }
        return shape === "sphere" ? 0.5 * Math.max(absScale.x, absScale.y, absScale.z) : new THREE.Vector3(0.5, 0.5, 0.5);
    }

    _updateGroundFlags(body, normal) {
        if (normal.y > 0.5) body.entity.physics.state.isGrounded = true;
        body.entity.physics.state.isColliding = true;
    }

    // ── Debug visualisation ───────────────────────────────────────────────────
    //
    //  Outline colors:
    //    Blue   (#2277ff) — static
    //    Cyan   (#00eeff) — ghost  ← new
    //    Green  (#22ff66) — dynamic, awake
    //    Gray   (#888888) — dynamic, sleeping
    //    Red    (#ff3300) — dynamic, colliding

    _createDebugMesh(body) {
        if (!this.parent?.scene) return;

        const { shape, size, type } = body;

        let outlineGeo;
        if (shape === "sphere") {
            outlineGeo = new THREE.SphereGeometry(size, 16, 8);
        } else {
            outlineGeo = new THREE.BoxGeometry(size.x * 2, size.y * 2, size.z * 2);
        }

        // Ghost outlines are dashed/faded to visually distinguish them
        const isGhost = type === "ghost";
        const outlineMat = new THREE.LineBasicMaterial({
            color:       isGhost ? _DEBUG_COLORS.ghost : _DEBUG_COLORS.static,
            depthTest:   false,
            transparent: true,
            opacity:     isGhost ? 0.45 : 0.85,
        });
        const outline = new THREE.LineSegments(new THREE.EdgesGeometry(outlineGeo), outlineMat);
        outline.renderOrder = 999;
        this.parent.scene.add(outline);

        let velArrow = null;
        if (type === "dynamic") {
            velArrow = new THREE.ArrowHelper(
                new THREE.Vector3(0, 1, 0),
                new THREE.Vector3(),
                1,
                _DEBUG_COLORS.arrow,
                0.2,
                0.1,
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
        if (dbg.velArrow) this.parent.scene.remove(dbg.velArrow);
        this._debugMeshes.delete(body);
    }

    _destroyAllDebugMeshes() {
        for (const body of this._debugMeshes.keys()) this._destroyDebugMesh(body);
    }

    _syncDebugMeshes() {
        for (const body of this._bodies) {
            if (!this._debugMeshes.has(body)) this._createDebugMesh(body);
            const dbg = this._debugMeshes.get(body);
            if (!dbg) continue;

            const { entity, type } = body;
            const pos = entity.entity.position;
            const rot = entity.entity.quaternion;

            dbg.outline.position.copy(pos);
            dbg.outline.quaternion.copy(rot);

            // Ghost outlines always stay cyan; other types change by state
            let color;
            if (type === "ghost") {
                color = _DEBUG_COLORS.ghost;
            } else if (type === "static") {
                color = _DEBUG_COLORS.static;
            } else {
                const state = entity.physics?.state;
                if (state?.isColliding)     color = _DEBUG_COLORS.colliding;
                else if (state?.isSleeping) color = _DEBUG_COLORS.sleeping;
                else                        color = _DEBUG_COLORS.dynamic;
            }
            dbg.outline.material.color.setHex(color);

            if (dbg.velArrow && type === "dynamic") {
                const vel   = entity.physics?.state?.velocity ?? _ZERO;
                const speed = vel.length();
                if (speed > 0.01) {
                    dbg.velArrow.visible = true;
                    dbg.velArrow.position.copy(pos);
                    dbg.velArrow.setDirection(vel.clone().normalize());
                    dbg.velArrow.setLength(
                        Math.min(speed, 10),
                        Math.min(speed * 0.2, 0.5),
                        Math.min(speed * 0.1, 0.25),
                    );
                } else {
                    dbg.velArrow.visible = false;
                }
            }
        }
    }
}

// Reusable zero vector — never modify this
const _ZERO = Object.freeze(new THREE.Vector3(0, 0, 0));

// ── Debug overlay colors ──────────────────────────────────────────────────────
const _DEBUG_COLORS = {
    static:    0x2277ff, // blue   — immovable collider
    ghost:     0x00eeff, // cyan   — ghost / trigger volume
    dynamic:   0x22ff66, // green  — awake dynamic body
    sleeping:  0x888888, // gray   — sleeping
    colliding: 0xff3300, // red    — actively colliding this frame
    arrow:     0xffee00, // yellow — velocity arrow
};