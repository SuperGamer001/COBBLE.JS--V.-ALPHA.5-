import * as THREE from "three";
import CobblePlugin from "./plugin.js";

export default class Entity extends CobblePlugin {
    constructor(name = "Entity"+Math.floor(Math.random() * 1000)) {
        super();
        this.pluginName = "Entity";
        this.name = name;

        this.entity = new THREE.Object3D(); // Transform/pivot node — used for position, rotation, parenting

        this.geometry = new THREE.BoxGeometry(0, 0, 0);
        this.material = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.5,
            metalness: 0
        });

        this._visual = new THREE.Mesh(this.geometry, this.material); // Visual only — scale lives here
        this.entity.add(this._visual);
    }

    applyMesh(geometry) {
        this.geometry = geometry;
        this._visual.geometry = geometry;
    }

    applyMaterial(material) {
        this.material = material;
        this._visual.material = material;
    }

    setScale({ x = null, y = null, z = null }) {
        // Scale applies to the visual mesh only — never bleeds into children
        if (x !== null) this._visual.scale.x = x;
        if (y !== null) this._visual.scale.y = y;
        if (z !== null) this._visual.scale.z = z;
    }

    attachEntity(entity) {
        const child = entity?.entity ?? entity;
        if (child) {
            this.entity.add(child); // Attaches pivot-to-pivot, scale never crosses the boundary
        }
    }






    applyTexture(url, repeatX = 1, repeatY = 1) {
        const loader = new THREE.TextureLoader();
        loader.load(url, (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(repeatX, repeatY);
            this._visual.material.map = texture;
            this._visual.material.needsUpdate = true;
        });
    }

    applyLightmap(url, repeatX = 1, repeatY = 1) {
        const loader = new THREE.TextureLoader();
        loader.load(url, (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(repeatX, repeatY);
            this._visual.material.lightMap = texture;
            this._visual.material.needsUpdate = true;
        });
    }

    applyNormalMap(url, repeatX = 1, repeatY = 1) {
        const loader = new THREE.TextureLoader();
        loader.load(url, (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(repeatX, repeatY);
            this._visual.material.normalMap = texture;
            this._visual.material.needsUpdate = true;
        });
    }
}