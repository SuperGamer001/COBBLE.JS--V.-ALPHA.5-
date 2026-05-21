import * as THREE from "three";
import CobblePlugin from "./plugin.js";
import Entity from "./entity.js";

export default class EntityManager extends CobblePlugin {
    constructor() {
        // Plugin details
        super();
        this.pluginName = "Entity Manager"; // The name of the plugin

        // Plugin properties
        this.entities = [];
    }

    addBox() {
        // Placeholder for adding a box entity to the scene.
        let entity = new Entity();
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        
        entity.applyMesh(geometry);
        this.addEntity(entity);

        return entity;
    }

    // Adds 
    addEntity(entity) {
        this.parent.scene.add(entity.entity);
        this.entities.push(entity);
    }

    update(dt) {
        for (const entity of this.entities) {
            entity.update(dt);
        }
    }
}